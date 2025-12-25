import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmWinstonLogger } from './logger-typeorm.service';

describe('LoggerTypeormService', () => {
	let service: TypeOrmWinstonLogger;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TypeOrmWinstonLogger],
		}).compile();

		service = module.get<TypeOrmWinstonLogger>(TypeOrmWinstonLogger);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
