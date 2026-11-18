import { Injectable } from '@nestjs/common';
import {
	ValidationError,
	NotFoundError,
} from '../../../../system/errors/index.js';
import { isUuidV7 } from '../../../../common/validators/isuuidv7.validator.js';
import { LanguageParamSchema } from '../languages/schemas/languages.schemas.js';
import { TechniquesRepository } from './techniques.repository.js';
import {
	IAdminReadTechnique,
	IPublicReadTechnique,
} from './schemas/technique.schemas.js';

@Injectable()
export class TechniquesService {
	constructor(private readonly techniquesRepository: TechniquesRepository) {}

	public async findOne(id: string) {
		if (!id || !isUuidV7(id))
			throw new ValidationError('[ Techniques Service ] Invalid technique ID');
		const result = await this.techniquesRepository.findOne(id);
		if (!result)
			throw new NotFoundError('[ Techniques Service ] Technique not found');
		return result;
	}

	public async findOnei18n(
		id: string,
		lang: string,
	): Promise<IPublicReadTechnique | null> {
		// Validate content
		if (!id || !isUuidV7(id))
			throw new ValidationError('[ Techniques Service ] Invalid technique ID');
		const parsedLanguageId = LanguageParamSchema.safeParse(lang);
		if (!parsedLanguageId.success)
			throw new ValidationError(
				`[Techniques Service] Wrong language ID format.`,
			);
		// Retrieve data from repository
		const result = await this.techniquesRepository.findOnei18n(id, lang);
		if (!result)
			throw new NotFoundError(
				`[Techniques Service] No technique found for the given ID and language.`,
			);
		return result;
	}

	public async findAll(): Promise<IAdminReadTechnique[] | null> {
		const result = await this.techniquesRepository.findAll();
		if (!result || result.length === 0)
			throw new NotFoundError(
				`[Techniques Service] No techniques found in the database.`,
			);
		return result;
	}

	public async findAlli18n(
		lang: string,
	): Promise<IPublicReadTechnique[] | null> {
		const parsedLanguageId = LanguageParamSchema.safeParse(lang);
		if (!parsedLanguageId.success)
			throw new ValidationError(
				`[Techniques Service] Wrong language ID format.`,
			);
		const result = await this.techniquesRepository.findAlli18n(lang);
		if (!result || result.length === 0)
			throw new NotFoundError(
				`[Techniques Service] No techniques found in the database for the given language.`,
			);
		return result;
	}
}
