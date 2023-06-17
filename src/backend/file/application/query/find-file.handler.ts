import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FileInfo } from '../../domain/file.js';
import { IFileRepository } from '../../domain/repository/ifile.repository.js';
import { FindFileQuery } from './find-file.query.js';

@Injectable()
@QueryHandler(FindFileQuery)
export class FindFileQueryHandler implements IQueryHandler<FindFileQuery> {
    constructor(
        @Inject('FileRepository') private fileRepository: IFileRepository
    ) { }

    async execute(query: FindFileQuery): Promise<FileInfo> {
        const { fileId } = query;
        const fileInfo = await this.fileRepository.find(fileId);
        return fileInfo;   
    }
}