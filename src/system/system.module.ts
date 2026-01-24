import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { WeatherModule } from '../weather/weather.module.js';
import { LoggerConfigService } from './logger/logger-config/logger-config.service.js';
import {
	winstonLoggerFactory,
	WINSTON_LOGGER,
} from './logger/logger-factory/winston-logger.factory.js';
import { AlsService } from './als/als.service.js';
import { LoggingInterceptor } from './interceptors/logging/logging.interceptor.js';
import { WinstonLoggerService } from './logger/logger-service/winston-logger.service.js';
import { MetricsController } from './metrics/metrics.controller.js';

@Global()
@Module({
	imports: [ConfigModule, ScheduleModule.forRoot(), WeatherModule],
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
	exports: [WINSTON_LOGGER, AlsService, WinstonLoggerService],
})
export class SystemModule {}
