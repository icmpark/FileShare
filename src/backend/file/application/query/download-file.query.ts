import { IQuery } from '@nestjs/cqrs';

export class DownloadFileQuery implements IQuery {
  constructor(
    readonly fileId: string
  ) { }
}