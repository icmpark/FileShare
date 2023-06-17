import { Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CreateTokenCommand } from '../../../auth/application/command/create-token.command.js';
import { UpdateAuthCommand } from '../../../auth/application/command/update-auth.command.js';
import { User } from '../../../user/domain/user.js';
import { VerifyUserQuery } from '../query/verify-user.query.js';
import { LoginCommand } from './login.command.js';

@Injectable()
@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
    constructor(
        private queryBus: QueryBus,
        private commandBus: CommandBus
    ) { }

    async execute(command: LoginCommand): Promise<string[] | null> {
        const { userId, password } = command;
        const userQuery = new VerifyUserQuery(userId, password);
        const isExisted: boolean = await this.queryBus.execute(userQuery);

        if (!isExisted)
            return null;
        
        const tokenCommand = new CreateTokenCommand(userId);
        const authCommand = new UpdateAuthCommand(userId);

        const accessToken = await this.commandBus.execute(tokenCommand);
        const refreshToken = await this.commandBus.execute(authCommand);

        return [accessToken, refreshToken];
    }
}