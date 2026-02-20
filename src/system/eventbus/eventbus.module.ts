import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBus } from './interfaces/eventbus.interface.js';
import { RabbitMqConfig } from './configs/rabbit-mq/rabbit-mq.config.js';
import { RabbitMqAdapter } from './adapters/rabbitmq.adapter.js';
import { LocalEventBus } from './adapters/local.adapter.js';
import { AlsService } from '../als/als.service.js';

@Module({
	imports: [EventEmitterModule.forRoot()],
	providers: [
		RabbitMqConfig,
		RabbitMqAdapter,
		LocalEventBus,
		AlsService,
		{
			provide: EventBus,
			useFactory: (
				config: RabbitMqConfig,
				rabbit: RabbitMqAdapter,
				local: LocalEventBus,
			) => {
				const isEnabled = config.getRabbitMqConfig()?.enabled ?? false;
				return isEnabled ? rabbit : local;
			},
			inject: [RabbitMqConfig, RabbitMqAdapter, LocalEventBus],
		},
	],
})
export class EventBusModule {}
