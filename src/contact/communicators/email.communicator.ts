// src/communicator/email.communicator.ts

import { Inject, InternalServerErrorException } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import { CommunicatorBase } from './base.communicator';
import {
	EmailConfigService,
	IEmailAccountConfig,
} from '../contact-config/email-config/email-config.service';
import { WINSTON_LOGGER } from 'src/system/logger/logger-factory/winston-logger.factory';
import { Logger } from 'winston';

// Tokens for Email communicator injections
export const EMAIL_COMMUNICATOR_NOREPLY = 'EMAIL_COMMUNICATOR_NOREPLY';
export const EMAIL_COMMUNICATOR_SUPPORT = 'EMAIL_COMMUNICATOR_SUPPORT';
export const EMAIL_COMMUNICATOR_NEWSLETTER = 'EMAIL_COMMUNICATOR_NEWSLETTER';
import { SendEmailDto } from '../dto/contact.dto';

type EmailMode = 'noreply' | 'newsletter' | 'support';

export class EmailCommunicator extends CommunicatorBase {
	// Defining Nodemailer transporter and config with proper types
	protected _transporter: Transporter;
	protected _config: IEmailAccountConfig;
	private readonly _senderAddress: string;

	constructor(
		contactMode: EmailMode,
		private readonly _emailConfigService: EmailConfigService,
		@Inject(WINSTON_LOGGER) private readonly _logger: Logger,
	) {
		// The channel is always 'email' for this communicator
		// Call the base constructor
		super(contactMode, 'email');

		// Retrieving the configuration specific to this mode
		const config: IEmailAccountConfig =
			this._emailConfigService.getAccountConfig(contactMode);
		this._config = config;

		// Setting the sender address
		if (config && config.auth && config.auth.user) {
			this._senderAddress = config.auth.user;
		} else {
			throw new InternalServerErrorException(
				"Email configuration incomplete: 'auth.user' missing.",
			);
		}
		this.instantiateTransporter();
	}

	// Instantiating the Nodemailer transporter
	instantiateTransporter(): void {
		this._logger.info(
			`Instantiating transporter for mode: ${this._contactMode}`,
		);
		if (!this._config) {
			throw new InternalServerErrorException(
				`Email configuration is missing for mode: ${this._contactMode}.`,
			);
		}
		const transporterConfig: SMTPTransport.Options = {
			host: this._config.host,
			port: this._config.port,
			secure: this._config.secure,
			auth: {
				user: this._config.auth.user,
				pass: this._config.auth.pass,
			},
		};
		this._transporter = createTransport(transporterConfig);
	}

	public async sendMessage(data: SendEmailDto): Promise<boolean> {
		const { destinations, text, subject } = data;
		const destinationsArray = Array.isArray(destinations)
			? destinations
			: [destinations];
		const trimmedSubject = subject.trim();
		const trimmedText = text.trim();

		try {
			if (!this._transporter) {
				throw new InternalServerErrorException(
					'Email transporter is not instantiated.',
				);
			}

			const mailOptions = {
				from: this._senderAddress,
				to: destinationsArray.join(', '), // Converting array to comma-separated string for Nodemailer
				subject: trimmedSubject,
				text: trimmedText,
			};

			await this._transporter.sendMail(mailOptions);

			this._logger.info(
				`Email successfully sent to ${destinationsArray.length} recipients via mode ${this._contactMode}.`,
			);
			return true;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			this._logger.error(
				`Error sending email via mode ${this._contactMode}: ${errorMessage}`,
			);

			throw new InternalServerErrorException(
				`Email sending failed for mode ${this._contactMode}: ${errorMessage}`,
			);
		}
	}
}
