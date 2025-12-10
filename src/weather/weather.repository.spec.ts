import { Test, TestingModule } from '@nestjs/testing';
import { WeatherRepository } from './weather.repository';

describe('WeatherRepository', () => {
	let service: WeatherRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [WeatherRepository],
		}).compile();

		service = module.get<WeatherRepository>(WeatherRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
