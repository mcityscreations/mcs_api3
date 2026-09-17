import { Injectable } from '@nestjs/common';
import {
	ValidationError,
	NotFoundError,
} from '../../../../../system/errors/index.js';
import { isUuidV7 } from '../../../../../common/validators/isuuidv7.validator.js';
import { SubjectRepository } from '../repository/subject.repository.js';
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
}
