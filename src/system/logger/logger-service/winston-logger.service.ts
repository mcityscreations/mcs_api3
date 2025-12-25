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

	/** Helper to convert any message type to string */
	private messageToString(message: any): string {
		if (typeof message === 'string') {
			return message;
		} else if (message instanceof Error) {
			return message.message;
		} else {
			try {
				return JSON.stringify(message);
			} catch {
				return `[Serialization-Error]: ${String(message)}`;
			}
		}
	}

	// --- Implementing LoggerService ---

	log(message: any, context?: ContextOrMetadata) {
		const formattedMessage = this.messageToString(message);
		this.logger.info(formattedMessage, this.getEnhancedMeta(context));
	}

	error(message: any, trace?: string, context?: ContextOrMetadata) {
		const meta = this.getEnhancedMeta(context);
		const formattedTrace =
			trace || (message instanceof Error ? message.stack : undefined);
		const formattedMessage = this.messageToString(message);
		this.logger.error(formattedMessage, { ...meta, trace: formattedTrace });
	}

	warn(message: any, context?: ContextOrMetadata) {
		const formattedMessage = this.messageToString(message);
		this.logger.warn(formattedMessage, this.getEnhancedMeta(context));
	}

	// NestJS LoggerService also supports these methods
	debug?(message: any, context?: ContextOrMetadata) {
		const formattedMessage = this.messageToString(message);
		this.logger.debug(formattedMessage, this.getEnhancedMeta(context));
	}

	verbose?(message: any, context?: ContextOrMetadata) {
		const formattedMessage = this.messageToString(message);
		this.logger.verbose(formattedMessage, this.getEnhancedMeta(context));
	}
}
