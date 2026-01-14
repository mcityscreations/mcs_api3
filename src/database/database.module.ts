// src/database/database.module.ts

// NestJS and other module imports
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Database engines
import { PostgreSQLService } from './postgresql/postgresql.service';
import { RedisService } from './redis/redis.service';

// Configuration services and interfaces
import {
	IRedisConfig,
	RedisConfigService,
} from './redis/redis-config/redis-config.service';
import { PostgresqlConfigService } from './postgresql/postgresql-config/postgresql-config.service';

// Logging
import { WinstonLoggerService } from 'src/system/logger/logger-service/winston-logger.service';

@Module({
	// No need to import SystemModule here as it's global
	imports: [ConfigModule],
	providers: [
		RedisService,
		PostgresqlConfigService,
		// Config objects for PostgreSQL connections
		{
			provide: 'PG_STANDARD_CONFIG',
			useFactory: (config: PostgresqlConfigService) =>
				config.getStandardConfig(),
			inject: [PostgresqlConfigService],
		},
		{
			provide: 'PG_OAUTH_CONFIG',
			useFactory: (config: PostgresqlConfigService) =>
				config.getSecurityConfig(),
			inject: [PostgresqlConfigService],
		},
		// Postgres SQL engine service
		{
			provide: PostgreSQLService,
			useFactory: (stdCfg: any, authCfg: any, logger: WinstonLoggerService) =>
				new PostgreSQLService(stdCfg, authCfg, logger),
			inject: ['PG_STANDARD_CONFIG', 'PG_OAUTH_CONFIG', WinstonLoggerService],
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
			useFactory: (redisConfig: IRedisConfig, logger: WinstonLoggerService) => {
				// Factory function that creates the RedisService instance
				return new RedisService(redisConfig, logger);
			},
			// Injecting the config object
			inject: ['REDIS_CONFIG', WinstonLoggerService],
		},
	],
	// Exporting services for use in other modules
	exports: [RedisService, PostgreSQLService, PostgresqlConfigService],
})
export class DatabaseModule {}
