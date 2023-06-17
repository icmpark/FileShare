import { Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CreateTokenCommand } from '../../../auth/application/command/create-token.command';
import { UpdateAuthCommand } from '../../../auth/application/command/update-auth.command';
import { User } from '../../../user/domain/user';
import { VerifyUserQuery } from '../query/verify-user.query';
import { LoginCommand } from './login.command';

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