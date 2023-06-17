import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module.js';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateFileCommandHandler } from './application/command/create-file.handler.js';
import { DeleteFileCommandHandler } from './application/command/delete-file.handler.js';
import { UpdateFileCommandHandler } from './application/command/update-file.handler.js';
import { DownloadFileQueryHandler } from './application/query/download-file.handler.js';
import { FindFileQueryHandler } from './application/query/find-file.handler.js';
import { SearchFileQueryHandler } from './application/query/search-file.handler.js';
import { FileUserDeletedEventHandler } from './application/event/user-delete.handler.js';
import { FileFactory } from './domain/file.factory.js';
import { FileRepository } from './infra/db/repository/file.repository.js';
import { FileEntity, FileSchema } from './infra/db/entity/file-entity.js';
import { FileController } from './presentation/file.controller.js';
import { UserLikeFileQueryHandler } from './application/query/user-like-file.handler.js';
import { GetPreviewFileQueryHandler } from './application/query/get-preview-file.handler.js';

const commandHandlers = [
  CreateFileCommandHandler,
  DeleteFileCommandHandler,
  UpdateFileCommandHandler
];

const queryHandlers = [
  DownloadFileQueryHandler,
  FindFileQueryHandler,
  SearchFileQueryHandler,
  UserLikeFileQueryHandler,
  GetPreviewFileQueryHandler
];

const eventHandlers = [
  FileUserDeletedEventHandler,
];

const factories = [
  FileFactory
];

const repositories = [
  { provide: 'FileRepository', useClass: FileRepository },
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: FileEntity.name, schema: FileSchema}]),
    AuthModule,
  ],
  controllers: [FileController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    ...factories,
    ...repositories,
  ],
})
export class FileModule { }