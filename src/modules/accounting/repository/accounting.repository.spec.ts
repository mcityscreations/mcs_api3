import { Test, TestingModule } from '@nestjs/testing';
import { AccountingRepository } from './accounting.repository.js';

describe('AccountingRepository', () => {
	let service: AccountingRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AccountingRepository],
		}).compile();

		service = module.get<AccountingRepository>(AccountingRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
