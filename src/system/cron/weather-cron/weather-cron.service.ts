// system/cron/weather-cron.service.ts

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WeatherService } from '../../../weather/weather.service';
import { isErrorWithMessage } from '../../../common/types/error.types';

@Injectable()
export class WeatherCronService {
	constructor(private readonly weatherService: WeatherService) {}

	// Configuring Cron task
	@Cron('0 * * * *', {
		name: 'weather-pre-fetch',
		timeZone: 'Europe/Paris',
	})
	async handleWeatherUpdate() {
		console.log(`--- Executing Cron task - Updating weather data...) ---`);

		try {
			// Calling weather service
			await this.weatherService.setWeather();
			console.log('Weather successfully uploaded.');
		} catch (error) {
			if (isErrorWithMessage(error)) {
				console.error(
					'Unable to retrieve current weather in Marseille :',
					error.message,
				);
			}
		}
	}
}
