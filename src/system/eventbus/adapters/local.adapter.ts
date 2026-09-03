// src/system/eventbus/adapters/local.adapter.ts
import * as crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventBus } from '../interfaces/eventbus.interface.js';
import { AlsService } from '../../als/als.service.js';
import { WinstonLoggerService } from '../../logger/logger-service/winston-logger.service.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';

@Injectable()
export class LocalEventBus extends EventBus {
	constructor(
		readonly logger: WinstonLoggerService,
		private readonly eventEmitter: EventEmitter2,
	) {
		super(logger);
	}

	emit<T>(pattern: string, data: T): void {
		const correlationId = AlsService.correlationId;
		const messageId = crypto.randomUUID();

		this.logger.debug?.(`[LocalBus] Publishing event: ${pattern}`, {
			correlationId,
			messageId,
		});

		// Building a consistent message payload structure that includes metadata for tracing and debugging
		const messagePayload = {
			pattern,
			data,
			metadata: {
				correlationId,
				messageId,
				timestamp: new Date().toISOString(),
				isLocal: true,
			},
		};

		/**
		 * setImmediate is used to ensure that the event is emitted asynchronously,
		 * simulating the behavior of an external message broker.
		 */
		setImmediate(() => {
			try {
				this.eventEmitter.emit(pattern, messagePayload);
			} catch (error) {
				const errorMessage = getErrorMessage(error);
				this.logger.error('Local EventBus dispatch failed', errorMessage);
			}
		});
	}
}
