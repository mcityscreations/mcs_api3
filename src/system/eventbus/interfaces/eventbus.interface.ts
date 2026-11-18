// src/system/eventbus/interfaces/eventbus.interface.ts
import { WinstonLoggerService } from '../../logger/logger-service/winston-logger.service.js';

export abstract class EventBus {
	constructor(protected readonly logger: WinstonLoggerService) {}
	abstract emit<T>(
		exchange: string,
		routingKey: string,
		payload: T,
	): Promise<void> | void;
	// Future methods for subscribing to events can be added here, but for now we only need the publish method.
}
