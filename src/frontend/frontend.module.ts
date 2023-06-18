import { Module } from '@nestjs/common';
import { UserRenderModule } from './user/user.module.js';
import { FileRenderModule } from './file/file.module.js';

@Module({
  imports: [
    UserRenderModule,
    FileRenderModule
  ]
})
export class FrontendModule {}
