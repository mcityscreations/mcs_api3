// src/security/guards/mandatory-auth/mandatory-auth.guard.ts

import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
	InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '../../jwt/jwt.service';
import { Request } from 'express';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service';

@Injectable()
export class MandatoryAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly logger: WinstonLoggerService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			// Token missing
			this.logger.warn('Authentication token missing in request.');
			throw new UnauthorizedException('Authentication token missing.');
		}

		// 1. Verifying token
		const payload = await this.jwtService.verifyToken(token);

		// 2. Attaching the decoded payload to the request
		if (!payload) {
			this.logger.error('Payload is undefined after token verification.');
			throw new InternalServerErrorException(
				'Payload is undefined after token verification.',
			);
		}
		request.user = payload;

		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
