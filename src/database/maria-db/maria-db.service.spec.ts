import { Test, TestingModule } from '@nestjs/testing';
import { MariaDBService } from './maria-db.service';

describe('MariaDbService', () => {
	let service: MariaDBService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MariaDBService],
		}).compile();

		service = module.get<MariaDBService>(MariaDBService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
