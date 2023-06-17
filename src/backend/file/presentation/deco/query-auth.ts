import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QueryAuth = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userId = data;
    return [request.query, request.auth[userId]];
  },
);