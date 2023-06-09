import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from '../../domain/user.factory.js';
import { UpdateUserCommand } from './user-update.command.js';

@Injectable()
@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand> {
    constructor(
        private userFactory: UserFactory,
    ) { }

    async execute(command: UpdateUserCommand) {
        const { userId, userName, password } = command;
        this.userFactory.update(userId, userName, password);
    }
}