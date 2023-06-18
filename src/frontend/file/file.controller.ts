import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class FileRenderController {

  @Get('/')
  @Render('file/index')
  login() {
  }

  @Get('/upload')
  @Render('file/upload')
  upload() {
  }

  @Get('/download/:fileId')
  @Render('file/download')
  download() {
  }
}