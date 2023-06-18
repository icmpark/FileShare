import { ICommand } from '@nestjs/cqrs';

export class DeleteAuthCommand implements ICommand {
  constructor(
    readonly userId: string
  ) { }
}