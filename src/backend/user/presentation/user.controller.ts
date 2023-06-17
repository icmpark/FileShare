import { Body, Controller, Param, Post, Get, UseGuards, Delete, Patch } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserExisted } from './pipe/user-existed.pipe.js';
import { UserGuard } from './guard/user-guard.js';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/command/user-create.command.js';
import { DeleteUserCommand } from '../application/command/user-delete.command.js';
import { UpdateUserCommand } from '../application/command/user-update.command.js';
import { FindUserQuery } from '../application/query/user-find.query.js';
import { User } from '../domain/user.js';

@Controller('users')
export class UserController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus
    ) { }

    @Post('/:nUserId')
    async createUser(
        @Param('nUserId', UserExisted) userId: string,
        @Body() dto: CreateUserDto
    ): Promise<void> {
        const { userName, password } = dto;
        const command = new CreateUserCommand(userId, userName, password);
        this.commandBus.execute(command);
    }

    @Delete('/:userId')
    @UseGuards(UserGuard)
    async deleteUser(
        @Param('userId', UserExisted) userId: string
    ): Promise<void> {
        const command = new DeleteUserCommand(userId);
        this.commandBus.execute(command);
    }
    
    @Patch('/:userId')
    @UseGuards(UserGuard)
    async updateUser(
        @Param('userId', UserExisted) userId: string,
        @Body() dto: UpdateUserDto
    ): Promise<void> {
        const { userName, password } = dto;
        const command = new UpdateUserCommand(userId, userName, password);
        this.commandBus.execute(command);
    }

    @Get('/:userId')
    @UseGuards(UserGuard)
    async findUser(
        @Param('userId', UserExisted) userId: string
    ): Promise<{[key: string]: string}> {
        const query = new FindUserQuery(userId);
        const user: User = await this.queryBus.execute(query);
        return {
            userName: user.userName
        };
    }
}
