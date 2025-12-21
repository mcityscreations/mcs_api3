// src/database/redis/redis-config/redis-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

export interface IRedisConfig {
	host: string;
	port: number;
	password?: string;
}

@Injectable()
export class RedisConfigService {
	constructor(private readonly configService: ConfigService) {}

	public getRedisConfig(): IRedisConfig {
		// Retrieving config stored in .env file
		const host = this.configService.get<string>('REDIS_HOST');
		const port = parseInt(
			this.configService.get<string>('REDIS_PORT') || '6379',
			10,
		);
		// Password can be optional
		const password = this.configService.get<string>('REDIS_PASSWORD') || '';
		// Checking loaded data
		if (!host) {
			throw new InternalServerErrorException(
				'REDIS_HOST environment variable is not defined.',
			);
		}
		return {
			host: host,
			port: port,
			password: password,
		};
	}
}
