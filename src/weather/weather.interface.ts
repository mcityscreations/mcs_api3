import { IOpenWeatherOptions } from './weather.validators';

export interface IWeatherDataRaw {
	date: Date;
	pressure: number;
	humidity: number;
	temperature: number;
	weather_score?: number;
}

export interface IWeatherData {
	date: string;
	pressure: number;
	humidity: number;
	temperature: number;
	weather_score?: number;
}

/** WEATHER PROVIDERS */

// Abstract class that defines common rules that every provider must apply
export abstract class WeatherProvider {
	constructor() {}

	public abstract setApiKey(apiKey: string): void;
	public abstract getCurrentWeather(
		latitude: number,
		longitude: number,
		options?: IOpenWeatherOptions,
	): Promise<IWeatherDataRaw>;
}

// List of available providers
export type ProviderType = 'OPEN_WEATHER_MAP' | 'ACCU_WEATHER' | 'METEO_FRANCE';

// Providers' config interface

export interface IWeatherProviderConfig {
	openWeatherMap: {
		apiKey: string;
		enabled: boolean;
	};
	accuWeather: {
		apiKey: string;
		enabled: boolean;
	};
	meteoFrance: {
		apiKey: string;
		enabled: boolean;
	};
	// Le fournisseur par défaut à utiliser
	defaultProvider: ProviderType;
}
/*
export interface IWeatherProviderConfig {
	apiKey: string;
	enabled: boolean;
}*/

// Interface of the response sent by OpenWeatherMap
export interface IOpenAPIResponse {
	lat: number;
	lon: number;
	timezone: string; //America/Chicago
	timezone_offset: number; //-18000
	current?: IOpenWeatherResponseBasic;
	minutely: [
		{
			dt: number;
			precipitation: number;
		},
	];
	hourly?: [IOpenWeatherResponseBasic];
	daily?: [
		{
			dt: number;
			sunrise: number;
			sunset: number;
			moonrise: number;
			moonset: number;
			moon_phase: number;
			summary: string;
			temp: {
				day: number;
				min: number;
				max: number;
				night: number;
				eve: number;
				morn: number;
			};
			feels_like: {
				day: number;
				night: number;
				eve: number;
				morn: number;
			};
			pressure: number;
			humidity: number;
			dew_point: number;
			wind_speed: number; //3.13
			wind_deg: number; //93
			wind_gust: number; //6.71
			weather: [
				{
					id: number; //803
					main: string; //Clouds
					description: string; //Broken clouds
					icon: string; //04d
				},
			];
			clouds: number;
			pop: number;
			rain: number;
			uvi: number;
		},
	];
	alerts: any;
}

export interface IOpenWeatherResponseBasic {
	dt: number; //1684929490
	sunrise: number; //1684926645
	sunset: number; //1684977332
	temp: number; //292.55
	feels_like: number; //292.87
	pressure: number; //1014
	humidity: number; //89
	dew_point: number; //290.69
	uvi: number; //0.16
	clouds: number; //53
	visibility: number; //10000
	wind_speed: number; //3.13
	wind_deg: number; //93
	wind_gust: number; //6.71
	weather: [
		{
			id: number; //803
			main: string; //Clouds
			description: string; //Broken clouds
			icon: string; //04d
		},
	];
	pop?: number;
}
