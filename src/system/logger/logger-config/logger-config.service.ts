// system/logger/logger-config.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerConfigService {
	constructor(private readonly configService: ConfigService) {}

	public getMongoUri(): string {
		// Loading MongoDB URI (SRV format for managed environments)
		const uri = this.configService.get<string>('MONGODB_LOG_URI_SRV');

		if (!uri) {
			throw new InternalServerErrorException(
				'MONGODB_LOG_URI not found in environment configuration.',
			);
		}
		return uri;
	}
}
