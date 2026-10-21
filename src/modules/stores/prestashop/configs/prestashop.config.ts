import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrestashopConfigService {
	constructor(private readonly configService: ConfigService) {}

	get key(): string {
		const key = `${this.configService.get<string>('PRESTASHOP_KEY')?.trim()}:`;
		if (!key) {
			throw new InternalServerErrorException(
				'PRESTASHOP_KEY is not defined in the environment variables',
			);
		}
		return key;
	}

	// Recommended connection method for PrestaShop API is Basic Authentication,
	// which requires the key to be encoded in Base64 format
	get authorizationKey(): string {
		const authorizationKey = Buffer.from(this.key).toString('base64');
		return `Basic ${authorizationKey}`;
	}

	get url(): string {
		const url = this.configService.get<string>('PRESTASHOP_URL')?.trim();
		if (!url) {
			throw new InternalServerErrorException(
				'PRESTASHOP_URL is not defined in the environment variables',
			);
		}
		return url;
	}
}
