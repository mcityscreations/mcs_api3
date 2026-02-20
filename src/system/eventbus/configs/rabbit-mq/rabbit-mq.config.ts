import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IRabbitMqConfig {
	uri: string;
	host: string;
	port: number;
	username: string;
	password: string;
	exchangeName: string;
}
@Injectable()
export class RabbitMqConfig {
	constructor(private readonly configService: ConfigService) {}

	public getRabbitMqConfig(): IRabbitMqConfig {
		const rabbitMQURI = this.configService.get<string>('RABBITMQ_URI');
		if (!rabbitMQURI) {
			throw new InternalServerErrorException(
				'RABBITMQ_URI is not defined in the configuration.',
			);
		}
		const host = this.configService.get<string>('RABBITMQ_HOST');
		if (!host) {
			throw new InternalServerErrorException(
				'RABBITMQ_HOST is not defined in the configuration.',
			);
		}
		const rawPort = this.configService.get<number>('RABBITMQ_PORT');
		if (!rawPort) {
			throw new InternalServerErrorException(
				'RABBITMQ_PORT is not defined in the configuration.',
			);
		}
		const port =
			typeof rawPort === 'number' ? rawPort : Number.parseInt(rawPort, 10);
		const username = this.configService.get<string>('RABBITMQ_USERNAME');
		if (!username) {
			throw new InternalServerErrorException(
				'RABBITMQ_USERNAME is not defined in the configuration.',
			);
		}
		const password = this.configService.get<string>('RABBITMQ_PASSWORD');
		if (!password) {
			throw new InternalServerErrorException(
				'RABBITMQ_PASSWORD is not defined in the configuration.',
			);
		}
		const exchangeName = this.configService.get<string>(
			'RABBITMQ_EXCHANGE_NAME',
		);
		if (!exchangeName) {
			throw new InternalServerErrorException(
				'RABBITMQ_EXCHANGE_NAME is not defined in the configuration.',
			);
		}

		return {
			uri: rabbitMQURI,
			host: host,
			port: port,
			username: username,
			password: password,
			exchangeName: exchangeName,
		};
	}

	public isRabbitMQEnabled = (): boolean => {
		const isEnabledRaw: string =
			this.configService.get<string>('RABBITMQ_ENABLED') || 'false';
		const isEnabled =
			typeof isEnabledRaw === 'string' && isEnabledRaw === 'true';
		return isEnabled;
	};
}
