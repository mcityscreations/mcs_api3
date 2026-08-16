import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WinstonLoggerService } from '../logger/logger-service/winston-logger.service.js';
import { RedisService } from '../database/redis/redis.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { JobDispatcher } from './interfaces/jobdispatcher.interface.js';
import { BullMqAdapter } from './adapters/bullmq.adapter.js';

@Module({
	imports: [
		BullModule.forRootAsync({
			imports: [DatabaseModule],
			inject: [RedisService, WinstonLoggerService],
			useFactory: (
				redisService: RedisService,
				logger: WinstonLoggerService,
			) => ({
				connection: redisService.createRedisClient(),
				defaultJobOptions: {
					removeOnComplete: true, // Save space by removing completed jobs
					removeOnFail: false, // Keep failed jobs for analysis
				},
				logger: logger, // Inject the logger for internal logging
			}),
		}),
	],
	providers: [
		{
			provide: JobDispatcher,
			useClass: BullMqAdapter,
		},
	],
	exports: [JobDispatcher],
})
export class JobDispatcherModule {}
