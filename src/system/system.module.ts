// src/system/system.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Asynchronous Local Storage
import { AlsService } from './als/als.service.js';
// Logs
import { LoggerConfigService } from './logger/logger-config/logger-config.service.js';
import {
	winstonLoggerFactory,
	WINSTON_LOGGER,
} from './logger/logger-factory/winston-logger.factory.js';
import { LoggingInterceptor } from './interceptors/logging/logging.interceptor.js';
import { WinstonLoggerService } from './logger/logger-service/winston-logger.service.js';
// Metrics
import { MetricsController } from './metrics/metrics.controller.js';
// Security services
import { SecurityModule } from './security/security.module.js';
import { DatabaseModule } from './database/database.module.js';

@Global()
@Module({
	imports: [ConfigModule, ScheduleModule.forRoot(), DatabaseModule, SecurityModule],
	providers: [
		// Winston logging
		LoggerConfigService,
		winstonLoggerFactory,
		WinstonLoggerService,
		// Asynchronous Local Storage
		AlsService,
		// Interceptors
		LoggingInterceptor,
	],
	controllers: [MetricsController],
	exports: [WINSTON_LOGGER, AlsService, WinstonLoggerService, SecurityModule, DatabaseModule],
})
export class SystemModule {}
