import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateFileCommandHandler } from './application/command/create-file.handler';
import { DeleteFileCommandHandler } from './application/command/delete-file.handler';
import { UpdateFileCommandHandler } from './application/command/update-file.handler';
import { DownloadFileQueryHandler } from './application/query/download-file.handler';
import { FindFileQueryHandler } from './application/query/find-file.handler';
import { SearchFileQueryHandler } from './application/query/search-file.handler';
import { FileUserDeletedEventHandler } from './application/event/user-delete.handler';
import { FileFactory } from './domain/file.factory';
import { FileRepository } from './infra/db/repository/file.repository';
import { FileEntity, FileSchema } from './infra/db/entity/file-entity';
import { FileController } from './presentation/file.controller';
import { UserLikeFileQueryHandler } from './application/query/user-like-file.handler';

const commandHandlers = [
  CreateFileCommandHandler,
  DeleteFileCommandHandler,
  UpdateFileCommandHandler
];

const queryHandlers = [
  DownloadFileQueryHandler,
  FindFileQueryHandler,
  SearchFileQueryHandler,
  UserLikeFileQueryHandler
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