import { ICommand } from '@nestjs/cqrs';

export class CreateTokenCommand implements ICommand {
  constructor(
    readonly userId: string
  ) { }
}