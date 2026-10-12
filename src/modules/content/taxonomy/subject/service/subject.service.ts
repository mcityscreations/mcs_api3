import { Injectable } from '@nestjs/common';
import {
	ValidationError,
	NotFoundError,
} from '../../../../../system/errors/index.js';
import { isUuidV7 } from '../../../../../common/validators/isuuidv7.validator.js';
import { SubjectRepository } from '../repository/subject.repository.js';
import type {
	IReadAdminSubject,
	IReadPublicSubject,
} from '../schemas/subject.schemas.js';
import { LanguageParamSchema } from '../../languages/schemas/languages.schemas.js';

@Injectable()
export class SubjectService {
	constructor(private readonly subjectRepository: SubjectRepository) {}

	public async findOne(id: string): Promise<IReadAdminSubject> {
		if (!id || !isUuidV7(id)) {
			throw new ValidationError(`[Subject Service] Wrong subject ID format.`);
		}
		const result = await this.subjectRepository.findOne(id);
		if (!result) {
			throw new NotFoundError(
				`[Subject Service] No subject associated to the given ID.`,
			);
		}
		return result;
	}

	public async findOnei18n(
		subjectId: string,
		languageId: string,
	): Promise<IReadPublicSubject> {
		if (!subjectId || !isUuidV7(subjectId)) {
			throw new ValidationError(`[Subject Service] Wrong subject ID format.`);
		}
		const parsedLanguageId = LanguageParamSchema.safeParse(languageId);
		if (!parsedLanguageId.success) {
			throw new ValidationError(`[Subject Service] Wrong language ID format.`);
		}
		const result = await this.subjectRepository.findOnei18n(
			subjectId,
			parsedLanguageId.data,
		);
		if (!result) {
			throw new NotFoundError(
				`[Subject Service] No subject associated to the given ID and language.`,
			);
		}
		return result;
	}

	public async findAll(): Promise<IReadAdminSubject[]> {
		const result = await this.subjectRepository.findAll();
		if (!result || result.length === 0) {
			throw new NotFoundError(
				`[Subject Service] No subjects found in the database.`,
			);
		}
		return result;
	}

	public async findAlli18n(lang: string): Promise<IReadPublicSubject[]> {
		const parsedLanguageId = LanguageParamSchema.safeParse(lang);
		if (!parsedLanguageId.success) {
			throw new ValidationError(`[Subject Service] Wrong language ID format.`);
		}
		const result = await this.subjectRepository.findAlli18n(
			parsedLanguageId.data,
		);
		if (!result || result.length === 0) {
			throw new NotFoundError(
				`[Subject Service] No subjects found for the given language.`,
			);
		}
		return result;
	}
}
