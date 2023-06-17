import { ICommand } from '@nestjs/cqrs';

export class UpdateFileCommand implements ICommand {
  constructor(
    readonly fileId: string,
    readonly files: File[],
    readonly title: string,
    readonly description: string
  ) { }
}