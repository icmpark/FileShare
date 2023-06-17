import { ICommand } from '@nestjs/cqrs';
import { User } from '../../domain/user.js';

export class DeleteUserCommand implements ICommand {
  constructor(
    readonly userId: string
  ) { }
}