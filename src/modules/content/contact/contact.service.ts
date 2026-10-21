// src/modules/content/contact/contact.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { arrayValidator } from '../../../common/validators/array.validator.js';
import { isUuidV7 } from '../../../common/validators/isuuidv7.validator.js';
import { SmsCommunicator } from './communicators/sms.communicator.js';
import { EmailCommunicator } from './communicators/email.communicator.js';
import { BaseMessageDto, SendEmailDto, SendSmsDto } from './dto/contact.dto.js';
import { ContactRepository } from './repository/contact.repository.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import type { IContact, IAddContact } from './schemas/contact.schema.js';
import { AddContactSchema } from './schemas/contact.schema.js';
import {
	BadRequestError,
	InternalError,
	ForbiddenError,
	NotFoundError,
} from '../../../system/errors/index.js';

@Injectable()
export class ContactService {
	constructor(
		@Inject('EMAIL_COMMUNICATOR_NOREPLY')
		private readonly _injectedNoreplyCommunicator: EmailCommunicator,
		@Inject('SMS_COMMUNICATOR')
		private readonly _injectedSmsCommunicator: SmsCommunicator,
		private readonly contactRepository: ContactRepository,
		private readonly _logger: WinstonLoggerService,
	) {}

	private async sendNoreplyEmail(data: SendEmailDto): Promise<void> {
		const success = await this._injectedNoreplyCommunicator.sendMessage(data);

		if (success) {
			const destinationsToString = data.destinations.join(', ');
			this._logger.log(
				`Email 'noreply' successfully sent to ${destinationsToString} with subject "${data.subject}".`,
			);
		} else {
			throw new InternalError('Failed to send noreply email.');
		}
	}

	private async sendSMS(data: SendSmsDto): Promise<void> {
		const success = await this._injectedSmsCommunicator.sendMessage(data);
		if (success) {
			const destinationsToString = data.destinations.join(', ');
			this._logger.log(`SMS successfully sent to ${destinationsToString}.`);
		} else {
			throw new InternalError('[Contact Service] Failed to send noreply sms.');
		}
	}

	public async sendMessage(
		personId: number | string,
		data: BaseMessageDto,
	): Promise<void> {
		// 1. Retrieve person's contacts
		const contacts = await this.getPersonContacts(personId);
		if (contacts.length === 0) {
			throw new BadRequestError('No contacts found for the specified person.');
		}

		// 2. Filter primary contacts
		const primaryContact = contacts.find((contact) => contact.isPrimary);
		if (!primaryContact) {
			throw new ForbiddenError('Invalid request or user configuration.');
		}
		// 3. Send message to the primary contact
		if (primaryContact.contactCategory.id === 1) {
			if (
				!('destinations' in data) ||
				!('subject' in data) ||
				!('text' in data) ||
				data.subject === undefined
			) {
				throw new BadRequestError(
					'Contact method is email, but provided data is not for email.',
				);
			}
			await this.sendNoreplyEmail({
				destinations: [primaryContact.value],
				subject: data.subject,
				text: data.text,
			});
		}
		if (primaryContact.contactCategory.id === 2) {
			if (!('destinations' in data) || !('text' in data)) {
				throw new BadRequestError(
					'Contact method is SMS, but provided data is not for SMS.',
				);
			}
			await this.sendSMS({
				destinations: [primaryContact.value],
				text: data.text,
			});
		}
	}

	public async addPersonContact(payload: IAddContact): Promise<string | null> {
		// Parse payload using Zod schema
		const parsedPayload = AddContactSchema.safeParse(payload);
		if (!parsedPayload.success) {
			throw new BadRequestError(
				`[Contact Service] Invalid payload: ${parsedPayload.error.message}`,
			);
		}
		const addressID = await this.contactRepository.addContact(
			parsedPayload.data,
		);
		if (!addressID) {
			throw new InternalError(
				`[Contact Service] Failed to add contact for person ID ${payload.idPerson} and value ${payload.value}.`,
			);
		}
		return addressID;
	}

	public async getPersonContacts(
		personId: number | string,
	): Promise<IContact[]> {
		// 1. Executing the proper query based on the ID type
		if (isUuidV7(personId)) {
			const result = await this.contactRepository.findContactsByPublicId(
				personId as string,
			);
			if (!result || result.length === 0) {
				throw new NotFoundError(
					`[Contact Service] No contacts associated to the given person ID.`,
				);
			}
			return result;
		}

		// 2. If not UUID, is it a number?
		const numericId = Number(personId);
		if (Number.isNaN(numericId) || numericId <= 0) {
			throw new BadRequestError(
				'Invalid Person ID format. Expected UUID v7 or positive number.',
			);
		}
		const result =
			await this.contactRepository.findContactsByPersonId(numericId);
		if (!result || result.length === 0) {
			throw new NotFoundError(
				`[Contact Service] No contacts associated to the given person ID.`,
			);
		}
		return result;
	}

	/**
	 * @param contact an array of email or phone numbers
	 * @returns person public ID
	 */
	public async findPersonByContact(contacts: string[]): Promise<string | null> {
		if (!arrayValidator(z.string(), contacts))
			throw new BadRequestError('Invalid contacts array provided');
		for (const contact of contacts) {
			const result = await this.contactRepository.findPersonByContact(contact);
			if (result) {
				return result;
			}
		}
		return null;
	}
}
