import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { TokenPayload } from 'src/backend/auth/domain/token-payload';
import { ExtractTokenQuery } from '../../../auth/application/query/extract-token.query';
import { VerifyTokenQuery } from '../../../auth/application/query/verify-token.query';

@Injectable()
export class UserGuard implements CanActivate {
    constructor(
        private queryBus: QueryBus
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = await this.queryBus.execute(new ExtractTokenQuery(request));
   
        if (token == null)
            return false;

        const tokenPayload: TokenPayload = await this.queryBus.execute(new VerifyTokenQuery(token));

        if (tokenPayload == null)
            return false;

        const { userId } = tokenPayload;

        if (userId == null)
            return false;
            
        return this.validateRequest(request, userId);
    }

    private validateRequest(request: any, verify_result: string): boolean {
        const request_id: string = request.params.userId;
        return request_id == verify_result;
    };
}