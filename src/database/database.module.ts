// src/database/database.module.ts

// NestJS and other module imports
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Database engines
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisService } from './redis/redis.service';
import { MariaDBService } from './maria-db/maria-db.service';

// Configuration services and interfaces
import { MariaDbConfigService } from './maria-db/maria-db-config/maria-db-config.service';
import type { ISQLDatabaseConfig } from './database.interfaces';
import {
	IRedisConfig,
	RedisConfigService,
} from './redis/redis-config/redis-config.service';
import { TypeormConfigService } from './typeorm/typeorm-config/typeorm-config.service';
import { SystemModule } from '../system/system.module';

// Logging
import { Logger } from 'winston';
import { WINSTON_LOGGER } from '../system/logger/logger-factory/winston-logger.factory';

@Module({
	imports: [
		SystemModule,
		ConfigModule,
		// TypeORM module with asynchronous configuration
		TypeOrmModule.forRootAsync({
			inject: [TypeormConfigService],
			useFactory: (service: TypeormConfigService) =>
				service.getPostgresCoreConfig(),
		}),
	],
	providers: [
		RedisService,
		MariaDBService,
		MariaDbConfigService,
		// Provider that generates the STANDARD DB config object
		{
			provide: 'STANDARD_DB_CONFIG',
			useFactory: (configService: MariaDbConfigService) =>
				configService.getStandardConfig(),
			inject: [MariaDbConfigService],
		},
		// Provider that generates the OAUTH DB config object
		{
			provide: 'OAUTH_DB_CONFIG',
			useFactory: (configService: MariaDbConfigService) =>
				configService.getSecurityConfig(),
			inject: [MariaDbConfigService],
		},

		// MariaDBService (relies on the two config providers above)
		{
			provide: MariaDBService,
			useFactory: (
				standardConfig: ISQLDatabaseConfig,
				oauthConfig: ISQLDatabaseConfig,
				logger: Logger,
			) => {
				// Factory function that creates the MariaDBService instance
				return new MariaDBService(standardConfig, oauthConfig, logger);
			},
			// Injecting the two config objects
			inject: ['STANDARD_DB_CONFIG', 'OAUTH_DB_CONFIG', WINSTON_LOGGER],
		},
		// Provider that generates the REDIS_CONFIG config object
		{
			provide: 'REDIS_CONFIG',
			useFactory: (configService: RedisConfigService) =>
				configService.getRedisConfig(),
			inject: [RedisConfigService],
		},
		// RedisConfigService (relies on the config provider above)
		{
			provide: RedisService,
			useFactory: (redisConfig: IRedisConfig, logger: Logger) => {
				// Factory function that creates the RedisService instance
				return new RedisService(redisConfig, logger);
			},
			// Injecting the config object
			inject: ['REDIS_CONFIG', WINSTON_LOGGER],
		},
		TypeormConfigService,
	],
	// Exporting services for use in other modules
	exports: [RedisService, MariaDBService, MariaDbConfigService, TypeOrmModule],
})
export class DatabaseModule {}
