import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { FindFileQuery } from '../../application/query/find-file.query.js';

@Injectable()
export class PreviewExisted implements PipeTransform<any> {
    constructor(private queryBus: QueryBus) { }

    async transform(value: string, metadata: ArgumentMetadata) {
        const [fileId, previewId] = value;
        const numberPreviewId = parseInt(previewId);

        const fileInfo = await this.queryBus.execute(new FindFileQuery(fileId))

        if (!fileInfo)
            throw new BadRequestException({messages: 'File is not existed'});
        
        if (fileInfo.previewPath.length <= numberPreviewId)
            throw new BadRequestException({messages: 'File preview is not existed'});

        return [fileId, numberPreviewId];
    }
}