// src/modules/content/taxonomy/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { isUuidV7 } from '../../../../common/validators/isuuidv7.validator.js';
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

	findAll() {
		return `This action returns all categories`;
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

	public async findOneByLanguage(
		id: string,
		languageId: string,
	): Promise<IPublicReadCategory | null> {
		// Validate content
		if (!id || !isUuidV7(id))
			throw new ValidationError(`[Category Service] Wrong category ID format.`);
		if (!languageId || !isUuidV7(languageId))
			throw new ValidationError(`[Category Service] Wrong language ID format.`);
		// Check category existence
		const result = await this.findOne(id);
		if (!result)
			throw new NotFoundError(
				`[Category Service] No category associated to the given ID and language.`,
			);
		// Map data to include only the requested language
		const i18n = result.i18n.find((item) => item.idLanguage === languageId);
		if (!i18n)
			throw new NotFoundError(
				`[Category Service] No category associated to the given ID and language.`,
			);
		const finalRes: IPublicReadCategory = {
			id: result.id,
			name: result.name,
			slug: i18n.slug as string,
			isPublic: result.isPublic,
			hasDimensions: result.hasDimensions,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		};
		return finalRes;
	}

	remove(id: number) {
		return `This action removes a #${id} category`;
	}

	async findInternalIdByUuid(uuid: string): Promise<number | null> {
		return this.categoriesRepository.findInternalIdByUuid(uuid);
	}
}
