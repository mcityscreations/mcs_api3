import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMariaDBConfig } from '../../database.interfaces';

@Injectable()
export class MariaDbConfigService {
	constructor(private readonly configService: ConfigService) {}

	public getStandardConfig(): IMariaDBConfig {
		// Retrieving config data stored in .env file
		const host = this.configService.get<string>(
			'MARIADB_MAIN_HOST',
			'localhost',
		);
		const rawPort = this.configService.get<string>('MARIADB_MAIN_PORT', '3306');

		const user = this.configService.get<string>('MARIADB_MAIN_USER');
		const password = this.configService.get<string>('MARIADB_MAIN_PASSWORD');
		const database = this.configService.get<string>('MARIADB_MAIN_DATABASE');

		const port = parseInt(rawPort, 10);

		// Checking loaded data
		if (!user || !password || !database || isNaN(port)) {
			throw new InternalServerErrorException(
				`Configuration Error: Missing critical MariaDB credentials. Check your .env file.`,
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
	public getSecurityConfig(): IMariaDBConfig {
		// Retrieving config data stored in .env file
		const host = this.configService.get<string>(
			'MARIADB_SECURITY_HOST',
			'localhost',
		);
		const rawPort = this.configService.get<string>(
			'MARIADB_SECURITY_PORT',
			'3306',
		);

		const user = this.configService.get<string>('MARIADB_SECURITY_USER');
		const password = this.configService.get<string>(
			'MARIADB_SECURITY_PASSWORD',
		);
		const database = this.configService.get<string>(
			'MARIADB_SECURITY_DATABASE',
		);

		const port = parseInt(rawPort, 10);

		// Checking loaded data
		if (!user || !password || !database || isNaN(port)) {
			throw new InternalServerErrorException(
				`Configuration Error: Missing critical MariaDB credentials. Check your .env file.`,
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
