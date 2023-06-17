import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import authConfig from '../../../config/authConfig.js';
import { ConfigType } from '@nestjs/config';
import  { ITokenAdapter } from '../../domain/adapter/itoken.adapter.js';
import { TokenPayload } from '../../domain/token-payload.js';
import { CreateTokenCommand } from './create-token.command.js';

@Injectable()
@CommandHandler(CreateTokenCommand)
export class CreateTokenCommandHandler implements ICommandHandler<CreateTokenCommand> {
    constructor(
        @Inject('TokenAdapter') private tokenAdapter: ITokenAdapter,
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    ) { }

    async execute(command: CreateTokenCommand): Promise<string> {
        const { userId } = command;
        const payload = new TokenPayload(userId, 'accessToken');
        const accessToken = this.tokenAdapter.create(payload, this.config.expiresIn);
        return accessToken;
    }
}