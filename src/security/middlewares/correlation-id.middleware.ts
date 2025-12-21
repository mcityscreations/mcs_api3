// src/security/middlewares/correlation-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AlsService } from '../../system/als/als.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
	constructor(private readonly alsService: AlsService) {}

	use(req: Request, res: Response, next: NextFunction) {
		// Trying to retrieve the ID if it's already present in the headers
		const correlationId = req.header('X-Request-ID') || randomUUID();

		// 1. Attaching correlationId property to Request object (for services & controllers)
		Object.defineProperty(req, 'correlationId', {
			value: correlationId,
			writable: false,
		});

		// 2. Returning the correlation ID in response headers
		res.setHeader('X-Request-ID', correlationId);

		// Using the Asynchronous Local Storage service to store the ID
		this.alsService.run({ correlationId }, () => {
			next();
		});

		// 3. Proceeding to the next middleware/controller
		next();
	}
}
