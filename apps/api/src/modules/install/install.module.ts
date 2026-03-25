import { Module } from '@nestjs/common';
import { InstallService } from './install.service';
import { InstallController } from './install.controller';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [SystemModule],
  providers: [InstallService],
  controllers: [InstallController],
  exports: [InstallService],
})
export class InstallModule {}
