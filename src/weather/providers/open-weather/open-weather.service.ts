import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
	WeatherProvider,
	IOpenAPIResponse,
	IWeatherDataRaw,
} from '../../weather.interface';
import {
	IOpenWeatherOptions,
	OpenWeatherExcludeArraySchema,
	OpenWeatherMapRawResponseSchema,
} from '../../weather.validators';

@Injectable()
export class OpenWeatherProvider extends WeatherProvider {
	private apiKey: string;
	private baseUrl: string = 'https://api.openweathermap.org/data/3.0/onecall';

	constructor(private readonly httpService: HttpService) {
		super();
	}

	public setApiKey(apiKey: string) {
		if (!apiKey || apiKey.trim() === '') {
			throw new InternalServerErrorException(
				'OpenWeatherMap API key is missing.',
			);
		}
		this.apiKey = apiKey;
	}

	public async getCurrentWeather(
		lat: number,
		lon: number,
		options: IOpenWeatherOptions,
	): Promise<IWeatherDataRaw> {
		try {
			// Handling options
			if (options && 'exclude' in options) {
				const validationResult = OpenWeatherExcludeArraySchema.safeParse(
					options.exclude,
				);

				if (!validationResult.success) {
					throw new InternalServerErrorException(
						'Invalid options parameters for OpenWeatherMAp.',
					);
				}
			}

			// 1. Defining a variable to store exclude params
			let excludeParam: string | undefined = undefined;

			// 2. Checking if options.exclude exists and is an array (what Zod validated)
			if (options && Array.isArray(options.exclude)) {
				excludeParam = options.exclude.join(',');
			}
			const httpResponse = await lastValueFrom(
				this.httpService.get<IOpenAPIResponse>(this.baseUrl, {
					params: {
						lat: lat,
						lon: lon,
						appid: this.apiKey,
						units: 'metric',
						lang: 'fr',
						exclude: excludeParam,
					},
				}),
			);

			const rawData: IOpenAPIResponse = httpResponse.data;
			// Validating raw data
			const validationResult =
				OpenWeatherMapRawResponseSchema.safeParse(rawData);

			if (!validationResult.success) {
				console.error(
					'Unable to parse results from OpenWeatherAPI:',
					validationResult.error,
				);
				throw new InternalServerErrorException(
					'Unable to parse results from OpenWeatherAPI.',
				);
			}

			const validRawData = validationResult.data;

			// Get current date and convert it to ISO8601
			const date = new Date(validRawData.current.dt * 1000);

			const unifiedData: IWeatherDataRaw = {
				date: date,
				temperature: validRawData.current.temp,
				pressure: validRawData.current.pressure,
				humidity: validRawData.current.humidity,
			};

			return unifiedData;
		} catch (error) {
			console.error('Error while retrieving data from OpenWeatherMap:', error);
			throw new InternalServerErrorException(
				`Impossible de récupérer la météo pour Marseille via OpenWeatherMap.`,
			);
		}
	}
}
