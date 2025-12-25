// src/system/logger/logger-service/winston-logger.service.ts
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_LOGGER } from '../logger-factory/winston-logger.factory';
import { AlsService } from '../../als/als.service';

/**
 * @description Winston Logger Service implementing NestJS LoggerService
 * This service wraps the Winston logger and enriches log entries
 * with correlation IDs retrieved from Asynchronous Local Storage (ALS).
 */
type ContextOrMetadata = string | object;

@Injectable()
export class WinstonLoggerService implements LoggerService {
	// The method 'log' accepts a message and optionally a context
	// The signature is: log(message: string, context?: string)
	constructor(
		@Inject(WINSTON_LOGGER) private readonly logger: Logger,
		private readonly alsService: AlsService,
	) {}

	// --- Private helpers ---

	/**
	 * Retrieves the correlationId from ALS and combines it with existing metadata.
	 * @param optionalMeta NestJS context metadata or additional metadata.
	 * @returns An object of metadata enriched with the correlationId.
	 */
	private getEnhancedMeta(optionalMeta?: string | object): object {
		const correlationId = this.alsService.getCorrelationId();
		let meta = {};

		// If optionalMeta is a string (NestJS context), we map it
		if (typeof optionalMeta === 'string') {
			meta = { context: optionalMeta };
		}
		// If it's an object (additional metadata), we extend it
		else if (typeof optionalMeta === 'object' && optionalMeta !== null) {
			meta = optionalMeta;
		}

		// Adding or replacing the correlationId in the metadata
		if (correlationId) {
			meta = { ...meta, correlationId };
		}

		return meta;
	}

	// --- Implementing LoggerService ---

	log(message: string, context?: ContextOrMetadata) {
		// Calls Winston with 'info' level
		this.logger.info(message, this.getEnhancedMeta(context));
	}

	error(message: string, trace?: string, context?: ContextOrMetadata) {
		const meta = this.getEnhancedMeta(context);
		// Adding the trace to the metadata
		this.logger.error(message, { ...meta, trace });
	}

	warn(message: string, context?: ContextOrMetadata) {
		// Calls Winston with 'warn' level
		this.logger.warn(message, this.getEnhancedMeta(context));
	}

	// NestJS LoggerService also supports these methods
	debug?(message: string, context?: ContextOrMetadata) {
		this.logger.debug(message, this.getEnhancedMeta(context));
	}

	verbose?(message: string, context?: ContextOrMetadata) {
		this.logger.verbose(message, this.getEnhancedMeta(context));
	}
}
