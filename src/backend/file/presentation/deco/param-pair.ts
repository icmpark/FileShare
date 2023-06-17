import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ParamPair = createParamDecorator(
  (data: string[], ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const [fileId, previewId] = data;
    return [request.params[fileId], request.params[previewId]];
  },
);