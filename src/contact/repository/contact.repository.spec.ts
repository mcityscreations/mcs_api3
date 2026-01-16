import { Test, TestingModule } from '@nestjs/testing';
import { ContactRepository } from './contact.repository';

describe('ContactRepository', () => {
	let service: ContactRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ContactRepository],
		}).compile();

		service = module.get<ContactRepository>(ContactRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
