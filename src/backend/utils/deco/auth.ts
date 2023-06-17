import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Auth = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.auth[data];
  },
);