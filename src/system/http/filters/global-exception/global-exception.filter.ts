// src/common/filters/global-exception/global-exception.filter.ts
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common';
import { AlsService } from '../../../als/als.service.js';
import { DomainError } from '../../../errors/domain.error.js';
import { Request, Response } from 'express';
import { isNestHttpException } from '../../../../common/validators/error.validators.js';
import { WinstonLoggerService } from '../../../logger/logger-service/winston-logger.service.js';
import { DOMAIN_ERROR_HTTP_MAP } from '../../../errors/map.error.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: WinstonLoggerService) {}
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const correlationId =
			(request.headers['x-correlation-id'] as string) ||
			(request.headers['x-request-id'] as string) ||
			AlsService.correlationId ||
			'unknown-correlation-id';

		// Init default values for status and message
		let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
		let message: string | string[] = 'Internal Server Error';
		let errorCode: string | undefined;

		// Handle NestJS HTTP exceptions
		if (isNestHttpException(exception)) {
			status = exception.getStatus();
			const res = exception.getResponse();

			// Extract the message properly, whether it's in an object or not
			if (typeof res === 'object' && res !== null && 'message' in res) {
				const msgValue = (res as Record<string, unknown>).message;
				// Preserves string arrays (ex: errors of DTO ValidationPipe)
				message =
					Array.isArray(msgValue) || typeof msgValue === 'string'
						? (msgValue as string | string[])
						: JSON.stringify(res);
			} else if (typeof res === 'string') {
				message = res;
			}
			const logMessage = Array.isArray(message) ? message.join(', ') : message;
			this.logger.error(
				`HTTP Route Error: ${request.method} ${request.url} - Status: ${status} - Error: ${logMessage}`,
				exception instanceof Error ? exception.stack : undefined,
				{ correlationId: correlationId },
			);
			// Handle DomainError exceptions
		} else if (exception instanceof DomainError) {
			message = exception.message;
			errorCode = exception.code;
			status =
				DOMAIN_ERROR_HTTP_MAP.get(
					exception.constructor as new (...args: any[]) => DomainError,
				) ?? HttpStatus.INTERNAL_SERVER_ERROR;
			this.logger.error(
				`Domain Error: Source: ${exception.source} - Code: ${exception.code} - Message: ${message}`,
				exception.stack,
				{ correlationId: correlationId },
			);
			// Fallback for unknown exceptions
		} else {
			const unknownError =
				exception instanceof Error ? exception : new Error(String(exception));

			this.logger.error(
				`Unhandled Critical Error: ${request.method} ${request.url} - ${unknownError.message}`,
				unknownError.stack,
				{ correlationId },
			);
		}

		const errorObject = {
			success: false,
			statusCode: status,
			code: errorCode ?? 'INTERNAL_SERVER_ERROR',
			message: message,
			correlationId: correlationId,
			path: request.url,
			method: request.method,
			timestamp: new Date().toISOString(),
			version: 'v3',
		};

		response.status(status).json(errorObject);
	}
}
