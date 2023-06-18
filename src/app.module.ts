import { Module } from '@nestjs/common';
import { BackendModule } from './backend/backend.module.js';
import { FrontendModule } from './frontend/frontend.module.js';

@Module({
    imports: [BackendModule, FrontendModule]
})
export class AppModule { }
