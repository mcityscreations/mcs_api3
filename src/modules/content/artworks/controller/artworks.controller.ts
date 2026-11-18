import {
	Body,
	Controller,
	Post,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { MandatoryAuthGuard } from '../../../../modules/security/guards/mandatory-auth/mandatory-auth.guard.js';
import { ThrottlerInterceptor } from '../../../../modules/security/interceptors/throttler/throttler.interceptor.js';
import { GetUser } from '../../../../common/decorators/get-user.decorator.js';
import type { ICreateArtwork } from '../schemas/create-artwork.schema.js';
import { ArtworksService } from '../services/artworks/artworks.service.js';

@Controller('artworks')
export class ArtworksController {
	constructor(private readonly artworksService: ArtworksService) {}

	@ApiOperation({ summary: 'Create a new artwork' })
	@ApiOkResponse({ description: 'Artwork created successfully' })
	@UseGuards(MandatoryAuthGuard)
	@UseInterceptors(ThrottlerInterceptor)
	@Post()
	addArtwork(
		@GetUser('username') username: string,
		@Body() artworkPayload: ICreateArtwork,
	) {
		console.log('Adding artwork for user:', username);
		return this.artworksService.addArtwork(username, artworkPayload);
	}

	/*
	@Get(':artworkId')
	getArtwork(artworkId: string) {}

	@Get(':categoryName')
	getArtworksByCategory(categoryName: string) {}

	@Get(':categoryName/:techniqueName')
	getArtworksByTechnique(techniqueName: string) {}

	getArtworksBySubject(subjectId: string) {}

	getArtworksByKeyword(keywordId: string) {}
	*/
}
