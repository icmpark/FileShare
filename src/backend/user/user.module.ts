import { Module } from '@nestjs/common';
import { UserController } from './presentation/user.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from './infra/db/entity/user.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { UserFactory } from './domain/user.factory.js';
import { UserRepository } from './infra/db/repository/user.repository.js';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserCommandHandler } from './application/command/user-create.handler.js';
import { DeleteUserCommandHandler } from './application/command/user-delete.handler.js';
import { UpdateUserCommandHandler } from './application/command/user-update.handler.js';
import { FindUserQueryHandler } from './application/query/user-find.handler.js';

const commandHandlers = [
  CreateUserCommandHandler,
  DeleteUserCommandHandler,
  UpdateUserCommandHandler
];

const queryHandlers = [
  FindUserQueryHandler
];

const factories = [
  UserFactory
];

const repositories = [
  { provide: 'UserRepository', useClass: UserRepository },
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema}]),
    AuthModule
  ],
  controllers: [UserController],
  providers: [
    ...factories,
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
  ],
})
export class UserModule { }