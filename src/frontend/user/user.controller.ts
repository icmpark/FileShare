import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class UserRenderController {
  @Get('login')
  @Render('user/login')
  login() {
  }
  @Get('register')
  @Render('user/register')
  register() {
  }
}