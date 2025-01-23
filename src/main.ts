import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  app.use(cookieParser());

  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('POST REST API Documentation')
    .setDescription('The POST REST API description')
    .setVersion('1.0')
    .addTag('POS')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);

  const port = configService.get<number>('port');

  await app.listen(port);
}
bootstrap();
