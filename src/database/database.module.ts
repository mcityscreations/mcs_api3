import { Module } from '@nestjs/common';
import { RedisService } from './redis/redis.service';
import { MariaDBService } from './maria-db/maria-db.service';
import { MariaDbConfigService } from './maria-db/maria-db-config/maria-db-config.service';
import type { IMariaDBConfig } from './database.interfaces';
import {
	IRedisConfig,
	RedisConfigService,
} from './redis/redis-config/redis-config.service';
import { KnexService } from './knex/knex.service';
import { SystemModule } from 'src/system/system.module';
import { Logger } from 'winston';
import { WINSTON_LOGGER } from 'src/system/logger/logger-factory/winston-logger.factory';

@Module({
	imports: [SystemModule],
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
				standardConfig: IMariaDBConfig,
				oauthConfig: IMariaDBConfig,
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
		KnexService,
	],
	// Exporting services for use in other modules
	exports: [RedisService, MariaDBService, MariaDbConfigService],
})
export class DatabaseModule {}
