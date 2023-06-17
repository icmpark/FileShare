import { ICommand } from '@nestjs/cqrs';

export class DeleteFileCommand implements ICommand {
  constructor(
    readonly fileIds: string | string[]
  ) { }
}