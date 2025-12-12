import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importing services and communicators
import { ContactService } from './contact.service';
import { SmsConfigService } from './contact-config/sms-config/sms-config.service';
import { EmailConfigService } from './contact-config/email-config/email-config.service';
import { EmailCommunicator } from './communicators/email.communicator';
import {
	EMAIL_COMMUNICATOR_NOREPLY,
	EMAIL_COMMUNICATOR_SUPPORT,
	EMAIL_COMMUNICATOR_NEWSLETTER,
} from './communicators/email.communicator';
import {
	SMS_COMMUNICATOR,
	SmsCommunicator,
} from './communicators/sms.communicator';

// Importing system module and entities
import { SystemModule } from 'src/system/system.module';
import { PersonContactEntity } from './entities/person-contact.entity';
import { Logger } from 'winston';
import { WINSTON_LOGGER } from 'src/system/logger/logger-factory/winston-logger.factory';

@Module({
	imports: [SystemModule, TypeOrmModule.forFeature([PersonContactEntity])],
	providers: [
		ContactService,
		EmailConfigService,
		SmsConfigService,
		// --- 1. Factory for the 'NOREPLY' communicator ---
		{
			provide: EMAIL_COMMUNICATOR_NOREPLY, // The token to be injected
			useFactory: (emailConfigService: EmailConfigService, logger: Logger) => {
				return new EmailCommunicator('noreply', emailConfigService, logger);
			},
			// The service to inject for the factory
			inject: [EmailConfigService, WINSTON_LOGGER],
		},
		// --- 2. Factory for the 'SUPPORT' communicator ---
		{
			provide: EMAIL_COMMUNICATOR_SUPPORT,
			useFactory: (emailConfigService: EmailConfigService, logger: Logger) => {
				return new EmailCommunicator('support', emailConfigService, logger);
			},
			inject: [EmailConfigService, WINSTON_LOGGER],
		},

		// --- 3. Factory for the 'NEWSLETTER' communicator ---
		{
			provide: EMAIL_COMMUNICATOR_NEWSLETTER,
			useFactory: (emailConfigService: EmailConfigService, logger: Logger) => {
				return new EmailCommunicator('newsletter', emailConfigService, logger);
			},
			inject: [EmailConfigService, WINSTON_LOGGER],
		},
		// --- 4. Factory for the 'SMS' communicator ---
		{
			provide: SMS_COMMUNICATOR,
			useFactory: (smsConfigService: SmsConfigService, logger: Logger) => {
				return new SmsCommunicator(smsConfigService, logger);
			},
			inject: [SmsConfigService, WINSTON_LOGGER],
		},
	],
	exports: [
		TypeOrmModule.forFeature([PersonContactEntity]),
		EMAIL_COMMUNICATOR_NOREPLY,
		EMAIL_COMMUNICATOR_SUPPORT,
		EMAIL_COMMUNICATOR_NEWSLETTER,
		SMS_COMMUNICATOR,
	],
})
export class ContactModule {}
