// src/security/middlewares/correlation-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AlsService } from '../als/als.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
	constructor(private readonly alsService: AlsService) {}

	use(req: Request, res: Response, next: NextFunction) {
		// Trying to retrieve the ID if it's already present in the headers
		const correlationId = req.header('X-Request-ID') || randomUUID();
		// Retrieving client IP address
		const ipAddress =
			req.headers['x-forwarded-for'] || req.socket.remoteAddress;
		const ipString = Array.isArray(ipAddress)
			? ipAddress[0]
			: ipAddress?.toString() || 'unknown';

		// 1. Attaching correlationId property to Request object (for services & controllers)
		Object.defineProperty(req, 'correlationId', {
			value: correlationId,
			writable: false,
		});

		// 2. Returning the correlation ID in response headers
		res.setHeader('X-Request-ID', correlationId);

		// Using the Asynchronous Local Storage service to store the ID
		this.alsService.run(
			{ correlationId: correlationId, ipAddress: ipString },
			() => {
				// 3. Proceeding to the next middleware/controller
				next();
			},
		);
	}
}
