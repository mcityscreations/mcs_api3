import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../../../../system/errors/index.js';
import { PostgreSQLService } from '../../../../../system/database/postgresql/postgresql.service.js';
import type { PoolClient } from 'pg';
import { CategoriesService } from '../../../taxonomy/categories/categories.service.js';
import { TechniquesService } from '../../../taxonomy/techniques/techniques.service.js';
import { ICreateArtwork } from '../../schemas/create-artwork.schema.js';
import { CreateArtworkSchema } from '../../schemas/create-artwork.schema.js';

@Injectable()
export class ArtworksService {
	constructor(
		private readonly dbService: PostgreSQLService,
		private readonly categoriesService: CategoriesService,
		private readonly techniquesService: TechniquesService,
	) {}

	public async addArtwork(artworkPayload: ICreateArtwork) {
		// Parse the payload and validate it against the ICreateArtwork schema
		const parsedArtwork = CreateArtworkSchema.safeParse(artworkPayload);
		if (!parsedArtwork.success)
			throw new ValidationError('[ Artwork Service ] Invalid artwork payload');
		const categoryData = await this.categoriesService.findOne(
			artworkPayload.idCategory,
		);
		if (!categoryData)
			throw new ValidationError('[ Artwork Service ] Invalid category ID');
		const techniqueData = await this.techniquesService.findOne(
			artworkPayload.idTechnique,
		);
		if (!techniqueData)
			throw new ValidationError('[ Artwork Service ] Invalid technique ID');
		// Start transaction
	}

	getArtwork(artworkId: string) {}

	getArtworksByCategory(categoryId: string) {}

	getArtworksByTechnique(techniqueId: string) {}

	getArtworksBySubject(subjectId: string) {}

	getArtworksByKeyword(keywordId: string) {}
}
