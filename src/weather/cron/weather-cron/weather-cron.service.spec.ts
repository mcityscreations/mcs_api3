import { Test, TestingModule } from '@nestjs/testing';
import { WeatherCronService } from './weather-cron.service';

describe('WeatherCronService', () => {
	let service: WeatherCronService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [WeatherCronService],
		}).compile();

		service = module.get<WeatherCronService>(WeatherCronService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
