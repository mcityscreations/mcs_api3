import { Injectable } from '@nestjs/common';
import { EntitiesRepository } from '../repository/entities.repository.js';

@Injectable()
export class EntitiesService {
	constructor(private readonly entitiesRepository: EntitiesRepository) {}

	public async findAll() {
		const result = await this.entitiesRepository.findAll();
		return result;
	}

	public async findAllI18n(lang: string) {
		const result = await this.entitiesRepository.findAllI18n(lang);
		return result;
	}
}
