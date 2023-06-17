import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserDeletedEvent } from '../../../user/domain/event/user-delete.event';
import { FileFactory } from '../../domain/file.factory';
import { IFileRepository } from '../../domain/repository/ifile.repository';


@EventsHandler(UserDeletedEvent)
export class FileUserDeletedEventHandler implements IEventHandler<UserDeletedEvent> {
    constructor(
        @Inject('FileRepository') private fileRepository: IFileRepository,
        private fileFactory: FileFactory
    ) { }

    async handle(event: UserDeletedEvent) {
        switch (event.name) {
            case UserDeletedEvent.name: {
                const { userId } = event as UserDeletedEvent;
                const files = await this.fileRepository.search(undefined, userId, 0, undefined);
                const fileIds = files.map((file) => file.fileId);
                if (fileIds.length != 0)
                    this.fileFactory.delete(fileIds);
                this.fileRepository.userDisLike(undefined, userId);
                break;
            }
            default:
                break;
        }
    }
}