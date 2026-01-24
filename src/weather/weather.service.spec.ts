import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service.js';

describe('WeatherService', () => {
	let service: WeatherService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [WeatherService],
		}).compile();

		service = module.get<WeatherService>(WeatherService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
