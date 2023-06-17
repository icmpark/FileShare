import { IQuery } from '@nestjs/cqrs';
import { ObjectId } from 'mongoose';

export class FindUserQuery implements IQuery {
  constructor(
    readonly userId: string | ObjectId,
  ) { }
}