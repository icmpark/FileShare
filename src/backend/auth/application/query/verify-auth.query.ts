import { IQuery } from '@nestjs/cqrs';

export class VerifyAuthQuery implements IQuery {
  constructor(
    readonly refreshToken: string
  ) { }
}