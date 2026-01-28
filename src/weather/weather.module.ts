// src/weather/weather.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Common modules and services
import { CommonModule } from '../common/common.module.js';

// Weather services, controllers, and providers
import { WeatherService } from './weather.service.js';
import { WeatherController } from './weather.controller.js';
import { WeatherProviderConfigService } from './providers/weather.config.js';
import { OpenWeatherProvider } from './providers/open-weather/open-weather.service.js';
import { WeatherRepository } from './weather.repository.js';
import { WeatherCronService } from './cron/weather-cron/weather-cron.service.js';
@Module({
	imports: [ConfigModule, HttpModule, CommonModule],
	controllers: [WeatherController],
	providers: [
		{
			provide: 'OPENWEATHER_PROVIDER',
			useFactory: (
				configService: WeatherProviderConfigService,
				openWeatherProvider: OpenWeatherProvider,
			) => {
				// Loading configuration
				const providerConfig = configService.getOpenWeatherMapConfig();
				// Configuring the provider with the API key
				openWeatherProvider.setApiKey(providerConfig.apiKey);
				return openWeatherProvider;
			},
			inject: [WeatherProviderConfigService, OpenWeatherProvider],
		},
		WeatherProviderConfigService,
		OpenWeatherProvider,
		WeatherService,
		WeatherRepository,
		WeatherCronService,
	],
	exports: [WeatherService],
})
export class WeatherModule {}
