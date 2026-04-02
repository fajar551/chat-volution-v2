import { Module } from '@nestjs/common';
import { LkhService } from './lkh.service';
import { LkhController } from './lkh.controller';

@Module({
  controllers: [LkhController],
  providers: [LkhService],
  exports: [LkhService],
})
export class LkhModule {}
