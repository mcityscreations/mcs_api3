// src/common/filters/global-exception/global-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { isNestHttpException } from '../../../../common/validators/error.validators.js';
import { WinstonLoggerService } from '../../../logger/logger-service/winston-logger.service.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: WinstonLoggerService) {}
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		// Init default values for status and message
		let status = 500;
		let message: string | string[] = 'Internal Server Error';

		if (isNestHttpException(exception)) {
			status = exception.getStatus();
			const res = exception.getResponse();

			// Extract the message properly, whether it's in an object or not
			if (typeof res === 'object' && res !== null && 'message' in res) {
				const msgValue = (res as Record<string, unknown>).message;
				message = typeof msgValue === 'string' ? msgValue : JSON.stringify(res);
			} else {
				message = res;
			}
		} else if (exception instanceof Error) {
			message = exception.message;
		}
		this.logger.error(
			`HTTP Route Error: ${request.method} ${request.url} - Status: ${status} - Error: ${message}`,
			exception instanceof Error ? exception.stack : undefined,
		);

		const errorObject = {
			success: false,
			statusCode: status,
			message: message,
			path: request.url,
			method: request.method,
			timestamp: new Date().toISOString(),
			version: 'v3',
		};

		response.status(status).json(errorObject);
	}
}
