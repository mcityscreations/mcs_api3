// system/cron/weather-cron.service.ts

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WeatherService } from '../../../weather/weather.service';
import { isErrorWithMessage } from '../../../common/types/error.types';
import { WinstonLoggerService } from '../../logger/logger-service/winston-logger.service';

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
