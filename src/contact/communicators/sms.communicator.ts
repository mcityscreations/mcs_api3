// src/contact/communicators/sms.communicator.ts

import {
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common';
import ovh from 'ovh';
import { CommunicatorBase } from './base.communicator.js';
import {
	SmsConfigService,
	IOvhConfig,
} from '../contact-config/sms-config/sms-config.service.js';
import { getErrorMessage } from '../../common/utils/error.utils.js';
import { SendSmsDto } from '../dto/contact.dto.js';
import { WinstonLoggerService } from '../../system/logger/logger-service/winston-logger.service.js';

// Token for SMS communicator injection
export const SMS_COMMUNICATOR = 'SMS_COMMUNICATOR';

export class SmsCommunicator extends CommunicatorBase {
	// The OVH transporter
	protected _transporter: any;
	protected _config: IOvhConfig;

	// Injection of the configuration service
	constructor(
		private readonly smsConfigService: SmsConfigService,
		private readonly _logger: WinstonLoggerService,
	) {
		// The contactMode is 'sms', the channel is 'sms'
		super('sms', 'sms');

		// Retrieve OVH configuration
		this._config = this.smsConfigService.getOvhConfig();

		// Synchronous transporter instantiation
		this.instantiateTransporter();
	}

	instantiateTransporter(): void {
		this._logger.log('Instantiating OVH transporter for SMS communication.');
		// Checking the presence of required config keys
		if (
			!this._config.appID ||
			!this._config.appSecret ||
			!this._config.consumerKey
		) {
			throw new InternalServerErrorException(
				'OVH configuration keys are missing.',
			);
		}

		const ovhConfigClient = {
			appKey: this._config.appID,
			appSecret: this._config.appSecret,
			consumerKey: this._config.consumerKey,
		};

		if (!this._transporter) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
			this._transporter = ovh(ovhConfigClient);
		}
	}

	// Helper method that wraps OVH requests in a Promise
	private ovhRequest(
		method: string,
		path: string,
		params: any = {},
	): Promise<any> {
		return new Promise((resolve, reject) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			this._transporter.request(
				method,
				path,
				params,
				(err: any, result: any) => {
					if (err) {
						return reject(err as Error);
					}
					resolve(result);
				},
			);
		});
	}

	public async sendMessage(data: SendSmsDto): Promise<boolean> {
		const { destinations: destination, text } = data;
		if (!destination)
			throw new BadRequestException(
				'Destination phone number must be provided',
			);
		if (!text) throw new BadRequestException('SMS body text must be provided');

		// Handling single or multiple destinations
		const receivers = Array.isArray(destination) ? destination : [destination];
		if (receivers.length === 0) {
			throw new BadRequestException('Destination phone number array is empty.');
		}

		// STEP 1: Find the serviceName
		await this.ovhRequest('GET', '/sms')
			.then((serviceNames: string[]) => {
				if (serviceNames.length === 0) {
					throw new InternalServerErrorException(
						'No SMS service name found on OVH account.',
					);
				}
				const serviceName = serviceNames[0];
				return serviceName;
			})
			// STEP 2: Send the SMS
			.then((serviceName: string) => {
				return this.ovhRequest('POST', `/sms/${serviceName}/jobs`, {
					senderForResponse: this._config.senderForResponse || true,
					receivers: receivers,
				});
			})
			.then((result: object) => {
				// Validate the result structure
				if (!result || typeof result !== 'object') {
					throw new InternalServerErrorException(
						'Invalid response from OVH SMS sending.',
					);
				}
				if (!('jobId' in result)) {
					throw new InternalServerErrorException(
						'OVH SMS sending response missing jobId.',
					);
				}
				// Log success
				this._logger.log(
					`SMS successfully sent. Job ID: ${result.jobId as string}.`,
				);
				return true;
			})
			.catch((error: any) => {
				const errorMessage = getErrorMessage(error);
				this._logger.error(`Error sending SMS via OVH:`, errorMessage);
				throw new InternalServerErrorException(
					`OVH SMS sending failed: ${getErrorMessage(error)}`,
				);
			});
		return true;
	}
}
