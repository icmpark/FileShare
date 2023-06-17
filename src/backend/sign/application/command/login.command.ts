import { ICommand } from '@nestjs/cqrs';

export class LoginCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly password: string,
  ) { }
}