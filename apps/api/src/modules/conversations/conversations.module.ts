import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';

@Module({
  controllers: [ConversationsController],
  exports: [],
})
export class ConversationsModule {}
