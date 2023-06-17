import { IQuery } from '@nestjs/cqrs';

export class VerifyUserQuery implements IQuery {
  constructor(
    readonly userId: string,
    readonly password: string
  ) { }
}