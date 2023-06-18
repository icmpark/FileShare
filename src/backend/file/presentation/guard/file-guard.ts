import { Request } from 'express';
import { Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ExtractTokenQuery } from '../../../auth/application/query/extract-token.query.js';
import { VerifyTokenQuery } from '../../../auth/application/query/verify-token.query.js';
import { FindFileQuery } from '../../application/query/find-file.query.js';
import { FileInfo } from '../../domain/file.js';
import { FindUserQuery } from '../../../user/application/query/user-find.query.js';
import { User } from '../../../user/domain/user.js';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class FileGuard implements CanActivate {
    constructor (
        private queryBus: QueryBus,
        private reflector: Reflector
    ) {  }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const handler = context.getHandler();
        const token = await this.queryBus.execute(new ExtractTokenQuery(request));

        if (token == null)
            return false;

        const tokenPayLoad = await this.queryBus.execute(new VerifyTokenQuery(token));

        if (tokenPayLoad == null)
            return false;
            
        return await this.validateRequest(handler, request, tokenPayLoad.userId);
    }

    private async validateRequest(handler: Function, request: any, authUserId: string): Promise<boolean> {
        const roles = this.reflector.get<string[]>('roles', handler);
        const fildId = request.params.fileId;

        let userInfo: User = null;

        if (authUserId != undefined && typeof authUserId == 'string')
            userInfo = await this.queryBus.execute(new FindUserQuery(authUserId));
    
        if (!userInfo)
            return false;

        request.auth = {userId: authUserId, nUserId: authUserId};
        
        const results = await Promise.all(roles.map(async (value) => {
            if (value == 'uploader')
            {        
                let fileInfo: FileInfo = null;
                if (fildId != undefined && typeof fildId == 'string')
                    fileInfo = await this.queryBus.execute(new FindFileQuery(fildId));
                return fileInfo != null && fileInfo.uploadUserId == authUserId;
            }
            else if (value == 'userself')
                return true;
            else
                return false;
        }));

        return results.some((value) => value);
  }
}
