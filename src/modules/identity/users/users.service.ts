// src/modules/identity/users/users.service.ts

import { Injectable } from '@nestjs/common';
import {
	NotFoundError,
	ValidationError,
} from '../../../system/errors/index.js';
import { UserRepository } from './repository/user.repository.js';
import { IUser } from './types/user.interface.js';
import { ContactService } from '../../content/contact/contact.service.js';
import { IContact } from '../../content/contact/types/contact.interface.js';

@Injectable()
export class UsersService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly contactService: ContactService,
	) {}

	public async getUserByUsername(username: string): Promise<IUser | null> {
		if (!username || username.trim() === '') {
			throw new ValidationError(
				'A valid username or password must be provided.',
			);
		}
		const users = await this.userRepository.getUserDetailsByUsername(username);
		if (!users || users.length === 0)
			throw new NotFoundError(`Wrong password or ID.`);
		return users[0];
	}

	public async getUserPasswordByUsername(
		username: string,
	): Promise<{ passwordHash: string; passwordSalt: string } | null> {
		if (!username || username.trim() === '') {
			throw new ValidationError(
				'A valid username or password must be provided.',
			);
		}
		const result =
			await this.userRepository.getUserPasswordByUsername(username);
		if (!result || result.length === 0)
			throw new NotFoundError(`Wrong password or ID.`);
		return result[0];
	}

	public async getUserContactsByUsername(
		username: string,
	): Promise<IContact[] | null> {
		if (!username || username.trim() === '') {
			throw new ValidationError('A valid username must be provided.');
		}
		const personId = await this.getPersonIDByUsername(username);
		if (!personId)
			throw new NotFoundError(
				`[ Users Service ] No person associated to the given username.`,
			);
		const result: IContact[] | undefined =
			await this.contactService.getPersonContacts(personId);
		if (!result || result.length === 0)
			throw new NotFoundError(
				`[ Users Service ] No contacts associated to the given username.`,
			);
		return result;
	}

	public async getPersonIDByUsername(username: string): Promise<string | null> {
		if (!username || username.trim() === '') {
			throw new ValidationError('A valid username must be provided.');
		}
		const user = await this.userRepository.getPersonIDByUsername(username);
		if (!user || user.length === 0)
			throw new NotFoundError(`Wrong password or ID.`);
		return user[0].idPersonPublic;
	}
}
