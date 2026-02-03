// src/modules/content/contact/contact.module.ts
import { Module } from '@nestjs/common';

// Importing services and communicators
import { ContactService } from './contact.service.js';
import { ContactRepository } from './repository/contact.repository.js';
import { SmsConfigService } from './contact-config/sms-config/sms-config.service.js';
import { EmailConfigService } from './contact-config/email-config/email-config.service.js';
import {
	EmailCommunicator,
	EMAIL_COMMUNICATOR_NOREPLY,
	EMAIL_COMMUNICATOR_SUPPORT,
	EMAIL_COMMUNICATOR_NEWSLETTER,
} from './communicators/email.communicator.js';
import {
	SMS_COMMUNICATOR,
	SmsCommunicator,
} from './communicators/sms.communicator.js';

// Importing system module and entities
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';

@Module({
	providers: [
		ContactService,
		EmailConfigService,
		SmsConfigService,
		// --- 1. Factory for the 'NOREPLY' communicator ---
		{
			provide: EMAIL_COMMUNICATOR_NOREPLY, // The token to be injected
			useFactory: (
				emailConfigService: EmailConfigService,
				logger: WinstonLoggerService,
			) => {
				return new EmailCommunicator('noreply', emailConfigService, logger);
			},
			// The service to inject for the factory
			inject: [EmailConfigService, WinstonLoggerService],
		},
		// --- 2. Factory for the 'SUPPORT' communicator ---
		{
			provide: EMAIL_COMMUNICATOR_SUPPORT,
			useFactory: (
				emailConfigService: EmailConfigService,
				logger: WinstonLoggerService,
			) => {
				return new EmailCommunicator('support', emailConfigService, logger);
			},
			inject: [EmailConfigService, WinstonLoggerService],
		},

		// --- 3. Factory for the 'NEWSLETTER' communicator ---
		{
			provide: EMAIL_COMMUNICATOR_NEWSLETTER,
			useFactory: (
				emailConfigService: EmailConfigService,
				logger: WinstonLoggerService,
			) => {
				return new EmailCommunicator('newsletter', emailConfigService, logger);
			},
			inject: [EmailConfigService, WinstonLoggerService],
		},
		// --- 4. Factory for the 'SMS' communicator ---
		{
			provide: SMS_COMMUNICATOR,
			useFactory: (
				smsConfigService: SmsConfigService,
				logger: WinstonLoggerService,
			) => {
				return new SmsCommunicator(smsConfigService, logger);
			},
			inject: [SmsConfigService, WinstonLoggerService],
		},
		ContactRepository,
	],
	exports: [
		EMAIL_COMMUNICATOR_NOREPLY,
		EMAIL_COMMUNICATOR_SUPPORT,
		EMAIL_COMMUNICATOR_NEWSLETTER,
		SMS_COMMUNICATOR,
		ContactService,
	],
})
export class ContactModule {}
