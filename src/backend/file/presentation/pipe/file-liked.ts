import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { UserLikeFileQuery } from '../../application/query/user-like-file.query.js';

@Injectable()
export class FileLiked implements PipeTransform<any> {
    constructor(private queryBus: QueryBus) { }

    async transform(value: string, metadata: ArgumentMetadata) {
        const [fileId, userId] = value;
        const [_, userType] = metadata.data;

        const result = await this.queryBus.execute(new UserLikeFileQuery(fileId, userId));

        if (userType == 'nUserId' && result)
            throw new BadRequestException("The user already likes requested file");

        if (userType == 'userId' && !result)
            throw new BadRequestException("The user already dislikes requested file");

        
        return userId;
    }
}