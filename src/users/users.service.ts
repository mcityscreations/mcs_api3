// src/users/users.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from './repository/user.repository.js';
import { IUser } from './types/user.interface.js';
import { ContactService } from '../contact/contact.service.js';
import { IContact } from '../contact/types/contact.interface.js';

@Injectable()
export class UsersService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly contactService: ContactService,
	) {}

	public async getUserByUsername(username: string): Promise<IUser | null> {
		if (!username || username.trim() === '') {
			return null;
		}
		const users = await this.userRepository.getUserDetailsByUsername(username);
		return users.length > 0 ? users[0] : null;
	}

	public async getUserPasswordByUsername(
		username: string,
	): Promise<{ passwordHash: string; passwordSalt: string } | null> {
		const result =
			await this.userRepository.getUserPasswordByUsername(username);
		return result.length > 0 ? result[0] : null;
	}

	public async getUserContactsByUsername(
		username: string,
	): Promise<IContact[] | null> {
		if (!username || username.trim() === '') {
			throw new BadRequestException('A valid username must be provided.');
		}
		const personId = await this.getPersonIDByUsername(username);
		if (!personId) {
			return null;
		}
		const result: IContact[] | undefined =
			await this.contactService.getPersonContacts(personId);
		return result || null;
	}

	public async getPersonIDByUsername(username: string): Promise<string | null> {
		if (!username || username.trim() === '') {
			throw new BadRequestException('A valid username must be provided.');
		}
		const user = await this.userRepository.getPersonIDByUsername(username);
		return user.length > 0 ? user[0].idPersonPublic : null;
	}
}
