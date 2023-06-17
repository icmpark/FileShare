import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { FindFileQuery } from '../../application/query/find-file.query.js';

@Injectable()
export class FileExisted implements PipeTransform<any> {
    constructor(private queryBus: QueryBus) { }

    async transform(value: string, metadata: ArgumentMetadata) {
        const fileId = value;
        const data = metadata.data;
        if ((await this.queryBus.execute(new FindFileQuery(fileId))) == null)
            throw new BadRequestException({messages: 'File not Existed'});

        return value;
    }
}