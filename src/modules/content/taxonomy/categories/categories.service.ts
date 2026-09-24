// src/modules/content/taxonomy/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { isUuidV7 } from '../../../../common/validators/isuuidv7.validator.js';
import { LanguageParamSchema } from '../languages/schemas/languages.schemas.js';
import {
	NotFoundError,
	ValidationError,
} from '../../../../system/errors/index.js';
import { CategoriesRepository } from './categories.repository.js';
import {
	IAdminReadCategory,
	IPublicReadCategory,
} from './schemas/category.schemas.js';

@Injectable()
export class CategoriesService {
	constructor(private readonly categoriesRepository: CategoriesRepository) {}

	public async findAll() {
		const result = await this.categoriesRepository.findAll();
		if (!result || result.length === 0)
			throw new NotFoundError(
				`[Category Service] No categories found in the database.`,
			);
		return result;
	}

	public async findAlli18n(languageId: string) {
		// Validate content
		const parsedLanguageId = LanguageParamSchema.safeParse(languageId);
		if (!parsedLanguageId.success)
			throw new ValidationError(`[Category Service] Wrong language ID format.`);
		// Get data from repository
		const result = await this.categoriesRepository.findAlli18n(languageId);
		if (!result || result.length === 0)
			throw new NotFoundError(
				`[Category Service] No categories found in the database for the given language.`,
			);
		// Return result
		return result;
	}

	public async findOne(id: string): Promise<IAdminReadCategory | null> {
		// Validate content
		if (!id || !isUuidV7(id))
			throw new ValidationError(`[Category Service] Wrong category ID format.`);
		// Check category existence
		const result = await this.categoriesRepository.findOne(id);
		if (!result)
			throw new NotFoundError(
				`[Category Service] No category associated to the given ID.`,
			);
		return result;
	}

	public async findOnei18n(
		id: string,
		languageId: string,
	): Promise<IPublicReadCategory | null> {
		// Validate content
		if (!id || !isUuidV7(id))
			throw new ValidationError(`[Category Service] Wrong category ID format.`);
		if (!languageId || !isUuidV7(languageId))
			throw new ValidationError(`[Category Service] Wrong language ID format.`);
		// Check category existence
		const result = await this.categoriesRepository.findOnei18n(id, languageId);
		if (!result)
			throw new NotFoundError(
				`[Category Service] No category associated to the given ID and language.`,
			);
		return result;
	}

	remove(id: number) {
		return `This action removes a #${id} category`;
	}

	async findInternalIdByUuid(uuid: string): Promise<number | null> {
		return this.categoriesRepository.findInternalIdByUuid(uuid);
	}
}
