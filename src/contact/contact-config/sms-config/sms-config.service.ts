// src/contact/contact-config/sms-config/sms-config.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IOvhConfig {
	provider: 'OVH';
	appID: string;
	appSecret: string;
	consumerKey: string;
	senderForResponse?: boolean; // Optional, defaults to true
}

@Injectable()
export class SmsConfigService {
	private readonly config: IOvhConfig;

	constructor(private readonly nestConfigService: ConfigService) {
		this.config = this.loadConfig();
	}

	private loadConfig(): IOvhConfig {
		const provider = this.nestConfigService.get<string>('SMS_PROVIDER');

		if (!provider || provider !== 'OVH') {
			throw new InternalServerErrorException(
				`SMS provider missing or not supported: ${provider}.`,
			);
		}

		// Récupération des clés OVH
		const appID = this.nestConfigService.get<string>('OVH_APPLICATION_KEY');
		const appSecret = this.nestConfigService.get<string>(
			'OVH_APPLICATION_SECRET',
		);
		const consumerKey = this.nestConfigService.get<string>('OVH_CONSUMER_KEY');

		// Validation des clés
		if (!appID || !appSecret || !consumerKey) {
			throw new InternalServerErrorException(
				'OVH API keys are missing (KEY/SECRET/CONSUMER).',
			);
		}

		return {
			provider: 'OVH',
			appID,
			appSecret,
			consumerKey,
		};
	}

	public getOvhConfig(): IOvhConfig {
		return this.config;
	}
}
