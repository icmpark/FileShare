import { ICommand } from '@nestjs/cqrs';

export class CreateFileCommand implements ICommand {
  constructor(
    readonly files: File[],
    readonly userId: string,
    readonly title: string,
    readonly description: string,
  ) { }
}