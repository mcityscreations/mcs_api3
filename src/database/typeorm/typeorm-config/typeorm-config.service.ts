// src/database/typeorm/typeorm-config/typeorm-config.service.ts

/** @description Service to provide TypeORM configuration options */

import {
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Logging
import { WINSTON_LOGGER } from '../../../system/logger/logger-factory/winston-logger.factory';

// TypeORM
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmWinstonLogger } from '../../../system/logger/logger-typeorm/logger-typeorm.service';

// Asynchronous Local Storage
import { AlsService } from '../../../system/als/als.service';
import { WinstonLoggerService } from 'src/system/logger/logger-service/winston-logger.service';

@Injectable()
export class TypeormConfigService {
	constructor(
		private readonly configService: ConfigService,
		private readonly alsService: AlsService,
		@Inject(WINSTON_LOGGER) private readonly winston: WinstonLoggerService,
	) {}

	public getPostgresCoreConfig(): TypeOrmModuleOptions {
		const host = this.configService.get<string>(
			'POSTGRES_MAIN_HOST',
			'localhost',
		);
		const rawPort = this.configService.get<string>(
			'POSTGRES_MAIN_PORT',
			'5432',
		);
		const user = this.configService.get<string>('POSTGRES_MAIN_USER');
		const password = this.configService.get<string>('POSTGRES_MAIN_PASSWORD');
		const database = this.configService.get<string>('POSTGRES_MAIN_DATABASE');
		const port = parseInt(rawPort, 10);
		if (!user || !password || !database || isNaN(port)) {
			throw new InternalServerErrorException(
				`Configuration Error: Missing critical PostgreSQL credentials. Check your .env file.`,
			);
		}
		return {
			type: 'postgres',
			host: host,
			port: port,
			username: user,
			password: password,
			database: database,
			autoLoadEntities: true,
			synchronize: false,
			logging: ['query', 'error', 'warn', 'schema'],
			logger: new TypeOrmWinstonLogger(this.winston),
		};
	}
}
