import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from '../../../utils/event/cqrs.event';
import { Auth } from '../auth';

export class AuthUpdatedEvent extends CqrsEvent implements IEvent {
    constructor(
        readonly auth: Auth
    ) {
        super(AuthUpdatedEvent.name);
  }
}