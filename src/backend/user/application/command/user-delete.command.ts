import { ICommand } from '@nestjs/cqrs';
import { User } from '../../domain/user';

export class DeleteUserCommand implements ICommand {
  constructor(
    readonly userId: string
  ) { }
}