import { Module } from '@nestjs/common';
import { ArtistController } from './controller/artist.controller.js';
import { ArtistService } from './service/artist.service.js';
import { ArtistRepositoryService } from './repository/artist.repository.js';

@Module({
	controllers: [ArtistController],
	providers: [ArtistService, ArtistRepositoryService],
	exports: [ArtistService],
})
export class ArtistModule {}
