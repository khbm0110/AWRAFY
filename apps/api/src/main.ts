import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation صارم إجباري على كل input — انظر docs/07-security-checklist.md § Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // كيرمي أي حقل ماشي معرف فـDTO
      forbidNonWhitelisted: true, // كيرفض الـrequest بلا ما يمرر بصمت
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
  console.log(`awrafy API running on http://localhost:${port}`);
}
bootstrap();
