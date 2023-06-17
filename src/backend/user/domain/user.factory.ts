import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { UserCreatedEvent } from './event/user-create.event.js';
import { UserUpdatedEvent } from './event/user-update.event.js';
import { UserDeletedEvent } from './event/user-delete.event.js';
import { User } from './user.js';
import { IUserRepository } from './repository/iuser.repository.js';

@Injectable()
export class UserFactory {
    constructor(
        @Inject('UserRepository') private userRepository: IUserRepository,
        private eventBus: EventBus,
        
    ) { }

    async create(
        userId: string,
        userName: string,
        password: string,
    ): Promise<User> {
        const user = new User(userId, userName, password);
        await this.userRepository.create(user);
        this.eventBus.publish(new UserCreatedEvent(user));
        return user;
    }

    async update(
        userId: string,
        userName?: string,
        password?: string
    ): Promise<void> {
        await this.userRepository.update(userId, userName, password);
        this.eventBus.publish(new UserUpdatedEvent(userId, userName, password));
    }

    async delete(userId: string): Promise<void> {
        await this.userRepository.delete(userId);
        this.eventBus.publish(new UserDeletedEvent(userId));
    }


    reconstitute(
        userId: string,
        name: string,
        password: string,
    ): User {
        return new User(userId, name, password);
    }
}