// src/modules/content/taxonomy/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository.js';
import { isUuidV7 } from '../../../../common/validators/isuuidv7.validator.js';
import {
	NotFoundError,
	ValidationError,
} from '../../../../system/errors/index.js';
import { Ii18n } from '../../../../common/schemas/i18n.schema.js';

@Injectable()
export class CategoriesService {
	constructor(private readonly categoriesRepository: CategoriesRepository) {}

	findAll() {
		return `This action returns all categories`;
	}

	public async findOne(id: string): Promise<Ii18n[] | null> {
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

	remove(id: number) {
		return `This action removes a #${id} category`;
	}

	async findInternalIdByUuid(uuid: string): Promise<number | null> {
		return this.categoriesRepository.findInternalIdByUuid(uuid);
	}
}
