import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteAuthCommand } from './delete-auth.command.js';
import { IAuthRepository } from '../../domain/repository/iauth.repository.js';

@Injectable()
@CommandHandler(DeleteAuthCommand)
export class DeleteAuthCommandHandler implements ICommandHandler<DeleteAuthCommand> {
    constructor(
        @Inject('AuthRepository') private authRepository: IAuthRepository
    ) { }

    async execute(command: DeleteAuthCommand): Promise<void> {
        const { userId } = command;
        await this.authRepository.delete(userId);
    }
}