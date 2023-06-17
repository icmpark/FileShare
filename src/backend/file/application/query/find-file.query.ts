import { IQuery } from '@nestjs/cqrs';

export class FindFileQuery implements IQuery {
  constructor(
    readonly fileId: string
  ) { }
}