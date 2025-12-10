import {
	Injectable,
	Inject,
	InternalServerErrorException,
} from '@nestjs/common';
import { OpenWeatherProvider } from './providers/open-weather/open-weather.service';
import { WeatherRepository } from './weather.repository';
import { IWeatherData, IWeatherDataRaw } from './weather.interface';
import {
	IWeatherScorePayload,
	WeatherScorePayloadSchema,
} from './weather.validators';
import { DateService } from 'src/common/dates/datesService';

@Injectable()
export class WeatherService {
	private readonly MARSEILLE_LAT = 43.295;
	private readonly MARSEILLE_LONG = 5.372;

	constructor(
		@Inject('OPENWEATHER_PROVIDER')
		private readonly _openWeatherProvider: OpenWeatherProvider,
		private readonly _weatherRepository: WeatherRepository,
		private readonly _dateService: DateService,
	) {}

	public async getLastHour(): Promise<IWeatherData | null> {
		const weatherData: IWeatherDataRaw | null =
			await this._weatherRepository.getLast('marseille');
		if (!weatherData) return null;
		// Transforming date to 'DD/MM/YYYY HH:mm' format
		this._dateService.standardDateFormater(weatherData?.date);
		// weatherData.date is now a string, returning as IWeatherData
		return weatherData as unknown as IWeatherData;
	}

	public async getLast24h(): Promise<IWeatherData[] | []> {
		const weatherData: IWeatherDataRaw[] | [] =
			await this._weatherRepository.getLast24H();
		if (weatherData?.length === 0) return [];
		const formattedData: IWeatherData[] = weatherData.map(
			(item: IWeatherDataRaw) => ({
				// Formatting date to 'DD/MM/YYYY HH:mm' string format
				date: this._dateService.standardDateFormater(item.date),
				humidity: item.humidity,
				pressure: item.pressure,
				temperature: item.temperature,
				weather_score: item.weather_score,
			}),
		);
		return formattedData;
	}

	public async setWeather() {
		// 1. Make API call
		const weatherData: IWeatherDataRaw =
			await this._openWeatherProvider.getCurrentWeather(
				this.MARSEILLE_LAT,
				this.MARSEILLE_LONG,
				{
					exclude: ['minutely', 'hourly', 'daily', 'alerts'],
					units: 'metric',
					lang: 'fr',
				},
			);

		// 2. Calculate weather score
		const weatherScore = this.getWeatherScore({
			pressure: weatherData.pressure,
			humidity: weatherData.humidity,
		});
		weatherData.weather_score = weatherScore;
		// 3. Save into Redis
		await this._weatherRepository.setWeather('marseille', weatherData, 6650);
		// 4. Save into Mariadb
		await this._weatherRepository.setWeatherInMariadb(
			weatherData,
			'37.59.121.52',
		);
		return weatherData;
	}

	public getWeatherScore(weatherData: IWeatherScorePayload): number {
		// 1. Using Zod to check incoming params
		const validationResult = WeatherScorePayloadSchema.safeParse(weatherData);

		if (!validationResult.success) {
			const errorDetails = validationResult.error.issues
				.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
				.join(', ');

			throw new InternalServerErrorException(
				`Validation failed: ${errorDetails}`,
			);
		}

		// Appending sanitized data to weatherData constant
		const { pressure, humidity } = validationResult.data;

		// Checking humidity limits
		if (humidity < 0 || humidity > 100) {
			throw new InternalServerErrorException(
				'Humidity must be between 0 and 100',
			);
		}

		// Initialising pressure & humidity score params
		let p: number = 0; // Pressure score
		let h: number = 0; // humidity score

		// === 1.Calculating Pressure score (p) ===
		if (pressure >= 1000 && pressure <= 1018) {
			// Mid pressure
			p = 0.5;
		} else if (pressure < 1000) {
			// Low pressure
			p = 1;
		} else if (pressure > 1018) {
			// High pressure
			p = 0;
		}

		// === 2. Calculating humidity score (h) ===
		// Note : L'humidité est indépendante de la pression pour son calcul de base,
		// mais le contexte du temps est donné par la pression.

		// Cas 1 : Low humidity (Clear sky)
		if (humidity < 65) {
			h = 0;
		}
		// Cas 2 :Moderate (cloudy)
		else if (humidity >= 65 && humidity <= 70) {
			h = 1;

			// If pressure is very high, even if humidity, the sky will remain clear.
			if (pressure > 1023) {
				h = 0.5;
			}
		}
		// Cas 3 : Very high (Rain/Storms)
		else if (humidity > 70) {
			h = 2;
		}

		// === 3. Final Score ===
		const finalScore = p + h;

		// Returns a score between 0 and 4 max.
		return Math.min(finalScore, 4);
	}
}
