// src/database/postgresql/postgresql-config/postgresql-config.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISQLDatabaseConfig } from '../../database.interfaces.js';

@Injectable()
export class PostgresqlConfigService {
	constructor(private readonly configService: ConfigService) {}

	public getStandardConfig(): ISQLDatabaseConfig {
		// Retrieving config data stored in .env file
		const host = this.configService.get<string>('POSTGRES_STANDARD_HOST');
		const rawPort = this.configService.get<string>(
			'POSTGRES_STANDARD_PORT',
			'5432',
		);

		const user = this.configService.get<string>('POSTGRES_STANDARD_USER');
		const password = this.configService.get<string>(
			'POSTGRES_STANDARD_PASSWORD',
		);
		const database = this.configService.get<string>(
			'POSTGRES_STANDARD_DATABASE',
		);

		const port = Number.parseInt(rawPort, 10);

		// Checking loaded data
		if (!user || !password || !database || Number.isNaN(port)) {
			throw new InternalServerErrorException(
				`Configuration Error: Missing critical Postgresql credentials. Check your .env file.`,
			);
		}

		return {
			host: host,
			port: port,
			user: user,
			password: password,
			database: database,
		};
	}
	public getSecurityConfig(): ISQLDatabaseConfig {
		// Retrieving config data stored in .env file
		const host = this.configService.get<string>(
			'POSTGRES_SECURITY_HOST',
			'localhost',
		);
		const rawPort = this.configService.get<string>(
			'POSTGRES_SECURITY_PORT',
			'5432',
		);

		const user = this.configService.get<string>('POSTGRES_SECURITY_USER');
		const password = this.configService.get<string>(
			'POSTGRES_SECURITY_PASSWORD',
		);
		const database = this.configService.get<string>(
			'POSTGRES_SECURITY_DATABASE',
		);

		const port = Number.parseInt(rawPort, 10);

		// Checking loaded data
		if (!user || !password || !database || Number.isNaN(port)) {
			throw new InternalServerErrorException(
				`Configuration Error: Missing critical Postgresql credentials. Check your .env file.`,
			);
		}

		return {
			host: host,
			port: port,
			user: user,
			password: password,
			database: database,
		};
	}
}
