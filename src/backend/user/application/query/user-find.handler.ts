import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IUserRepository } from '../../domain/repository/iuser.repository.js';
import { User } from '../../domain/user.js';
import { FindUserQuery } from './user-find.query.js';

@QueryHandler(FindUserQuery)
export class FindUserQueryHandler implements IQueryHandler<FindUserQuery> {
    constructor(
        @Inject('UserRepository') private userRepository: IUserRepository,
    ) { }

    async execute(query: FindUserQuery): Promise<User> {
        const { userId } = query;

        let user;

        if (typeof userId == 'string')
            user = await this.userRepository.findByUserId(userId);
        else
            user = await this.userRepository.findByObjectId(userId);
        return user;
    }
}