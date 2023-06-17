import { ICommand } from '@nestjs/cqrs';

export class UpdateAuthCommand implements ICommand {
  constructor(
    readonly userId: string
  ) { }
}