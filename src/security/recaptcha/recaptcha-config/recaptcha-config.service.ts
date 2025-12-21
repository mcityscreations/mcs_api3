// src/security/recaptcha/recaptcha-config/recaptcha-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

export interface IRecaptchaConfig {
	projectId: string;
	recaptchaSiteKey: string;
	googleApplicationCredentials: string;
}

@Injectable()
export class RecaptchaConfigService {
	constructor(private readonly configService: ConfigService) {}

	public getRecaptchaConfig(): IRecaptchaConfig {
		// Retrieving config stored in .env file
		const projetID = this.configService.get<string>('RECAPTCHA_PROJECT_ID');
		const recaptchaKey = this.configService.get<string>('RECAPTCHA_KEY');
		const googleCredentials = this.configService.get<string>(
			'GOOGLE_APPLICATION_CREDENTIALS',
		);

		if (!projetID || projetID === '') {
			throw new InternalServerErrorException(
				'RECAPTCHA_PROJECT_ID is not defined in environment variables.',
			);
		}
		if (!recaptchaKey || recaptchaKey === '') {
			throw new InternalServerErrorException(
				'RECAPTCHA_KEY is not defined in environment variables.',
			);
		}
		if (!googleCredentials || googleCredentials === '') {
			throw new InternalServerErrorException(
				'GOOGLE_APPLICATION_CREDENTIALS is not defined in environment variables.',
			);
		}

		return {
			projectId: projetID,
			recaptchaSiteKey: recaptchaKey,
			googleApplicationCredentials: googleCredentials,
		};
	}
}
