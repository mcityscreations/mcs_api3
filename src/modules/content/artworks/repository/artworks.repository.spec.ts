import { Test, TestingModule } from '@nestjs/testing';
import { ArtworksRepository } from './artworks.repository.js';

describe('ArtworksRepository', () => {
	let service: ArtworksRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ArtworksRepository],
		}).compile();

		service = module.get<ArtworksRepository>(ArtworksRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
