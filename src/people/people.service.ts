import { Injectable } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PeopleRepository } from './repository/people.repository';
import { IPersonBase } from './types/person.interface';

@Injectable()
export class PeopleService {
	constructor(private readonly peopleRepository: PeopleRepository) {}

	async create(createPersonDto: CreatePersonDto) {
		// Implementation for creating a person
	}
	async findAll(): Promise<IPersonBase[]> {
		// Implementation for finding all people
	}
	async findOne(id: string): Promise<IPersonBase | null> {
		const result = await this.peopleRepository.findOne(id);
		return result;
	}
	async update(id: string, updatePersonDto: UpdatePersonDto) {
		// Implementation for updating a person
	}
	async remove(id: string) {
		// Implementation for removing a person
	}
}
