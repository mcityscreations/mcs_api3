import { Injectable } from '@nestjs/common';
import {
	ValidationError,
	NotFoundError,
} from '../../../../system/errors/index.js';
import { LanguagesRepository } from './languages.repository.js';

@Injectable()
export class LanguagesService {
	constructor(private readonly languagesRepository: LanguagesRepository) {}

	public async findOne(id: string) {
		if (!id)
			throw new ValidationError('[ Languages Service ] Invalid language ID');
		const result = await this.languagesRepository.findOne(id);
		if (!result)
			throw new NotFoundError('[ Languages Service ] Language not found');
		return result;
	}
}
