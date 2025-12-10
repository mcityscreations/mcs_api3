import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from 'src/common/common.module';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { WeatherProviderConfigService } from './providers/weather.config';
import { OpenWeatherProvider } from './providers/open-weather/open-weather.service';
import { WeatherRepository } from './weather.repository';

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
	],
})
export class WeatherModule {}
