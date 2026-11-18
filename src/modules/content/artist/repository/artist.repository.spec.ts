import { Test, TestingModule } from '@nestjs/testing';
import { ArtistRepositoryService } from './artist.repository.js';

describe('ArtistRepositoryService', () => {
	let service: ArtistRepositoryService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ArtistRepositoryService],
		}).compile();

		service = module.get<ArtistRepositoryService>(ArtistRepositoryService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
