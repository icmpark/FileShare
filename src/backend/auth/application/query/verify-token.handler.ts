import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { TokenPayload } from '../../domain/token-payload.js';
import { ITokenAdapter } from '../../domain/adapter/itoken.adapter.js';
import { VerifyTokenQuery } from './verify-token.query.js';

@Injectable()
@QueryHandler(VerifyTokenQuery)
export class VerifyTokenQueryHandler implements IQueryHandler<VerifyTokenQuery> {
    constructor(
        @Inject('TokenAdapter') private tokenAdapter: ITokenAdapter
    ) { }

    async execute(query: VerifyTokenQuery): Promise<TokenPayload | null> {
        const { token } = query;
        return await this.tokenAdapter.verify(token);    
    }
}