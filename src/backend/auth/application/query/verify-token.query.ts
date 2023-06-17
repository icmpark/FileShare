import { IQuery } from '@nestjs/cqrs';

export class VerifyTokenQuery implements IQuery {
  constructor(
    readonly token: string
  ) { }
}