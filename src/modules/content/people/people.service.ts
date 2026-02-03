// src/modules/content/people/people.service.ts
import { Injectable } from '@nestjs/common';
import { PeopleRepository } from './repository/people.repository.js';
import { IPersonBase } from './types/person.interface.js';

@Injectable()
export class PeopleService {
	constructor(private readonly peopleRepository: PeopleRepository) {}

	async findOne(id: string): Promise<IPersonBase | null> {
		const result = await this.peopleRepository.findOne(id);
		return result;
	}
}
