// src/modules/content/weather/weather.controller.ts
import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { WeatherService } from './weather.service.js';
import { IWeatherData } from './weather.interface.js';
import type { Response } from 'express';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
	constructor(private readonly _weatherService: WeatherService) {}

	@ApiOperation({ summary: 'Get weather data for the last hour' })
	@ApiOkResponse({ description: 'Weather data retrieved successfully' })
	@Get('last1h')
	async getLastHour(@Res() res: Response) {
		const weatherData: IWeatherData | null =
			await this._weatherService.getLastHour();
		if (!weatherData) {
			return res.status(HttpStatus.NO_CONTENT).send(); // Returns 204 status
		}

		return res.status(HttpStatus.OK).json(weatherData);
	}

	@ApiOperation({ summary: 'Get weather data for the last 24 hours' })
	@ApiOkResponse({ description: 'Weather data retrieved successfully' })
	@Get('last24h')
	async getLast24h(@Res() res: Response) {
		const weatherData: IWeatherData[] | null =
			await this._weatherService.getLast24h();
		if (!weatherData) {
			return res.status(HttpStatus.NO_CONTENT).send(); // Returns 204 status
		}

		return res.status(HttpStatus.OK).json(weatherData);
	}
}
