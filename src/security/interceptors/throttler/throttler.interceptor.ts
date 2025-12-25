import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AlsService } from '../../../system/als/als.service';
import { RedisService } from '../../../database/redis/redis.service';

@Injectable()
export class ThrottlerInterceptor implements NestInterceptor {
	constructor(
		private readonly alsService: AlsService,
		private readonly redisService: RedisService,
	) {}

	async intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Promise<Observable<any>> {
		// 1. Retrieve IP from ALS
		const ip = this.alsService.getIP() || 'unknown';

		// 2. Generate a unique key for this IP + route class name + handler name
		const handler = context.getHandler().name;
		const className = context.getClass().name;

		const lockKey = `throttle:${ip}:${className}:${handler}`;

		// 3. Attempt to lock for one second in Redis
		// Using setNX so that only the FIRST request in 1s succeeds
		const isAllowed = await this.redisService.setNX(lockKey, '1', 1);

		if (!isAllowed) {
			throw new HttpException(
				'Action trop rapide. Veuillez patienter une seconde.',
				HttpStatus.TOO_MANY_REQUESTS,
			);
		}

		return next.handle();
	}
}
