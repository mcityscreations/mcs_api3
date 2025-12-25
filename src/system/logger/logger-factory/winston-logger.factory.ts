// src/common/logger/winston-logger.factory.ts

import { transports, format, createLogger, Logger } from 'winston';
import { MongoDB } from 'winston-mongodb';
import { LoggerConfigService } from '../logger-config/logger-config.service';
import { InternalServerErrorException } from '@nestjs/common';
import { AlsService } from '../../als/als.service';
import { MongoDBConnectionOptions } from 'winston-mongodb';
import DailyRotateFile from 'winston-daily-rotate-file';

// MongoDB transport interface
interface WinstonMongoDBOptions extends MongoDBConnectionOptions {
	level: string;
	db: string;
	format?: any;
}

// The injection token of the Winston Logger to be used accross the whole app.
export const WINSTON_LOGGER = 'WINSTON_LOGGER';

export const winstonLoggerFactory = {
	provide: WINSTON_LOGGER,
	useFactory: (
		configService: LoggerConfigService,
		alsService: AlsService,
	): Logger => {
		const mongoUri = configService.getMongoUri();
		if (!mongoUri)
			throw new InternalServerErrorException(
				'MongoDB configuration is missing',
			);
		const mongoTransport = new MongoDB({
			// Connection configs
			db: mongoUri,
			collection: 'application_logs',
			options: {
				useUnifiedTopology: true,
			},
			level: 'warn',
			capped: true, // Creates a limited size collection
			cappedSize: 20000000, // 20 MB
			format: format.combine(format.timestamp(), format.json()),
		} as WinstonMongoDBOptions);

		const correlationIdFormat = format((info) => {
			const correlationId = alsService.getCorrelationId(); // Retrieving correlationId from ALS
			if (correlationId) {
				info.correlationId = correlationId;
			}
			return info;
		})();

		return createLogger({
			// Global format for all transports
			format: format.combine(
				correlationIdFormat,
				format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
			),
			transports: [
				// 1. Console transport for "debug" messages, on development mode
				new transports.Console({
					level: 'debug',
					format: format.combine(
						format.colorize(),
						format.printf(({ level, message, timestamp }) => {
							// Converting type from unknown to string
							const msg = message as string;
							const time = timestamp as string;
							// Fallback in case timestamp is undefined
							const finalTimestamp = time || new Date().toISOString();
							return `[Nest] ${finalTimestamp} ${level}: ${msg}`;
						}),
					),
				}),
				new DailyRotateFile({
					filename: 'logs/app-%DATE%.log',
					zippedArchive: true,
					maxSize: '10m',
					maxFiles: '5d',
					level: 'info',
				}),
				// 2. MongoDB transport for production mode.
				// Logs 'info', 'warn' and 'error' messages
				mongoTransport,
			],
		});
	},
	// The Factory's dependency
	inject: [LoggerConfigService, AlsService],
};
