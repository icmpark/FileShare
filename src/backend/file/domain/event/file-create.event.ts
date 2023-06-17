import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from '../../../utils/event/cqrs.event.js';
import { FileInfo } from '../file.js';

export class FileCreatedEvent extends CqrsEvent implements IEvent {
    constructor(
        readonly file: FileInfo
    ) {
        super(FileCreatedEvent.name);
    }
}