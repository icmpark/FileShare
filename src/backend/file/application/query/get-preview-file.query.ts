import { IQuery } from '@nestjs/cqrs';

export class GetPreviewFileQuery implements IQuery {
  constructor(
    readonly fileId: string,
    readonly previewId: number
  ) { }
}