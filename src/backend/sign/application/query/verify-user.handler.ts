import { Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { FindUserQuery } from '../../../user/application/query/user-find.query.js';
import { User } from '../../../user/domain/user.js';
import { VerifyUserQuery } from './verify-user.query.js';
import bcrypt from 'bcrypt'

@Injectable()
@QueryHandler(VerifyUserQuery)
export class VerifyUserQueryHandler implements IQueryHandler<VerifyUserQuery> {
    constructor(
        private queryBus: QueryBus,
    ) { }

    async execute(command: VerifyUserQuery): Promise<boolean> {
        const { userId, password } = command;
        const query = new FindUserQuery(userId);
        const user: User = await this.queryBus.execute(query);
        return (user != null) && await bcrypt.compare(password, user.password);
    }
}