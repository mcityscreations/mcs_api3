import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../../../../system/errors/index.js';
import { PostgreSQLService } from '../../../../../system/database/postgresql/postgresql.service.js';
import type { PoolClient } from 'pg';
import CategoryService from '../../../categories/services/categories/categories.service.js';
import { ICreateArtwork } from '../../schemas/create-artwork.schema.js';
import { CreateArtworkSchema } from '../../schemas/create-artwork.schema.js';

@Injectable()
export class ArtworksService {
	constructor(private readonly dbService: PostgreSQLService) {}

	addArtwork(artworkPayload: ICreateArtwork) {
		// Parse the payload and validate it against the ICreateArtwork schema
		const parsedArtwork = CreateArtworkSchema.safeParse(artworkPayload);
		if (!parsedArtwork.success)
			throw new ValidationError('[ Artwork Service ] Invalid artwork payload');
        const categoryName =
		// Start transaction
	}

	getArtwork(artworkId: string) {}

	getArtworksByCategory(categoryId: string) {}

	getArtworksByTechnique(techniqueId: string) {}

	getArtworksBySubject(subjectId: string) {}

	getArtworksByKeyword(keywordId: string) {}
}
