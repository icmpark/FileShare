import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';
const __dirname = resolve();


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useStaticAssets(join(__dirname, 'src', 'frontend', 'public'), {prefix: '/assets'});
  app.setBaseViewsDir(join(__dirname, 'src', 'frontend', 'views'));
  app.setViewEngine("ejs");
  // app.enableCors(); 
  // app.use(compression());
  await app.listen(3000);
}
bootstrap();
