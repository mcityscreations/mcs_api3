// src/system/system.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Asynchronous Local Storage
import { AlsService } from './als/als.service.js';
// Logs
import { LoggerConfigService } from './logger/logger-config/logger-config.service.js';
import {
	winstonLoggerFactory,
	WINSTON_LOGGER,
} from './logger/logger-factory/winston-logger.factory.js';
import { LoggingInterceptor } from './logger/logging-interceptor/logging.interceptor.js';
import { WinstonLoggerService } from './logger/logger-service/winston-logger.service.js';
// Metrics
import { MetricsController } from './metrics/metrics.controller.js';
// Security services
import { SecurityModule } from './security/security.module.js';
import { DatabaseModule } from './database/database.module.js';
// HTTP formatters
import { GlobalExceptionFilter } from './http/filters/global-exception/global-exception.filter.js';
import { SuccessInterceptor } from './http/interceptors/success/success.interceptor.js';

@Global()
@Module({
	imports: [
		ConfigModule,
		ScheduleModule.forRoot(),
		DatabaseModule,
		SecurityModule,
	],
	providers: [
		// Logging
		LoggerConfigService,
		winstonLoggerFactory,
		WinstonLoggerService,
		LoggingInterceptor,
		// Asynchronous Local Storage
		AlsService,
		// Http responses
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: SuccessInterceptor,
		},
	],
	controllers: [MetricsController],
	exports: [
		WINSTON_LOGGER,
		AlsService,
		WinstonLoggerService,
		SecurityModule,
		DatabaseModule,
	],
})
export class SystemModule {}
