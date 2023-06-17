import { Inject, Injectable, StreamableFile } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { IFileRepository } from '../../domain/repository/ifile.repository.js';
import { GetPreviewFileQuery } from './get-preview-file.query.js';

@Injectable()
@QueryHandler(GetPreviewFileQuery)
export class GetPreviewFileQueryHandler implements IQueryHandler<GetPreviewFileQuery> {
    constructor(
        @Inject('FileRepository') private fileRepository: IFileRepository
    ) { }

    async execute(query: GetPreviewFileQuery): Promise<(StreamableFile | string)[]> {
        const { fileId, previewId } = query;
        return await this.fileRepository.getPreviewFile(fileId, previewId);
          
    }
}