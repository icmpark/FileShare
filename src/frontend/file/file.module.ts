import { Module } from '@nestjs/common';
import { FileRenderController } from './file.controller.js';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
    imports: [
        CqrsModule
    ],
    controllers: [FileRenderController]
})
export class FileRenderModule {}
