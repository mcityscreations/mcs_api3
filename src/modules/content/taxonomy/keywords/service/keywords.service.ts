import { Injectable } from '@nestjs/common';
import {
	ValidationError,
	NotFoundError,
} from '../../../../../system/errors/index.js';
import { isUuidV7 } from '../../../../../common/validators/isuuidv7.validator.js';
import { KeywordsRepository } from '../repository/keywords.repository.js';
import type {
	IReadAdminKeywordDto,
	IReadPublicKeywordDto,
} from '../schemas/keywords.schemas.js';
import { LanguageParamSchema } from '../../languages/schemas/languages.schemas.js';

@Injectable()
export class KeywordsService {
	constructor(private readonly keywordsRepository: KeywordsRepository) {}

	public async findOne(id: string): Promise<IReadAdminKeywordDto | null> {
		if (!id || !isUuidV7(id)) {
			throw new ValidationError(
				'[ Keywords Service ] Keyword ID must be provided',
			);
		}
		const keyword = await this.keywordsRepository.findOne(id);
		if (!keyword) {
			throw new NotFoundError('[ Keywords Service ] Keyword not found');
		}
		return keyword;
	}

	public async findOnei18n(
		keywordId: string,
		languageId: string,
	): Promise<IReadPublicKeywordDto | null> {
		if (!keywordId || !isUuidV7(keywordId)) {
			throw new ValidationError(
				'[ Keywords Service ] Keyword ID must be provided',
			);
		}
		const parsedLanguageId = LanguageParamSchema.safeParse(languageId);
		if (!parsedLanguageId.success) {
			throw new ValidationError(
				'[ Keywords Service ] Invalid language ID format',
			);
		}
		const keyword = await this.keywordsRepository.findOnei18n(
			keywordId,
			languageId,
		);
		if (!keyword) {
			throw new NotFoundError('[ Keywords Service ] Keyword not found');
		}
		return keyword;
	}

	public async findAll(): Promise<IReadAdminKeywordDto[] | null> {
		const keywords = await this.keywordsRepository.findAll();
		if (!keywords || keywords.length === 0) {
			throw new NotFoundError('[ Keywords Service ] No keywords found');
		}
		return keywords;
	}

	public async findAlli18n(
		languageId: string,
	): Promise<IReadPublicKeywordDto[] | null> {
		const parsedLanguageId = LanguageParamSchema.safeParse(languageId);
		if (!parsedLanguageId.success) {
			throw new ValidationError(
				'[ Keywords Service ] Invalid language ID format',
			);
		}
		const keywords = await this.keywordsRepository.findAlli18n(
			parsedLanguageId.data,
		);
		if (!keywords || keywords.length === 0) {
			throw new NotFoundError('[ Keywords Service ] No keywords found');
		}
		return keywords;
	}
}
