import { Injectable } from '@nestjs/common';
import { ArtistRepositoryService } from '../repository/artist.repository.js';
import { NotFoundError } from '../../../../system/errors/not-found.error.js';
import { UsersService } from '../../../identity/users/users.service.js';
@Injectable()
export class ArtistService {
	constructor(
		private readonly artistRepository: ArtistRepositoryService,
		private readonly userService: UsersService,
	) {}

	public async findOne(id: string) {
		const result = await this.artistRepository.findOne(id);
		if (!result) {
			throw new NotFoundError(`Artist with ID ${id} not found.`);
		}
		return result;
	}

	public async findOneByUsername(username: string) {
		const personID = await this.userService.getPersonIDByUsername(username);
		if (!personID) {
			throw new NotFoundError(`User with username ${username} not found.`);
		}
		const result = await this.artistRepository.findOneByPersonId(personID);
		if (!result) {
			throw new NotFoundError(
				`Artist for user with username ${username} not found.`,
			);
		}
		return result;
	}
}
