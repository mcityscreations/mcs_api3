// src/system/eventbus/adapters/rabbitmq.adapter.ts
import {
	Injectable,
	InternalServerErrorException,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { EventBus } from '../interfaces/eventbus.interface.js';
import { RabbitMqConfig } from '../configs/rabbit-mq/rabbit-mq.config.js';
import { AlsService } from '../../als/als.service.js';
import { WinstonLoggerService } from '../../logger/logger-service/winston-logger.service.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';

@Injectable()
export class RabbitMqAdapter
	extends EventBus
	implements OnModuleInit, OnModuleDestroy
{
	private connection: amqp.AmqpConnectionManager;
	private channelWrapper: ChannelWrapper;
	private readonly exchangeName: string;

	constructor(
		readonly alsService: AlsService,
		readonly logger: WinstonLoggerService,
		private readonly rabbitMqConfig: RabbitMqConfig,
	) {
		super(alsService, logger);
		this.exchangeName =
			this.rabbitMqConfig.getRabbitMqConfig()?.exchangeName ||
			'default_exchange';
	}

	async onModuleInit() {
		if (!this.rabbitMqConfig.getRabbitMqConfig()?.enabled) {
			this.logger.warn(
				'RabbitMQ is disabled in the configuration. RabbitMqAdapter will not be initialized.',
			);
			return;
		}
		const connectionURI = this.rabbitMqConfig.getRabbitMqConfig()?.uri ?? '';
		try {
			this.logger.log('Connecting to RabbitMQ...');
			this.connection = amqp.connect([connectionURI]);

			this.channelWrapper = this.connection.createChannel({
				json: true,
				setup: (channel: ConfirmChannel) => {
					return channel.assertExchange(this.exchangeName, 'topic', {
						durable: true,
					});
				},
			});

			// Testing the connection
			await this.channelWrapper.waitForConnect();
			this.logger.log('RabbitMQ connected and ChannelWrapper ready.');
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error('Error while connecting to RabbitMQ', errorMessage);
		}
	}

	async onModuleDestroy() {
		// Always close the wrapper before establishing a new connection
		if (this.channelWrapper) await this.channelWrapper.close();
		if (this.connection) await this.connection.close();
	}

	async emit<T>(pattern: string, data: T): Promise<void> {
		if (!pattern || !data)
			throw new InternalServerErrorException(
				'RBQ : Pattern or data are missing',
			);

		// Retrieving correlation ID
		const correlationId = this.alsService.getCorrelationId();

		// No need to use JSON.stringify nor  de Buffer.from with 'JSON: true'in the config params
		const messagePayload = {
			pattern,
			data,
			timestamp: new Date().toISOString(),
		};

		try {
			// Messages are published within the ChannelWrapper.
			// If a message can't be sent, it is stored in the channel wrapper
			// and resent once service become available
			await this.channelWrapper.publish(
				this.exchangeName,
				pattern, // routing key
				messagePayload,
				{
					persistent: true,
					contentType: 'application/json',
					correlationId: correlationId,
					timestamp: Date.now(),
					messageId: crypto.randomUUID(),
				},
			);
			if (this.logger.debug) {
				this.logger.debug(
					`Message sent to exchange ${this.exchangeName} with key ${pattern}`,
					correlationId,
				);
			}
		} catch (error) {
			this.logger.error(`Failed to publish message: ${getErrorMessage(error)}`);
			throw error; // Important to notify the caller in case of failure
		}
	}
}
