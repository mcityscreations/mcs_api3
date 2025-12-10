import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IWeatherProviderConfig, ProviderType } from '../weather.interface';

@Injectable()
export class WeatherProviderConfigService {
	private weatherConfig: IWeatherProviderConfig;

	constructor(private readonly configService: ConfigService) {
		this.weatherConfig = {
			openWeatherMap: {
				apiKey:
					this.configService.get<string>('OPEN_WEATHER_MAP_API_KEY') || '',
				enabled: this.toBoolean(
					this.configService.get<string>('OPEN_WEATHER_MAP_ENABLED'),
				),
			},
			accuWeather: {
				apiKey: this.configService.get<string>('ACCU_WEATHER_API_KEY') || '',
				enabled: this.toBoolean(
					this.configService.get<string>('ACCU_WEATHER_ENABLED'),
				),
			},
			meteoFrance: {
				apiKey: this.configService.get<string>('METEO_FRANCE_API_KEY') || '',
				enabled: this.toBoolean(
					this.configService.get<string>('METEO_FRANCE_ENABLED'),
				),
			},
			defaultProvider:
				(this.configService.get<ProviderType>(
					'DEFAULT_WEATHER_PROVIDER',
				) as ProviderType) || 'OPEN_WEATHER_MAP',
		};
	}

	/**
	 * Function that transforms env. variables (strings by default) to boolean values
	 */
	private toBoolean = (envVar: string | undefined): boolean => {
		// If variable is undefined, return False by default
		if (!envVar) return false;

		// Converting to lowercase for verification
		const value = envVar.toLowerCase();

		// Returns true if the value is 'true', '1', 'yes', 'on', etc.
		return (
			value === 'true' || value === '1' || value === 'yes' || value === 'on'
		);
	};

	/**
	 * Returns OpenWeather Map config.
	 */
	public getOpenWeatherMapConfig() {
		return this.weatherConfig.openWeatherMap;
	}
}
