import { IQuery } from '@nestjs/cqrs';

export class UserLikeFileQuery implements IQuery {
  constructor(
    readonly fileId: string,
    readonly userId: string
  ) { }
}