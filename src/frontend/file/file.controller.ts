import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';

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

  @Get('/download')
  @Render('file/download')
  download() {
  }
}