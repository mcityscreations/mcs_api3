import { Injectable } from '@nestjs/common';
import type { ICreateArtworkI18n } from '../../../artworks/schemas/create-i18n.schema.js';
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
import { UsersService } from '../../../../identity/users/users.service.js';
import { ArtistService } from '../../../artist/service/artist.service.js';

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
		private readonly userService: UsersService,
		private readonly artistService: ArtistService,
	) {}

	public async addArtwork(username: string, artworkPayload: ICreateArtwork) {
		// Get person ID from the username
		const personID = await this.userService.getPersonIDByUsername(username);
		if (!personID)
			throw new NotFoundError('[ Artwork Service ] Artist not found');
		// Get artist ID from person ID
		const artist = await this.artistService.findOneByPersonId(personID);
		if (!artist)
			throw new NotFoundError('[ Artwork Service ] Artist not found');
		console.log(artworkPayload);
		artworkPayload.idArtist = artist.id;
		// Parse the payload and validate it against the ICreateArtwork schema
		const parsedArtwork = CreateArtworkSchema.safeParse(artworkPayload);
		if (!parsedArtwork.success) {
			console.log(parsedArtwork.error);
			throw new ValidationError('[ Artwork Service ] Invalid artwork payload');
		}
		// Validate category ID
		const categoryData = await this.categoriesService.findOne(
			artworkPayload.idCategory,
		);
		if (!categoryData)
			throw new ValidationError('[ Artwork Service ] Invalid category ID');
		// Validate technique IDs
		const techniqueData: string[] = [];
		for (const currentTechnique of artworkPayload.idTechnique) {
			const technique = await this.techniquesService.findOne(currentTechnique);
			if (!technique)
				throw new ValidationError('[ Artwork Service ] Invalid technique ID');
			techniqueData.push(technique.id);
		}
		// Validate subject ID
		const subjectData = await this.subjectService.findOne(
			artworkPayload.idSubject,
		);
		if (!subjectData)
			throw new ValidationError('[ Artwork Service ] Invalid subject ID');
		// Validate keywords
		if (!artworkPayload.keywords)
			throw new ValidationError('[ Artwork Service ] Invalid keywords');
		const keywords: string[] = [];
		for (const keywordId of artworkPayload.keywords) {
			const keywordData = await this.keywordsService.findOne(keywordId);
			if (!keywordData)
				throw new NotFoundError('[ Artwork Service ] Invalid keyword ID');
			keywords.push(keywordData.id);
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
				idArtwork: number;
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
				const slugI18n = slugGenerator(artworkTitle.value);
				i18nPayload.push({
					idArtwork: artworkReference.idArtwork,
					idLanguage: artworkTitle.idLanguage,
					title: artworkTitle.value,
					slug: slugI18n,
				});
			}
			// Add descriptions to the i18nPayload
			for (const artworkDescription of artworkPayload.description) {
				const existingEntry = i18nPayload.find(
					(entry) => entry.idLanguage === artworkDescription.idLanguage,
				);
				if (existingEntry) {
					existingEntry.description = artworkDescription.value;
				}
			}
			await this.artworksRepository.addArtworkI18n(
				i18nPayload as ICreateArtworkI18n[],
			);
			return artworkReference.idArtwork;
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
