import { Module } from '@nestjs/common';
import { WorksmobileService } from './worksmobile.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [WorksmobileService],
  exports: [WorksmobileService],
})
export class WorksmobileModule {}
