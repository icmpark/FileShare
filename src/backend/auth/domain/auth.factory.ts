import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { AuthUpdatedEvent } from './event/auth-update.event';
import { Auth } from './auth';
import { IAuthRepository } from './repository/iauth.repository';


@Injectable()
export class AuthFactory {
    constructor(
        @Inject('AuthRepository') private authRepository: IAuthRepository,
        private eventBus: EventBus
    ) { }

    async update(
        userId: string,
        refreshToken: string
    ): Promise<Auth> {
        const auth = this.reconstitute(userId, refreshToken);
        await this.authRepository.update(auth);
        this.eventBus.publish(new AuthUpdatedEvent(auth));
        return auth;
    }

    reconstitute(
        userId: string,
        refreshToken: string
    ): Auth {
        return new Auth(userId, refreshToken);
    }
}