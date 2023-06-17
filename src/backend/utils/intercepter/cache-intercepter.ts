import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor, CACHE_KEY_METADATA } from '@nestjs/cache-manager';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (!this.isRequestCacheable(context)) 
      return undefined;
    const cacheMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());
    return cacheMetadata + ':' + request.originalUrl;
  }
}