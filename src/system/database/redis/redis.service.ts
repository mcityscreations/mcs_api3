// src/database/redis/redis.service.ts
import {
	Injectable,
	InternalServerErrorException,
	Inject,
	OnModuleInit,
	OnModuleDestroy,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import type { IRedisConfig } from './redis-config/redis-config.service.js';
import { WinstonLoggerService } from '../../logger/logger-service/winston-logger.service.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private client!: Redis;

	constructor(
		@Inject('REDIS_CONFIG')
		private readonly redisConfig: IRedisConfig,
		private readonly logger: WinstonLoggerService,
	) {}

	/** Initializing Redis client on module instantiation */
	async onModuleInit() {
		// 1. Initializing Redis client
		this.client = new Redis(this.redisConfig);

		// 2. Checking connection
		try {
			await this.client.ping();
			this.logger.log('✅ Redis client connected and operational.');
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error('❌ REDIS CONNECTION FAILURE:', errorMessage);
			throw new InternalServerErrorException(
				'Critical: Failed to connect to Redis.',
			);
		}
	}

	/** Disconnect the Redis client when the module is destroyed */
	async onModuleDestroy() {
		if (this.client) {
			await this.client.quit();
			this.logger.log('Redis client disconnected.');
		}
	}

	/**
	 * Returns the underlying Redis client instance
	 * that enables repositories to perform operations.
	 */
	public getClient(): Redis {
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
			const errorMessage = getErrorMessage(error);
			this.logger.error(`Redis SET error for key ${key}:`, errorMessage);
			throw new InternalServerErrorException('Redis service is unavailable.');
		}
	}

	/** Returns the value associated to a given key */
	public async get(key: string): Promise<string | null> {
		try {
			return await this.client.get(key);
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error(`Redis GET error for key ${key}:`, errorMessage);
			throw new InternalServerErrorException('Redis service is unavailable.');
		}
	}

	/** Deletes a key */
	public async del(key: string): Promise<void> {
		try {
			await this.client.del(key);
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error(`Redis DEL error for key ${key}:`, errorMessage);
			throw new InternalServerErrorException('Redis service is unavailable.');
		}
	}

	/**
	 * Tries to set a key if it does not already exist.
	 * Returns true if the key was set, false otherwise.
	 */
	public async setNX(
		key: string,
		value: string,
		ttlSeconds: number,
	): Promise<boolean> {
		try {
			// 'NX' = Only set if not exist
			// 'EX' = Expire in seconds
			const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
			return result === 'OK';
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error(`Redis SETNX error for key ${key}:`, errorMessage);
			// If Redis is down or there's an error, we let it pass by default to not block the user
			return true;
		}
	}

	public createRedisClient(): Redis {
		return new Redis(this.redisConfig);
	}
}
