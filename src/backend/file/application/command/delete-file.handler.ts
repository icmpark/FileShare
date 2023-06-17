import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteFileCommand } from './delete-file.command.js';
import { FileFactory } from '../../domain/file.factory.js';
import { IFileRepository } from '../../domain/repository/ifile.repository.js';
import { v4 as uuid } from 'uuid';

@Injectable()
@CommandHandler(DeleteFileCommand)
export class DeleteFileCommandHandler implements ICommandHandler<DeleteFileCommand> {
    constructor(
        private fileFactory: FileFactory,
        @Inject('FileRepository') private fileRepository: IFileRepository
    ) { }

    async execute(command: DeleteFileCommand): Promise<void> {
        let { fileIds } = command;

        if (typeof fileIds == 'string')
            fileIds = [fileIds];

        this.fileFactory.delete(fileIds);
    }
}