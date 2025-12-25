import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { WeatherCronService } from './cron/weather-cron/weather-cron.service';
import { LoggerConfigService } from './logger/logger-config/logger-config.service';
import {
	winstonLoggerFactory,
	WINSTON_LOGGER,
} from './logger/logger-factory/winston-logger.factory';
import { AlsService } from './als/als.service';
import { LoggingInterceptor } from './interceptors/logging/logging.interceptor';
import { WinstonLoggerService } from './logger/logger-service/winston-logger.service';
import { TypeOrmWinstonLogger } from './logger/logger-typeorm/logger-typeorm.service';

// Winston Factory was moved to a dedicated file as it was too long.
@Global()
@Module({
	imports: [ConfigModule, ScheduleModule.forRoot()],
	providers: [
		// Cron services
		WeatherCronService,
		// Winston logging
		LoggerConfigService,
		winstonLoggerFactory,
		WinstonLoggerService,
		TypeOrmWinstonLogger,
		// Asynchronous Local Storage
		AlsService,
		// Interceptors
		LoggingInterceptor,
	],
	exports: [WINSTON_LOGGER, AlsService],
})
export class SystemModule {}
