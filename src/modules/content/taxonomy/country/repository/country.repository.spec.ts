import { Test, TestingModule } from '@nestjs/testing';
import { CountryRepository } from './country.repository.js';

describe('CountryRepository', () => {
	let service: CountryRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CountryRepository],
		}).compile();

		service = module.get<CountryRepository>(CountryRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
