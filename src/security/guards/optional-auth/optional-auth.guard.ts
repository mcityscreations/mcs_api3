// src/security/guards/optional-auth/optional-auth.guard.ts

import {
	CanActivate,
	ExecutionContext,
	Injectable,
	InternalServerErrorException,
	Inject,
} from '@nestjs/common';
import { JwtService } from '../../jwt/jwt.service';
import { Request } from 'express';
import { isErrorWithMessage } from '../../../common/types/error.types';
import { WINSTON_LOGGER } from 'src/system/logger/logger-factory/winston-logger.factory';
import { Logger } from 'winston';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		@Inject(WINSTON_LOGGER)
		private readonly logger: Logger,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		// CASE 1 : Token missing
		if (!token) {
			// We allow the request to proceed without authentication as it is optional here
			return true;
		}

		// CASE 2 : Token provided, we try to verify it
		try {
			// Checking token validity
			const payload = await this.jwtService.verifyToken(token);

			// If ok, attach the payload to the request
			if (!payload)
				throw new InternalServerErrorException(
					'Payload is undefined after token verification.',
				);
			request.user = payload;

			return true;
		} catch (e) {
			// CASE 3 : Invalid token (expired, revoked, wrong signature...)
			if (isErrorWithMessage(e))
				// Logging error
				this.logger.warn(`Failed to verify optional token: ${e.message}`);

			return false;
		}
	}

	// Method to extract the bearer token from header
	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
