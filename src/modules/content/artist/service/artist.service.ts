import { Injectable } from '@nestjs/common';
import { ArtistRepository } from '../repository/artist.repository.js';
import { NotFoundError } from '../../../../system/errors/not-found.error.js';

@Injectable()
export class ArtistService {
	constructor(private readonly artistRepository: ArtistRepository) {}

	public async findOne(id: string) {
		const result = await this.artistRepository.findOne(id);
		if (!result) {
			throw new NotFoundError(`Artist with ID ${id} not found.`);
		}
		return result;
	}

	public async findOneByPersonId(personID: string) {
		const result = await this.artistRepository.findOneByPersonId(personID);
		if (!result) {
			throw new NotFoundError(
				`Artist for person with ID ${personID} not found.`,
			);
		}
		return result;
	}
}
