import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserDeletedEvent } from '../../../user/domain/event/user-delete.event.js';
import { IAuthRepository } from '../../domain/repository/iauth.repository.js';

@EventsHandler(UserDeletedEvent)
export class AuthUserDeletedEventHandler implements IEventHandler<UserDeletedEvent> {
    constructor(
        @Inject('AuthRepository') private authRepository: IAuthRepository
    ) { }

    async handle(event: UserDeletedEvent) {
        switch (event.name) {
            case UserDeletedEvent.name: {
                const { userId } = event as UserDeletedEvent;
                await this.authRepository.delete(userId);
                break;
            }
            default:
                break;
        }
    }
}