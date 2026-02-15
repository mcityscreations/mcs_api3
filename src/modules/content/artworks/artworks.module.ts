import { Module } from '@nestjs/common';
import { ArtworksService } from './services/artworks/artworks.service.js';
import { ArtworksRepository } from './repository/artworks.repository.js';
import { ArtworksController } from './controller/artworks.controller.js';

@Module({
	providers: [ArtworksService, ArtworksRepository],
	controllers: [ArtworksController],
})
export class ArtworksModule {}
