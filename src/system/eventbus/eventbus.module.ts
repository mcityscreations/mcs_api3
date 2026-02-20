import { DynamicModule, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBus } from './interfaces/eventbus.interface.js';
import { RabbitMqAdapter } from './adapters/rabbitmq.adapter.js';
import { LocalEventBus } from './adapters/local.adapter.js';
import { RabbitMqConfig } from './configs/rabbit-mq/rabbit-mq.config.js';
import { AlsService } from '../als/als.service.js';
import { WinstonLoggerService } from '../logger/logger-service/winston-logger.service.js';

// A simple utility function to check if RabbitMQ is enabled based on environment variables
// If FALSE, the module will use the LocalEventBus instead of RabbitMqAdapter and RabbitMQ won't be initialized at all.
const checkRabbitEnabled = () => process.env.RABBITMQ_ENABLED === 'true';
@Module({})
export class EventBusModule {
	static forRoot(): DynamicModule {
		const isEnabled = checkRabbitEnabled();

		return {
			module: EventBusModule,
			global: true,
			imports: isEnabled ? [] : [EventEmitterModule.forRoot()],
			providers: [
				RabbitMqConfig,
				AlsService,
				WinstonLoggerService,
				isEnabled ? RabbitMqAdapter : LocalEventBus,
				{
					provide: EventBus,
					useExisting: isEnabled ? RabbitMqAdapter : LocalEventBus,
				},
			],
			exports: [EventBus],
		};
	}
}
