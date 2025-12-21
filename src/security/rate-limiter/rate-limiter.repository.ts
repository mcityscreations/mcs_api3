// src/security/rate-limiter/rate-limiter.repository.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../database/redis/redis.service';

// 5 min TTL for temporary blocking
const FAILURE_TTL_SECONDS = 5 * 60;

@Injectable()
export class RateLimiterRepository {
	constructor(private readonly _redisService: RedisService) {}

	private getIpKey(ip: string): string {
		return `fail_ip:${ip}`;
	}

	/**
	 * Increments the failure count for an IP.
	 * For the first failure, sets a TTL of 5 minutes.
	 * @returns The new count of failures.
	 */
	public async incrementFailureCount(ip: string): Promise<number> {
		const key = this.getIpKey(ip);

		// Uses the INCR command to atomically increment the failure count
		const count = await this._redisService.getClient().incr(key);

		// If this is the first failure, set the TTL
		if (count === 1) {
			await this._redisService.getClient().expire(key, FAILURE_TTL_SECONDS);
		}

		return count;
	}

	/**
	 * Retrieves the current failure count for an IP.
	 */
	public async getFailureCount(ip: string): Promise<number> {
		const key = this.getIpKey(ip);
		const count = await this._redisService.getClient().get(key);
		// Converts the result to a number (0 if the key does not exist or has expired)
		return parseInt(count || '0', 10);
	}
}
