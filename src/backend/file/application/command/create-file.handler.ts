import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateFileCommand } from './create-file.command.js';
import { FileFactory } from '../../domain/file.factory.js';
import { IFileRepository } from '../../domain/repository/ifile.repository.js';

@Injectable()
@CommandHandler(CreateFileCommand)
export class CreateFileCommandHandler implements ICommandHandler<CreateFileCommand> {
    constructor(
        private fileFactory: FileFactory,
        @Inject('FileRepository') private fileRepository: IFileRepository
    ) { }

    async execute(command: CreateFileCommand): Promise<string> {
        const {files, userId, fileId, title, description } = command;
        this.fileFactory.create(fileId, userId, title, description, files);
        return fileId;
    }
}