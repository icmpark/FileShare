import { Injectable, SetMetadata } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { VerifyAuthQuery } from '../../../auth/application/query/verify-auth.query.js';
import { QueryBus } from '@nestjs/cqrs';
import { TokenPayload } from '../../../auth/domain/token-payload.js';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class SignGuard implements CanActivate {
    constructor (
        private queryBus: QueryBus
    ) {  }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        const refreshToken = request.cookies.refreshToken;

        if (refreshToken == undefined)
            return false;

        return await this.validateRequest(request, refreshToken);
    }

    private async validateRequest(request: any, refreshToken: string): Promise<boolean> {
        
        const query = new VerifyAuthQuery(refreshToken);
        const tokenPayload: TokenPayload = await this.queryBus.execute(query);

        if (tokenPayload == null)
            return false;
        
        request.auth = {userId: tokenPayload.userId};
        
        return true;
  }
}
