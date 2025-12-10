import {
	Injectable,
	InternalServerErrorException,
	Inject,
	OnModuleInit,
	OnModuleDestroy,
} from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';
import type { IRedisConfig } from './redis-config/redis-config.service';
import { WINSTON_LOGGER } from 'src/system/logger/logger-factory/winston-logger.factory';
import { Logger } from 'winston';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private client: RedisClient;
	private readonly host: string;
	private readonly port: number;
	private readonly password?: string;

	constructor(
		@Inject('REDIS_CONFIG')
		private readonly redisConfig: IRedisConfig,
		@Inject(WINSTON_LOGGER)
		private readonly logger: Logger,
	) {}

	/** Initializing Redis client on module instantiation */
	async onModuleInit() {
		// 1. Initializing Redis client
		this.client = new Redis(this.redisConfig);

		// 2. Checking connection
		try {
			await this.client.ping();
			this.logger.info('✅ Redis client connected and operational.');
		} catch (error) {
			this.logger.error('❌ REDIS CONNECTION FAILURE:', error);
			throw new InternalServerErrorException(
				'Critical: Failed to connect to Redis.',
			);
		}
	}

	/** Disconnect the Redis client when the module is destroyed */
	async onModuleDestroy() {
		if (this.client) {
			await this.client.quit();
			this.logger.info('Redis client disconnected.');
		}
	}

	/**
	 * Returns the underlying Redis client instance
	 * that enables repositories to perform operations.
	 */
	public getClient(): RedisClient {
		return this.client;
	}

	// Basic methods that encapsulate error handling

	/** Setting a key with a value and a TTL */
	public async setWithTTL(
		key: string,
		value: string,
		ttlSeconds: number,
	): Promise<void> {
		try {
			await this.client.set(key, value, 'EX', ttlSeconds);
		} catch (error) {
			this.logger.error(`Redis SET error for key ${key}:`, error);
			throw new InternalServerErrorException('Redis service is unavailable.');
		}
	}

	/** Returns the value associated to a given key */
	public async get(key: string): Promise<string | null> {
		try {
			return await this.client.get(key);
		} catch (error) {
			this.logger.error(`Redis GET error for key ${key}:`, error);
			throw new InternalServerErrorException('Redis service is unavailable.');
		}
	}

	/** Deletes a key */
	public async del(key: string): Promise<void> {
		try {
			await this.client.del(key);
		} catch (error) {
			this.logger.error(`Redis DEL error for key ${key}:`, error);
			throw new InternalServerErrorException('Redis service is unavailable.');
		}
	}
}
