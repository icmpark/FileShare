import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { IAuthRepository } from '../../domain/repository/iauth.repository';
import { VerifyAuthQuery } from './verify-auth.query';
import { ITokenAdapter } from '../../domain/adapter/itoken.adapter';
import { TokenPayload } from '../../domain/token-payload';

@Injectable()
@QueryHandler(VerifyAuthQuery)
export class VerifyAuthQueryHandler implements IQueryHandler<VerifyAuthQuery> {
    constructor(
        @Inject('AuthRepository') private authRepository: IAuthRepository,
        @Inject('TokenAdapter') private tokenAdapter: ITokenAdapter
    ) { }

    async execute(query: VerifyAuthQuery): Promise<TokenPayload | null> {
        const { refreshToken } = query;
    
        const payload = this.tokenAdapter.verify(refreshToken);
        
        if (payload == null)
            return null;

        const verify = await this.authRepository.verify(payload.userId, refreshToken);
        
        if (!verify)
            return null;

        return payload;
    }
}