import { BadRequestException, Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { Response } from 'express';
import { SignGuard } from './guard/sign-guard.js';
import { Auth } from '../../utils/deco/auth.js';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand } from '../application/command/login.command.js';
import { CreateTokenCommand } from '../../auth/application/command/create-token.command.js';
import { SignTokenGuard } from './guard/sign-token-guard.js';
import { UserExisted } from '../../user/presentation/pipe/user-existed.pipe.js';

@Controller('sign')
export class SignController {
    constructor (
        private commandBus: CommandBus
    ) {}

    @Post('/login')
    async login(@Res({ passthrough: true }) res: Response, @Body() dto: LoginAuthDto): Promise<{[name: string]: string}> {
        const { userId, password } = dto;

        const command = new LoginCommand(userId, password);
        const result: string[] | null = await this.commandBus.execute(command);

        if (result == null)
            throw new BadRequestException('Invalid Login Request')

        const [accessToken, refreshToken] = result;

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return {token: accessToken}
    }

    @UseGuards(SignGuard)
    @Post('/slient_update')
    async slient_update(@Auth('userId', UserExisted) userId: string): Promise<{[name: string]: string}> {
        const command = new CreateTokenCommand(userId);
        const accessToken = await this.commandBus.execute(command);
        return {token: accessToken};
    }

    @UseGuards(SignTokenGuard)
    @Get('/decode')
    async decode(@Auth('userId', UserExisted) userId: string): Promise<{[name: string]: string}> {
        return {userId: userId};
    }
}