import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateFileCommand } from './update-file.command';
import { FileFactory } from '../../domain/file.factory';

@Injectable()
@CommandHandler(UpdateFileCommand)
export class UpdateFileCommandHandler implements ICommandHandler<UpdateFileCommand> {
    constructor(
        private fileFactory: FileFactory
    ) { }

    async execute(command: UpdateFileCommand): Promise<void> {
        const { files, fileId, title, description, likeUser, disLikeUser } = command;
       
        this.fileFactory.update(fileId, title, description, files, likeUser, disLikeUser);
    }
}