import { Injectable } from '@nestjs/common';
import { RedisService } from '../../database/redis/redis.service';

const MFA_SESSION_TTL_SECONDS = 5 * 60; // 5 minutes

@Injectable()
export class MfaSessionRepository {
	constructor(private readonly redisClient: RedisService) {}

	public async save(token: string, data: any): Promise<void> {
		// Formatted key : mfa:session:<token>
		const key = `mfa:session:${token}`;
		const dataString = JSON.stringify(data);

		// Redis command : SET key value EX seconds
		await this.redisClient.setWithTTL(key, dataString, MFA_SESSION_TTL_SECONDS);
	}

	public async find(token: string): Promise<string | null> {
		const key = `mfa:session:${token}`;
		return this.redisClient.get(key); // Returns the JSON string or null
	}

	public async delete(token: string): Promise<void> {
		const key = `mfa:session:${token}`;
		await this.redisClient.del(key);
	}
}
