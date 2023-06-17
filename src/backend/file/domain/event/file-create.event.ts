import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from '../../../utils/event/cqrs.event';
import { FileInfo } from '../file';

export class FileCreatedEvent extends CqrsEvent implements IEvent {
    constructor(
        readonly file: FileInfo
    ) {
        super(FileCreatedEvent.name);
    }
}