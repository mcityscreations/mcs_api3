import { Injectable } from '@nestjs/common';
import {
	ValidationError,
	NotFoundError,
} from '../../../../../system/errors/index.js';
import { isUuidV7 } from '../../../../../common/validators/isuuidv7.validator.js';
import { SubjectRepository } from '../repository/subject.repository.js';
import { LanguageParamSchema } from '../../languages/schemas/languages.schemas.ts'
import type { IReadAdminSubject } from '../schemas/subject.schemas.js';

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

	public async findOnei18n(id: string, lang: string): Promise<IReadPublicSubject> {
		if (!id || !isUuidV7(id))
			throw new ValidationError(`[Subject service] Wrong subject ID format.`);
		const parsedLanguage = LanguageParamSchema.safeParse(lang);
		if (!parsedLanguage.success)
			throw new ValidationError(`[Subject service] Wrong language ID format.`);
		const result = this.subjectRepository.

	}
}
