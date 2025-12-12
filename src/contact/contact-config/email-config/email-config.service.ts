// src/contact/contact-config/email-config/email-config.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Configuration interface for an email account
export interface IEmailAccountConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
}

type EmailContactMode = 'noreply' | 'newsletter' | 'support';

@Injectable()
export class EmailConfigService {
	// Storing configurations in memory after first load
	private readonly configCache: Record<EmailContactMode, IEmailAccountConfig> =
		{} as Record<EmailContactMode, IEmailAccountConfig>;

	constructor(private readonly nestConfigService: ConfigService) {}

	/**
	 * Loads and validates the configuration for a specific email mode.
	 * The configuration is cached after the first successful call.
	 */
	public getAccountConfig(mode: EmailContactMode): IEmailAccountConfig {
		if (this.configCache[mode]) {
			return this.configCache[mode];
		}

		// --- 1. Retrieving common parameters ---
		const host =
			this.nestConfigService.get<string>('COMMON_EMAIL_HOST') ||
			'mail.mcitys.com';
		const port = this.nestConfigService.get<number>('COMMON_EMAIL_PORT', 465); // Using default value
		const secure =
			this.nestConfigService.get<string>('COMMON_EMAIL_SECURE') === 'true';

		// --- 2. Retrieving mode-specific credentials ---
		const MODE_UPPER = mode.toUpperCase();

		// Getting user and password keys
		const userKey = `${MODE_UPPER}_EMAIL_USER`;
		const passKey = `${MODE_UPPER}_EMAIL_PASS`;

		const user = this.nestConfigService.get<string>(userKey);
		const pass = this.nestConfigService.get<string>(passKey);

		// --- 3. Validation ---
		if (!user || !pass) {
			throw new InternalServerErrorException(
				`Missing credentials for email mode: ${mode} (${userKey}/${passKey}).`,
			);
		}

		// --- 4. Caching and returning the configuration ---
		const finalConfig: IEmailAccountConfig = {
			host,
			port,
			secure,
			auth: { user, pass },
		};

		this.configCache[mode] = finalConfig;
		return finalConfig;
	}
}
