import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LicenseModule } from './license/license.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    LicenseModule,
  ],
})
export class AppModule {}
