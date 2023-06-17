import { Inject, Injectable, StreamableFile } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { IFileRepository } from '../../domain/repository/ifile.repository';
import { DownloadFileQuery } from './download-file.query';

@Injectable()
@QueryHandler(DownloadFileQuery)
export class DownloadFileQueryHandler implements IQueryHandler<DownloadFileQuery> {
    constructor(
        @Inject('FileRepository') private fileRepository: IFileRepository
    ) { }

    async execute(query: DownloadFileQuery): Promise<(StreamableFile | string)[]> {
        const { fileId } = query;
        return await this.fileRepository.download(fileId);
          
    }
}