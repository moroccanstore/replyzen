import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as fs from 'fs';
import * as path from 'path';

// ─── Startup Environment Validation ─────────────────────────────────────────
const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'DATABASE_URL',
  'ENCRYPTION_KEY',
] as const;

const isInstalled = fs.existsSync(path.join(process.cwd(), 'install.lock'));

if (isInstalled) {
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      console.error(
        `CRITICAL: Required environment variable "${varName}" is not set. ` +
        `Application is marked as installed but missing configuration. Refusing to start.`,
      );
      process.exit(1);
    }
  }
} else {
  console.log('INFO: Application in INSTALLER MODE. Critical env validation deferred.');
}

async function bootstrap() {
  try {
    console.log('DEBUG: DATABASE_URL check:', !!process.env.DATABASE_URL);
    console.log('DEBUG: Starting NestFactory.create...');
    const app = await NestFactory.create(AppModule, { rawBody: true });
    console.log('DEBUG: Nest application created');

    app.enableCors();
    console.log('DEBUG: CORS enabled');

    const port = process.env.PORT ?? 3000;
    console.log(`DEBUG: Attempting to listen on port ${port}...`);
    
    await app.listen(port);
    console.log(`DEBUG: Successfully listening on port ${port}`);
    console.log(`Application is running on port ${port}`);
  } catch (error) {
    console.error('CRITICAL: NestJS bootstrap failed:', error);
    process.exit(1);
  }
}
bootstrap().catch((err) => {
  console.error('CRITICAL: Fatal bootstrap error:', err);
  process.exit(1);
});
