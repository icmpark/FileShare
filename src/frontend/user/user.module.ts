import { Module } from '@nestjs/common';
import { UserRenderController } from './user.controller.js';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../../backend/auth/auth.module.js';

@Module({
    imports: [
        CqrsModule
    ],
    controllers: [UserRenderController]
})
export class UserRenderModule {}
