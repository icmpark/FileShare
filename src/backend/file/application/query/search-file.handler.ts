import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FileInfo } from '../../domain/file';
import { IFileRepository } from '../../domain/repository/ifile.repository';
import { SearchFileQuery } from './search-file.query';

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