import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { IFileRepository } from '../../domain/repository/ifile.repository.js';
import { UserLikeFileQuery } from './user-like-file.query.js';

@Injectable()
@QueryHandler(UserLikeFileQuery)
export class UserLikeFileQueryHandler implements IQueryHandler<UserLikeFileQuery> {
    constructor(
        @Inject('FileRepository') private fileRepository: IFileRepository
    ) { }

    async execute(query: UserLikeFileQuery): Promise<boolean> {
        const { fileId, userId } = query;
        return await this.fileRepository.isUserLike(fileId, userId);
    }
}