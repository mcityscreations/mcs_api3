// src/system/logger/logger-typeorm/logger-typeorm.service.ts
import { Logger as TypeOrmLogger } from 'typeorm';
import { WinstonLoggerService } from '../logger-service/winston-logger.service';

/**
 * @description Custom TypeORM logger that uses Winston for logging
 */

export class TypeOrmWinstonLogger implements TypeOrmLogger {
	constructor(private readonly loggerService: WinstonLoggerService) {}

	// Helper to build metadata for TypeORM logs
	private getMeta(additionalMeta?: object) {
		return { source: 'typeorm', ...additionalMeta };
	}

	logQuery(query: string, parameters?: unknown[]) {
		this.loggerService.debug?.(query, { source: 'typeorm', parameters });
	}

	logQueryError(error: string | Error, query: string, parameters?: unknown[]) {
		const errorMessage = error instanceof Error ? error.message : error;
		this.loggerService.error(query, errorMessage, this.getMeta({ parameters }));
	}

	logQuerySlow(time: number, query: string, parameters?: unknown[]) {
		this.loggerService.warn(
			`Slow Query (${time}ms): ${query}`,
			this.getMeta({ parameters }),
		);
	}

	logSchemaBuild(message: string) {
		this.loggerService.log(message, this.getMeta());
	}

	logMigration(message: string) {
		this.loggerService.log(message, this.getMeta());
	}

	log(level: 'log' | 'info' | 'warn', message: string) {
		if (level === 'warn') this.loggerService.warn(message, this.getMeta());
		else this.loggerService.log(message, this.getMeta());
	}
}
