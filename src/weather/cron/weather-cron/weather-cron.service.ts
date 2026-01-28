// src/weather/cron/weather-cron/weather-cron.service.ts

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WeatherService } from '../../../weather/weather.service.js';
import { isErrorWithMessage } from '../../../common/validators/error.validators.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';

@Injectable()
export class WeatherCronService {
	constructor(
		private readonly weatherService: WeatherService,
		private readonly logger: WinstonLoggerService,
	) {}

	// Configuring Cron task
	@Cron('0 * * * *', {
		name: 'weather-pre-fetch',
		timeZone: 'Europe/Paris',
	})
	async handleWeatherUpdate() {
		this.logger.log('--- Executing Cron task - Updating weather data... ---', {
			context: 'WeatherCronService',
		});

		try {
			// Calling weather service
			await this.weatherService.setWeather();
			this.logger.log('Weather data updated successfully.', {
				context: 'WeatherCronService',
			});
		} catch (error) {
			if (isErrorWithMessage(error)) {
				this.logger.error(
					'Failed to retrieve current weather in Marseille.',
					error.stack,
					{
						context: 'WeatherCronService',
					},
				);
			}
		}
	}
}
