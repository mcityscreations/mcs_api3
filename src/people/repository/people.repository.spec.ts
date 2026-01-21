import { Test, TestingModule } from '@nestjs/testing';
import { PeopleRepository } from './people.repository';

describe('PeopleRepository', () => {
	let service: PeopleRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PeopleRepository],
		}).compile();

		service = module.get<PeopleRepository>(PeopleRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
