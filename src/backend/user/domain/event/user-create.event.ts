import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from '../../../utils/event/cqrs.event.js';
import { User } from '../user.js';

export class UserCreatedEvent extends CqrsEvent implements IEvent {
    constructor(
        readonly user: User
    ) {
        super(UserCreatedEvent.name);
    }
}