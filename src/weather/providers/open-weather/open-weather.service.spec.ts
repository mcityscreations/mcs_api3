import { Test, TestingModule } from '@nestjs/testing';
import { OpenWeatherProvider } from './open-weather.service';

describe('OpenWeatherService', () => {
	let service: OpenWeatherProvider;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [OpenWeatherProvider],
		}).compile();

		service = module.get<OpenWeatherProvider>(OpenWeatherProvider);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
