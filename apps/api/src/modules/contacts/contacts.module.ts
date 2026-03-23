import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';

@Module({
  controllers: [ContactsController],
  exports: [],
})
export class ContactsModule {}
