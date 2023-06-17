import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from '../../../utils/event/cqrs.event';
import { User } from '../user';

export class UserCreatedEvent extends CqrsEvent implements IEvent {
    constructor(
        readonly user: User
    ) {
        super(UserCreatedEvent.name);
    }
}