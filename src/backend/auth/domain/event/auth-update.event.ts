import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from '../../../utils/event/cqrs.event.js';
import { Auth } from '../auth.js';

export class AuthUpdatedEvent extends CqrsEvent implements IEvent {
    constructor(
        readonly auth: Auth
    ) {
        super(AuthUpdatedEvent.name);
  }
}