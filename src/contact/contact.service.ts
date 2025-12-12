import {
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { SmsCommunicator } from './communicators/sms.communicator';
import { EmailCommunicator } from './communicators/email.communicator';
import { SendEmailDto, SendSmsDto } from './dto/contact.dto';
import { Logger } from 'winston';
import { WINSTON_LOGGER } from 'src/system/logger/logger-factory/winston-logger.factory';

@Injectable()
export class ContactService {
	constructor(
		@Inject('EMAIL_COMMUNICATOR_NOREPLY')
		private readonly _injectedNoreplyCommunicator: EmailCommunicator,
		@Inject('SMS_COMMUNICATOR')
		private readonly _injectedSmsCommunicator: SmsCommunicator,
		@Inject(WINSTON_LOGGER) private readonly _logger: Logger,
	) {}

	public async sendNoreplyEmail(data: SendEmailDto): Promise<void> {
		const success = await this._injectedNoreplyCommunicator.sendMessage(data);

		if (success) {
			const destinationsToString = data.destinations.join(', ');
			this._logger.info(
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
			this._logger.info(`SMS successfully sent to ${destinationsToString}.`);
		} else {
			throw new InternalServerErrorException('Failed to send noreply sms.');
		}
	}
}
