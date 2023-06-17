import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from '../../../utils/event/cqrs.event';

export class FileUpdatedEvent extends CqrsEvent implements IEvent {
    constructor(
        readonly fileId: string,
        readonly title: string,
        readonly description: string,
        readonly fileName: string,
        readonly filePath: string
    ) {
        super(FileUpdatedEvent.name);
    }
}