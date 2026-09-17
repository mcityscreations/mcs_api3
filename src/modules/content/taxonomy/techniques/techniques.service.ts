import { Injectable } from '@nestjs/common';
import {
	ValidationError,
	NotFoundError,
} from '../../../../system/errors/index.js';
import { isUuidV7 } from '../../../../common/validators/isuuidv7.validator.js';
import { CreateTechniqueDto } from './dto/create-technique.dto.js';
import { UpdateTechniqueDto } from './dto/update-technique.dto.js';
import { TechniquesRepository } from './techniques.repository.js';

@Injectable()
export class TechniquesService {
	constructor(private readonly techniquesRepository: TechniquesRepository) {}
	create(createTechniqueDto: CreateTechniqueDto) {
		return 'This action adds a new technique';
	}

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

	update(id: number, updateTechniqueDto: UpdateTechniqueDto) {
		return `This action updates a #${id} technique`;
	}

	remove(id: number) {
		return `This action removes a #${id} technique`;
	}
}
