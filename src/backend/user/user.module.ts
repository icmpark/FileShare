import { Module } from '@nestjs/common';
import { UserController } from './presentation/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from './infra/db/entity/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserFactory } from './domain/user.factory';
import { UserRepository } from './infra/db/repository/user.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserCommandHandler } from './application/command/user-create.handler';
import { DeleteUserCommandHandler } from './application/command/user-delete.handler';
import { UpdateUserCommandHandler } from './application/command/user-update.handler';
import { FindUserQueryHandler } from './application/query/user-find.handler';

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