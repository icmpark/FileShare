import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FileInfo } from '../../domain/file.js';
import { IFileRepository } from '../../domain/repository/ifile.repository.js';
import { SearchFileQuery } from './search-file.query.js';

@Injectable()
@QueryHandler(SearchFileQuery)
export class SearchFileQueryHandler implements IQueryHandler<SearchFileQuery> {
    constructor(
        @Inject('FileRepository') private fileRepository: IFileRepository
    ) { }

    async execute(query: SearchFileQuery): Promise<FileInfo[]> {
        const { title, offset, limit } = query;
        const fileInfos = await this.fileRepository.search(title, undefined, offset, limit)
        return fileInfos;   
    }
}