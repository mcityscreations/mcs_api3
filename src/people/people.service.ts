import { Injectable } from '@nestjs/common';
import { PeopleRepository } from './repository/people.repository';
import { IPersonBase } from './types/person.interface';

@Injectable()
export class PeopleService {
	constructor(private readonly peopleRepository: PeopleRepository) {}

	async findOne(id: string): Promise<IPersonBase | null> {
		const result = await this.peopleRepository.findOne(id);
		return result;
	}
}
