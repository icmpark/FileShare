import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ITokenAdapter } from '../../domain/adapter/itoken.adapter.js';
import { ExtractTokenQuery } from './extract-token.query.js';

@Injectable()
@QueryHandler(ExtractTokenQuery)
export class ExtractTokenQueryHandler implements IQueryHandler<ExtractTokenQuery> {
    constructor(
        @Inject('TokenAdapter') private tokenAdapter: ITokenAdapter
    ) { }

    async execute(query: ExtractTokenQuery): Promise<string> {
        const { request } = query;
        return this.tokenAdapter.extractFromReq(request);
    }
}