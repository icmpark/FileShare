import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateTokenCommandHandler } from './application/command/create-token.handler.js';
import { UpdateAuthCommandHandler } from './application/command/update-auth.handler.js';
import { AuthUserDeletedEventHandler } from './application/event/delete-user.handler.js';
import { ExtractTokenQueryHandler } from './application/query/extract-token.handler.js';
import { VerifyAuthQueryHandler } from './application/query/verify-auth.handler.js';
import { VerifyTokenQueryHandler } from './application/query/verify-token.handler.js';
import { AuthFactory } from './domain/auth.factory.js';
import { TokenAdapter } from './infra/adapter/token.adapter.js';
import { AuthEntity, AuthSchema } from './infra/db/entity/auth.entity.js';
import { AuthRepository } from './infra/db/repository/auth.repository.js';

const commandHandlers = [
    CreateTokenCommandHandler,
    UpdateAuthCommandHandler
];

const queryHandlers = [
    ExtractTokenQueryHandler,
    VerifyAuthQueryHandler,
    VerifyTokenQueryHandler
];

const eventHandlers = [
    AuthUserDeletedEventHandler
];

const factories = [
    AuthFactory
];

const repositories = [
  { provide: 'AuthRepository', useClass: AuthRepository },
  { provide: 'TokenAdapter', useClass: TokenAdapter },
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: AuthEntity.name, schema: AuthSchema}])
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    ...factories,
    ...repositories,
  ],
  exports: [
    ...commandHandlers,
    ...queryHandlers,
  ]
})
export class AuthModule { }