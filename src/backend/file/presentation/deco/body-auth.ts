import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BodyAuth = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userId = data;
    return [request.body, request.auth[userId]];
  },
);