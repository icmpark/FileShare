import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';

@Controller()
export class FileRenderController {

  @Get('/')
  @Render('file/index')
  login() {
  }

  @Get('/user-manage')
  @Render('file/userinfo')
  userinfo() {
  }

  @Get('/file-manage')
  @Render('file/scheinfo')
  fileinfo() {
  }
}