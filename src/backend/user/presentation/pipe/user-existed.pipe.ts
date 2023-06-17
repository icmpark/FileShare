import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common';
import { User } from '../../domain/user.js';
import { QueryBus } from '@nestjs/cqrs';
import { FindUserQuery } from '../../application/query/user-find.query.js';

@Injectable()
export class UserExisted implements PipeTransform<any> {
    constructor(private queryBus: QueryBus) { }

    async transform(value: any, metadata: ArgumentMetadata) {
        const data = metadata.data;
        const query = new FindUserQuery(value as string);
        const user: User = await this.queryBus.execute(query);

        if (data == 'userId' && user == null)
            throw new BadRequestException({messages: 'User not Existed'});

        if (data == 'nUserId' && user != null)
            throw new BadRequestException({messages: 'User Existed'});

        return value;
    }
}