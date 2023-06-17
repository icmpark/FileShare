import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module.js';
import { UserModule } from '../user/user.module.js';
import { LoginCommandHandler } from './application/command/login.handler.js';
import { VerifyUserQueryHandler } from './application/query/verify-user.handler.js';
import { SignController } from './presentation/sign.controller.js';


const commandHandlers = [
    LoginCommandHandler
  ];
  
const queryHandlers = [
    VerifyUserQueryHandler
];


@Module({
    imports: [UserModule, AuthModule, CqrsModule],
    controllers: [SignController],
    providers: [
        ...commandHandlers,
        ...queryHandlers
    ]
})
export class SignModule {}
