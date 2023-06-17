import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  // app.enableCors(); 
  // app.use(compression());
  await app.listen(3000);
}
bootstrap();
