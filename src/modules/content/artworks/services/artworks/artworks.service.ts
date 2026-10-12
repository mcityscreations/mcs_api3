import { Injectable } from '@nestjs/common';
import { slugGenerator } from '../../../../../common/utils/slugGenerator.utils.js';
import {
	ValidationError,
	NotFoundError,
} from '../../../../../system/errors/index.js';
import { TransactionManager } from '../../../../../system/database/postgresql/transactions/transaction-manager.service.js';
import { CategoriesService } from '../../../taxonomy/categories/categories.service.js';
import { TechniquesService } from '../../../taxonomy/techniques/techniques.service.js';
import { SubjectService } from '../../../taxonomy/subject/service/subject.service.js';
import { ICreateArtwork } from '../../schemas/create-artwork.schema.js';
import { CreateArtworkSchema } from '../../schemas/create-artwork.schema.js';
import { ArtworksRepository } from '../../repository/artworks.repository.js';
import { KeywordsService } from '../../../taxonomy/keywords/service/keywords.service.js';
import { LanguagesService } from '../../../taxonomy/languages/languages.service.js';

@Injectable()
export class ArtworksService {
	constructor(
		private readonly transactionManager: TransactionManager,
		private readonly categoriesService: CategoriesService,
		private readonly techniquesService: TechniquesService,
		private readonly subjectService: SubjectService,
		private readonly artworksRepository: ArtworksRepository,
		private readonly keywordsService: KeywordsService,
		private readonly languagesService: LanguagesService,
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
		await this.transactionManager.run(async () => {
			// Add main artwork data and get the generated reference
			const artworkReference =
				await this.artworksRepository.addArtwork(artworkPayload);
			if (!artworkReference)
				throw new ValidationError(
					'[ Artwork Service ] Failed to add artwork data',
				);
			// Handle i18n titles and descriptions //
			const i18nPayload: {
				idArtwork: string;
				idLanguage: string;
				title: string;
				description?: string;
				slug: string;
			}[] = [];

			// Generate slugs for each title in the artwork payload
			for (const artworkTitle of artworkPayload.title) {
				// Check language existence
				const languageData = await this.languagesService.findOne(
					artworkTitle.idLanguage,
				);
				if (!languageData)
					throw new NotFoundError(
						'[ Artwork Service ] Invalid language ID for title',
					);
				const slugI18n =
					artworkReference.reference + '-' + slugGenerator(artworkTitle.title);
				i18nPayload.push({
					idArtwork: artworkReference.idArtwork,
					idLanguage: artworkTitle.idLanguage,
					title: artworkTitle.title,
					slug: slugI18n,
				});
			}
			// Add descriptions to the i18nPayload
			for (const artworkDescription of artworkPayload.description) {
				const existingEntry = i18nPayload.find(
					(entry) => entry.idLanguage === artworkDescription.idLanguage,
				);
				if (existingEntry) {
					existingEntry.description = artworkDescription.description;
				}
			}
		});
	}
	/*
	getArtwork(artworkId: string) {}

	getArtworksByCategory(categoryId: string) {}

	getArtworksByTechnique(techniqueId: string) {}

	getArtworksBySubject(subjectId: string) {}

	getArtworksByKeyword(keywordId: string) {}
*/
}
