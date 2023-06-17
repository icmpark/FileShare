import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAuthCommand } from './update-auth.command';
import authConfig from '../../../config/authConfig';
import { ConfigType } from '@nestjs/config';
import { AuthFactory } from '../../domain/auth.factory';
import  { ITokenAdapter } from '../../domain/adapter/itoken.adapter';
import { TokenPayload } from '../../domain/token-payload';

@Injectable()
@CommandHandler(UpdateAuthCommand)
export class UpdateAuthCommandHandler implements ICommandHandler<UpdateAuthCommand> {
    constructor(
        private authFactory: AuthFactory,
        @Inject('TokenAdapter') private tokenAdapter: ITokenAdapter,
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    ) { }

    async execute(command: UpdateAuthCommand): Promise<string> {
        const { userId } = command;
        const payload = new TokenPayload(userId, 'refreshToken');
        const refreshToken = this.tokenAdapter.create(payload, this.config.refresh_expiresIn);
        await this.authFactory.update(userId, refreshToken);
        return refreshToken;
    }
}