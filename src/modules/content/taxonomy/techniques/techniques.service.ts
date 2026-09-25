import { Injectable } from '@nestjs/common';
import {
	ValidationError,
	NotFoundError,
} from '../../../../system/errors/index.js';
import { isUuidV7 } from '../../../../common/validators/isuuidv7.validator.js';
import { TechniquesRepository } from './techniques.repository.js';

@Injectable()
export class TechniquesService {
	constructor(private readonly techniquesRepository: TechniquesRepository) {}

	findAll() {
		return `This action returns all techniques`;
	}

	public async findOne(id: string) {
		if (!id || !isUuidV7(id))
			throw new ValidationError('[ Techniques Service ] Invalid technique ID');
		const result = await this.techniquesRepository.findOne(id);
		if (!result)
			throw new NotFoundError('[ Techniques Service ] Technique not found');
		return result;
	}
	/*
	update(id: string, updateTechniqueDto: UpdateTechniqueDto) {
		return `This action updates a #${id} technique`;
	}

	remove(id: string) {
		return `This action removes a #${id} technique`;
	}
		*/
}
