import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from '../../../utils/event/cqrs.event.js';

export class FileDeletedEvent extends CqrsEvent implements IEvent {
    constructor(
        readonly fileIds: string[]
    ) {
        super(FileDeletedEvent.name);
    }
}