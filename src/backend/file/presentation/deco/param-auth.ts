import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ParamAuth = createParamDecorator(
  (data: string[], ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const [fileId, userId] = data;
    return [request.params[fileId], request.auth[userId]];
  },
);