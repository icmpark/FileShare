import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from '../../domain/user.factory';
import { DeleteUserCommand } from './user-delete.command';

@Injectable()
@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler implements ICommandHandler<DeleteUserCommand> {
    constructor(
        private userFactory: UserFactory,
    ) { }

    async execute(command: DeleteUserCommand) {
        const { userId } = command;
        this.userFactory.delete(userId);
    }
}