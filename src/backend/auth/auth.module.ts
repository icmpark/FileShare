import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateTokenCommandHandler } from './application/command/create-token.handler';
import { UpdateAuthCommandHandler } from './application/command/update-auth.handler';
import { AuthUserDeletedEventHandler } from './application/event/delete-user.handler';
import { ExtractTokenQueryHandler } from './application/query/extract-token.handler';
import { VerifyAuthQueryHandler } from './application/query/verify-auth.handler';
import { VerifyTokenQueryHandler } from './application/query/verify-token.handler';
import { AuthFactory } from './domain/auth.factory';
import { TokenAdapter } from './infra/adapter/token.adapter';
import { AuthEntity, AuthSchema } from './infra/db/entity/auth.entity';
import { AuthRepository } from './infra/db/repository/auth.repository';

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