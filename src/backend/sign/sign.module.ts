import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { LoginCommandHandler } from './application/command/login.handler';
import { VerifyUserQueryHandler } from './application/query/verify-user.handler';
import { SignController } from './presentation/sign.controller';


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
