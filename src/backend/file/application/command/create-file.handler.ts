import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateFileCommand } from './create-file.command';
import { FileFactory } from '../../domain/file.factory';
import { IFileRepository } from '../../domain/repository/ifile.repository';
import { v4 as uuid } from 'uuid';

@Injectable()
@CommandHandler(CreateFileCommand)
export class CreateFileCommandHandler implements ICommandHandler<CreateFileCommand> {
    constructor(
        private fileFactory: FileFactory,
        @Inject('FileRepository') private fileRepository: IFileRepository
    ) { }

    async execute(command: CreateFileCommand): Promise<string> {
        const fileId = uuid();
        const {files, userId, title, description } = command;
        this.fileFactory.create(fileId, userId, title, description, files);
        return fileId;
    }
}