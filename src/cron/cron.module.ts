import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { WorksmobileModule } from '../shared/worksmobile/worksmobile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../shared/redis/redis.module';
import { Users } from '../shared/entities/users.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    WorksmobileModule,
    RedisModule,
    TypeOrmModule.forFeature([Users]),
  ],
  providers: [CronService],
})
export class CronModule {}
