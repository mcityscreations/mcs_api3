// src/communicator/communicator.base.ts

import { IEmailAccountConfig } from '../contact-config/email-config/email-config.service';
import { IOvhConfig } from '../contact-config/sms-config/sms-config.service';
import { Transporter } from 'nodemailer';
import { BaseMessageDto } from '../dto/contact.dto';

// Types for contact mode and channel
type ContactMode = 'noreply' | 'sms' | 'newsletter' | 'support';
type CommunicationChannel = 'email' | 'sms';

// Generic type for communicator configuration
type CommunicatorConfig = IEmailAccountConfig | IOvhConfig;

export abstract class CommunicatorBase {
	// The transporter will be defined in child classes with proper types
	protected abstract _transporter: Transporter;

	// The contact mode (e.g., 'noreply', 'sms', etc.)
	protected readonly _contactMode: ContactMode;

	// The communication channel (e.g., 'email' or 'sms')
	protected readonly _channel: CommunicationChannel;

	// The configuration will be stored in children, here it is typed as 'CommunicatorConfig' (union)
	protected abstract _config: CommunicatorConfig;

	constructor(contactMode: ContactMode, channel: CommunicationChannel) {
		this._contactMode = contactMode;
		this._channel = channel;
	}

	abstract instantiateTransporter(): void;

	public abstract sendMessage(data: BaseMessageDto): Promise<boolean>;
}
