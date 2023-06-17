import { Injectable, SetMetadata } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ExtractTokenQuery } from '../../../auth/application/query/extract-token.query.js';
import { VerifyTokenQuery } from '../../../auth/application/query/verify-token.query.js';
import { TokenPayload } from '../../../auth/domain/token-payload.js';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class SignTokenGuard implements CanActivate {
    constructor (
        private queryBus: QueryBus
    ) {  }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = await this.queryBus.execute(new ExtractTokenQuery(request));

        if (token == null)
            return false;

        const tokenPayLoad: TokenPayload = await this.queryBus.execute(new VerifyTokenQuery(token));

        if (tokenPayLoad == null)
            return false;
            
        request.auth = {userId: tokenPayLoad.userId, nUserId: tokenPayLoad.userId};

        return await this.validateRequest(request);
    }

    private async validateRequest(request: Express.Request): Promise<boolean> {
        return true;
  }
}
