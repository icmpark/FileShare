import { Module } from '@nestjs/common';
import { BackendModule } from './backend/backend.module';

@Module({
    imports: [BackendModule]
})
export class AppModule { }
