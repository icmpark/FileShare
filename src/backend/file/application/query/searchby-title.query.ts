import { IQuery } from '@nestjs/cqrs';

export class SearchFileByTitleQuery implements IQuery {
  constructor(
    readonly title: string,
    readonly offset: number,
    readonly limit: number,
  ) { }
}