import { Injectable } from '@nestjs/common';
import {
	ValidationError,
	NotFoundError,
} from '../../../../../system/errors/index.js';
import { KeywordsRepository } from '../repository/keywords.repository.js';
import type { IReadAdminKeywordDto } from '../schemas/keywords.schemas.js';

@Injectable()
export class KeywordsService {
	constructor(private readonly keywordsRepository: KeywordsRepository) {}

	public async findOne(id: string): Promise<IReadAdminKeywordDto | null> {
		if (!id || id.trim() === '') {
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
}
