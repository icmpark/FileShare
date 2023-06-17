import { Module } from '@nestjs/common';
import { BackendModule } from './backend/backend.module.js';

@Module({
    imports: [BackendModule]
})
export class AppModule { }
