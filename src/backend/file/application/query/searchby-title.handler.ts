import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { IFileRepository } from '../../domain/repository/ifile.repository.js';
import { SearchFileByTitleQuery } from './searchby-title.query.js';

@Injectable()
@QueryHandler(SearchFileByTitleQuery)
export class SearchFileByTitleQueryHandler implements IQueryHandler<SearchFileByTitleQuery> {
    constructor(
        @Inject('FileRepository') private fileRepository: IFileRepository
    ) { }

    async execute(query: SearchFileByTitleQuery): Promise<string[]> {
        const { title, offset, limit } = query;
        const fileInfo = await this.fileRepository.searchByTitle(title, offset, limit);
        return fileInfo;   
    }
}