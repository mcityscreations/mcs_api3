import { Injectable, Inject } from '@nestjs/common';
import { MariaDBService } from 'src/database/maria-db/maria-db.service';
import { IWeatherDataRaw } from './weather.interface';
import { RedisService } from 'src/database/redis/redis.service';
import { WINSTON_LOGGER } from '../system/logger/logger-factory/winston-logger.factory';
import { Logger } from 'winston';

@Injectable()
export class WeatherRepository {
	private readonly KEY_PREFIX = 'weather:';

	constructor(
		private readonly _mariaDBService: MariaDBService,
		private readonly _redisService: RedisService,
		@Inject(WINSTON_LOGGER) private readonly _logger: Logger,
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
			this._logger.error('Error parsing Redis data for key ' + key, e);
			// Deleting corrupted key
			await this._redisService.del(key);
			return null;
		}
	}

	/** Retreiving last 24h results.
	 * Date formatting complies with ISO 8601 */
	public async getLast24H(): Promise<IWeatherDataRaw[]> {
		const sqlRequest = `SELECT 
            DATE_FORMAT(input_date, '%Y-%m-%dT%H:%i:%s.000Z') AS date, 
            pressure, 
            temperature, 
            humidity,  
            weather_score 
            FROM mcs_weather_data 
            ORDER BY input_date 
            DESC
            LIMIT 24`;
		const rawResults: IWeatherDataRaw[] = await this._mariaDBService.execute(
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
	 * Stores weather data in MariaDB
	 * @param weatherData
	 * @param ip_sender
	 */
	public async setWeatherInMariadb(
		weatherData: IWeatherDataRaw,
		ip_sender: string,
	) {
		const sqlRequest = `INSERT INTO mcs_weather_data 
    (input_date, pressure, temperature, humidity, ip_sender, weather_score) 
    VALUES (?, ?, ?, ?, ?, ?)`;
		const params = [
			weatherData.date,
			weatherData.pressure,
			weatherData.temperature,
			weatherData.humidity,
			ip_sender,
			weatherData.weather_score,
		];
		await this._mariaDBService.execute(sqlRequest, params, 'standard');
	}
}
