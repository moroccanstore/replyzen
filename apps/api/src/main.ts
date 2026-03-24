import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('DEBUG: DATABASE_URL check:', !!process.env.DATABASE_URL);
    const app = await NestFactory.create(AppModule, { rawBody: true });
    app.enableCors();
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application is running on port ${process.env.PORT ?? 3000}`);
  } catch (error) {
    console.error('CRITICAL: NestJS bootstrap failed:', error);
    process.exit(1);
  }
}
bootstrap().catch((err) => {
  console.error('CRITICAL: Fatal bootstrap error:', err);
  process.exit(1);
});
