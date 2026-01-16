import {
	Inject,
	Injectable,
	InternalServerErrorException,
	BadRequestException,
} from '@nestjs/common';
import { SmsCommunicator } from './communicators/sms.communicator';
import { EmailCommunicator } from './communicators/email.communicator';
import { SendEmailDto, SendSmsDto } from './dto/contact.dto';
import { ContactRepository } from './repository/contact.repository';
import { WinstonLoggerService } from '../system/logger/logger-service/winston-logger.service';
import { IContact } from './types/contact.interface';

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

	public async sendNoreplyEmail(data: SendEmailDto): Promise<void> {
		const success = await this._injectedNoreplyCommunicator.sendMessage(data);

		if (success) {
			const destinationsToString = data.destinations.join(', ');
			this._logger.log(
				`Email 'noreply' successfully sent to ${destinationsToString} with subject "${data.subject}".`,
			);
		} else {
			throw new InternalServerErrorException('Failed to send noreply email.');
		}
	}

	public async sendSMS(data: SendSmsDto): Promise<void> {
		const success = await this._injectedSmsCommunicator.sendMessage(data);
		if (success) {
			const destinationsToString = data.destinations.join(', ');
			this._logger.log(`SMS successfully sent to ${destinationsToString}.`);
		} else {
			throw new InternalServerErrorException('Failed to send noreply sms.');
		}
	}

	public async getPersonContacts(
		personId: number | string,
	): Promise<IContact[]> {
		// 1. Is the personId an UUID v7?
		const isUuid =
			typeof personId === 'string' &&
			/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
				personId,
			);

		// 2. Executing the proper query based on the ID type
		if (isUuid) {
			return await this.contactRepository.findContactsByPublicId(personId);
		}

		// 3. If not UUID, is it a number?
		const numericId = Number(personId);
		if (!isNaN(numericId) && numericId > 0) {
			return await this.contactRepository.findContactsByPersonId(numericId);
		}

		// 4. If we reach here, the input is invalid
		throw new BadRequestException(
			'Invalid Person ID format. Expected UUID v7 or positive number.',
		);
	}
}
