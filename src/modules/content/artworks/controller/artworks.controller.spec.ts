import { Test, TestingModule } from '@nestjs/testing';
import { ArtworksController } from './artworks.controller.js';
import { ArtworksService } from '../services/artworks/artworks.service.js';
import { jest } from '@jest/globals';

describe('ArtworksController', () => {
	let controller: ArtworksController;
	const mockArtworksService = {
		addArtwork: jest.fn(),
		getArtwork: jest.fn(),
		getArtworksByCategory: jest.fn(),
		getArtworksByTechnique: jest.fn(),
		getArtworksBySubject: jest.fn(),
		getArtworksByKeyword: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ArtworksController],
			providers: [
				{
					provide: ArtworksService,
					useValue: mockArtworksService,
				},
			],
		}).compile();

		controller = module.get<ArtworksController>(ArtworksController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
