// src/system/logger/logger-factory/winston-logger.factory.ts

import { transports, format, createLogger, Logger } from 'winston';
import { MongoDB } from 'winston-mongodb';
import { LoggerConfigService } from '../logger-config/logger-config.service.js';
import { InternalServerErrorException } from '@nestjs/common';
import DailyRotateFile from 'winston-daily-rotate-file';

// The injection token of the Winston Logger to be used accross the whole app.
export const WINSTON_LOGGER = 'WINSTON_LOGGER';

export const winstonLoggerFactory = {
	provide: WINSTON_LOGGER,
	useFactory: (configService: LoggerConfigService): Logger => {
		// Loading MongoDB URI from configuration
		const mongoUri = configService.getMongoUri();
		if (!mongoUri)
			throw new InternalServerErrorException(
				'MongoDB configuration is missing',
			);
		const transportsList = [
			// 1. Console transport for "debug" messages, on development mode
			new transports.Console({
				level: 'debug',
				format: format.combine(
					format.colorize(),
					format.printf(({ level, message, timestamp, requestId }) => {
						// Converting type from unknown to string
						const msg = message as string;
						const time = timestamp as string;
						const formattedRequestID =
							requestId && typeof requestId === 'object'
								? `[${JSON.stringify(requestId)}]`
								: ` [${requestId as string}]`;
						// Fallback in case timestamp is undefined
						const finalTimestamp = time || new Date().toISOString();
						return `[Nest] ${finalTimestamp} ${formattedRequestID} ${level}: ${msg}`;
					}),
				),
			}),
			new DailyRotateFile({
				filename: './logs/app-%DATE%.log',
				zippedArchive: true,
				maxSize: '10m',
				maxFiles: '5d',
				level: 'info',
				format: format.json(),
			}),
			// 2. MongoDB transport for production mode.
			new MongoDB({
				db: mongoUri,
				collection: 'application_logs',
				level: 'info',
				capped: true, // Creates a limited size collection
				cappedSize: 20000000, // 20 MB
				format: format.combine(format.timestamp(), format.json()),
			}),
		];

		return createLogger({
			// Global format for all transports
			format: format.combine(
				format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				format.metadata({
					fillWith: ['correlationId', 'context', 'timestamp', 'trace'],
				}),
			),
			transports: transportsList,
		});
	},
	// The Factory's dependency
	inject: [LoggerConfigService],
};
