import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { IWeatherData } from './weather.interface';
import type { Response } from 'express';

@Controller('weather')
export class WeatherController {
	constructor(private readonly _weatherService: WeatherService) {}
	@Get('last24h')
	async getLastHour(@Res() res: Response) {
		const weatherData: IWeatherData | null =
			await this._weatherService.getLastHour();
		if (!weatherData) {
			return res.status(HttpStatus.NO_CONTENT).send(); // Returns 204 status
		}

		return res.status(HttpStatus.OK).json(weatherData);
	}
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
