import { IQuery } from '@nestjs/cqrs';

export class ExtractTokenQuery implements IQuery {
  constructor(
    readonly request: any
  ) { }
}