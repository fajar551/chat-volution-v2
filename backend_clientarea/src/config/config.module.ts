import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { OpenaiProxyService } from './openai-proxy.service';

@Module({
  controllers: [ConfigController],
  providers: [OpenaiProxyService],
})
export class ConfigModule {}
