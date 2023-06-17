import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from '../../../utils/event/cqrs.event';

export class UserUpdatedEvent extends CqrsEvent implements IEvent {
    constructor(
        readonly userId: string,
        readonly userName?: string,
        readonly password?: string
    ) {
        super(UserUpdatedEvent.name);
  }
}