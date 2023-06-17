import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BodyParamAuth = createParamDecorator(
  (data: string[], ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const [fileId, userId] = data;
    return [request.body, request.param[fileId], request.auth[userId]];
  },
);