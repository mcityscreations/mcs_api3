// src/security/rate-limiter/rate-limiter.service.ts
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { RateLimiterRepository } from './rate-limiter.repository';

@Injectable()
export class RateLimiterService {
	// Threshold of failed attempts before temporary blocking
	private readonly MAX_FAILURES_IP = 10;

	constructor(private readonly repository: RateLimiterRepository) {}

	/**
	 * Checks if an IP address is temporarily blocked by Rate Limiting.
	 * Throws an HttpError if the threshold is exceeded.
	 *
	 * @param ip Yhe IP address to check.
	 */
	public async checkIpBlocked(ip: string): Promise<void> {
		const failureCount = await this.repository.getFailureCount(ip);

		if (failureCount >= this.MAX_FAILURES_IP) {
			// Throws an error that will be caught by the global ErrorHandler
			throw new ServiceUnavailableException(
				'Trop de tentatives de connexion échouées. Veuillez réessayer dans quelques minutes.', // 429 Too Many Requests
			);
		}
	}

	/**
	 * Records a failed login attempt for the given IP address.
	 * Is called AFTER a password verification failure.
	 */
	public async recordFailure(ip: string): Promise<void> {
		await this.repository.incrementFailureCount(ip);
	}
}
