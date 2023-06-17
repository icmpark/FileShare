import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from '../../../utils/event/cqrs.event';

export class UserDeletedEvent extends CqrsEvent implements IEvent {
    constructor(
        readonly userId: string
    ) {
        super(UserDeletedEvent.name);
    }
}