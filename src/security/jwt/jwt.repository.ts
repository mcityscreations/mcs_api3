import { Injectable } from '@nestjs/common';
import { RedisService } from '../../database/redis/redis.service';

@Injectable()
export class JwtRepository {
	constructor(private readonly _redisService: RedisService) {}

	private getJTIKey(jti: string): string {
		return `revoked_jwt:${jti}`;
	}

	/**
	 * Ajoute un JTI à la liste de révocation dans Redis (Blacklist).
	 * @param jti L'identifiant du jeton.
	 * @param ttlSeconds Le temps d'expiration restant du jeton.
	 */
	public async addJTI(jti: string, ttlSeconds: number): Promise<void> {
		const key = this.getJTIKey(jti);
		const value = 'revoked';

		// Utilisation de SET avec EX pour l'expiration automatique
		await this._redisService.getClient().set(key, value, 'EX', ttlSeconds);
	}

	/**
	 * Vérifie si un JTI est révoqué via Redis.
	 */
	public async hasJTI(jti: string): Promise<boolean> {
		const key = this.getJTIKey(jti);
		const exists = await this._redisService.getClient().exists(key);
		return exists === 1;
	}
}
