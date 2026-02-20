import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMqConfig } from './rabbit-mq.config.js';

describe('RabbitMqConfig', () => {
	let service: RabbitMqConfig;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RabbitMqConfig],
		}).compile();

		service = module.get<RabbitMqConfig>(RabbitMqConfig);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
