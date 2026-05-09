// src/modules/content/weather/weather.repository.ts
import { Injectable } from '@nestjs/common';
import { IWeatherDataRaw } from './weather.interface.js';
import { RedisService } from '../../../system/database/redis/redis.service.js';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';

@Injectable()
export class WeatherRepository {
	private readonly KEY_PREFIX = 'weather:';

	constructor(
		private readonly _postgreSQLService: PostgreSQLService,
		private readonly _redisService: RedisService,
		private readonly _logger: WinstonLoggerService,
	) {}

	/**
	 * Retrieves last hour result from Redis
	 * @param locationKey // the location name
	 */
	public async getLast(locationKey: string): Promise<IWeatherDataRaw | null> {
		// Building complete key
		const key = this.KEY_PREFIX + locationKey;

		// Retrieving data
		const jsonString = await this._redisService.get(key);

		// If no data, return null
		if (!jsonString) {
			return null;
		}

		try {
			// Parsing data
			return JSON.parse(jsonString) as IWeatherDataRaw;
		} catch (e) {
			const errorMessage = getErrorMessage(e);
			this._logger.error('Error parsing Redis data for key ' + key + ': ' + errorMessage);
			// Deleting corrupted key
			await this._redisService.del(key);
			return null;
		}
	}

	/** Retreiving last 24h results.
	 * Date formatting complies with ISO 8601 */
	public async getLast24H(): Promise<IWeatherDataRaw[]> {
		const sqlRequest = `SELECT 
            DATE_FORMAT(date, '%Y-%m-%dT%H:%i:%s.000Z') AS date, 
            pressure, 
            temperature, 
            humidity,  
            weather_score 
            FROM content.weather 
            ORDER BY date 
            DESC
            LIMIT 24`;
		const rawResults: IWeatherDataRaw[] = await this._postgreSQLService.execute(
			sqlRequest,
			[],
			'standard',
			true,
		);
		if (rawResults.length === 0) return [];
		const transformedResults: IWeatherDataRaw[] = rawResults.map(
			(currentItem) => ({
				date: new Date(currentItem.date),
				pressure: currentItem.pressure,
				temperature: currentItem.temperature,
				humidity: currentItem.humidity,
				weather_score: currentItem.weather_score,
			}),
		);
		return transformedResults;
	}

	/**
	 * Stores weather data in Redis
	 * @param locationKey // the name of the location
	 * @param weatherData // weather data
	 */
	public async setWeather(
		locationKey: string,
		weatherData: IWeatherDataRaw,
		ttlSeconds: number,
	) {
		const key = this.KEY_PREFIX + locationKey;
		const jsonString = JSON.stringify(weatherData);
		await this._redisService.setWithTTL(key, jsonString, ttlSeconds);
	}

	/**
	 * Stores weather data in PostgreSQL
	 * @param weatherData
	 * @param ip_sender
	 */
	public async setWeatherInPostgreSQL(
		weatherData: IWeatherDataRaw,
		ip_sender: string,
	) {
		const sqlRequest = `INSERT INTO content.weather 
    (date, pressure, temperature, humidity, id_provider, weather_score) 
    VALUES ($1, $2, $3, $4, $5, $6)`;
		const params = [
			weatherData.date,
			weatherData.pressure,
			weatherData.temperature,
			weatherData.humidity,
			2, // id_provider is hardcoded to 2 as we have only one provider for now
			weatherData.weather_score,
		];
		await this._postgreSQLService.execute(sqlRequest, params, 'standard');
	}
}
