import { Test, TestingModule } from '@nestjs/testing';
import { AccountingCronService } from './cron.service.js';

describe('AccountingCronService', () => {
	let service: AccountingCronService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AccountingCronService],
		}).compile();

		service = module.get<AccountingCronService>(AccountingCronService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
