import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './user-create.command.js';
import { UserFactory } from '../../domain/user.factory.js';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        private userFactory: UserFactory,
    ) { }

    async execute(command: CreateUserCommand): Promise<void> {
        const { userId, userName, password } = command;
        this.userFactory.create(userId, userName, password);
    }
}