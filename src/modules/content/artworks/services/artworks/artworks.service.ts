import { Injectable } from '@nestjs/common';
import {
	ValidationError,
	NotFoundError,
} from '../../../../../system/errors/index.js';
import { PostgreSQLService } from '../../../../../system/database/postgresql/postgresql.service.js';
import { CategoriesService } from '../../../taxonomy/categories/categories.service.js';
import { TechniquesService } from '../../../taxonomy/techniques/techniques.service.js';
import { SubjectService } from '../../../taxonomy/subject/service/subject.service.js';
import { ICreateArtwork } from '../../schemas/create-artwork.schema.js';
import { CreateArtworkSchema } from '../../schemas/create-artwork.schema.js';
import { ArtworksRepository } from '../../repository/artworks.repository.js';
import { KeywordsService } from '../../../taxonomy/keywords/service/keywords.service.js';

@Injectable()
export class ArtworksService {
	constructor(
		private readonly dbService: PostgreSQLService,
		private readonly categoriesService: CategoriesService,
		private readonly techniquesService: TechniquesService,
		private readonly subjectService: SubjectService,
		private readonly artworksRepository: ArtworksRepository,
		private readonly keywordsService: KeywordsService,
	) {}

	public async addArtwork(artworkPayload: ICreateArtwork) {
		// Parse the payload and validate it against the ICreateArtwork schema
		const parsedArtwork = CreateArtworkSchema.safeParse(artworkPayload);
		if (!parsedArtwork.success)
			throw new ValidationError('[ Artwork Service ] Invalid artwork payload');
		if (artworkPayload.idArtist !== '019b902e-d7e5-75d5-92a7-8d257c91c375')
			throw new ValidationError('[ Artwork Service ] Unknown artist ID');
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
		const subjectData = await this.subjectService.findOne(
			artworkPayload.idSubject,
		);
		if (!subjectData)
			throw new ValidationError('[ Artwork Service ] Invalid subject ID');
		if (!artworkPayload.keywords)
			throw new ValidationError('[ Artwork Service ] Invalid keywords');
		const keywords = artworkPayload.keywords || [];
		for (const keywordId of keywords) {
			const keywordData = await this.keywordsService.findOne(keywordId);
			if (!keywordData)
				throw new NotFoundError('[ Artwork Service ] Invalid keyword ID');
		}
		// Start transaction
	}
	/*
	getArtwork(artworkId: string) {}

	getArtworksByCategory(categoryId: string) {}

	getArtworksByTechnique(techniqueId: string) {}

	getArtworksBySubject(subjectId: string) {}

	getArtworksByKeyword(keywordId: string) {}
*/
}
