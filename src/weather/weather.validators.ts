import { z } from 'zod';

// 1. Defining WeatherItemSchema
const WeatherItemSchema = z.object({
	id: z.number(),
	main: z.string(),
	description: z.string(),
	icon: z.string(),
});

// 2. Defining Weather Schema
const CurrentWeatherSchema = z.object({
	dt: z.number(), // timestamp
	temp: z.number(),
	pressure: z.number(),
	humidity: z.number(),
	weather: z
		.array(WeatherItemSchema)
		.min(1, "Le tableau 'weather' ne doit pas être vide"),
	// Note: z.object().partial() allows making properties optional
});

// 3. DDefining the complete response schema (if using the One Call API)
export const OpenWeatherMapRawResponseSchema = z.object({
	lat: z.number(),
	lon: z.number(),
	timezone: z.string(),
	current: CurrentWeatherSchema,
});

/** OpenWeather Options */

// Exclude options
const OpenWeatherExcludeBlockSchema = z.enum([
	'current',
	'minutely',
	'hourly',
	'daily',
	'alerts',
]);
export const OpenWeatherExcludeArraySchema = z
	.array(OpenWeatherExcludeBlockSchema)
	// Allows the field to be undefined or null
	.nullable()
	.optional();

// All options
const OpenWeatherUnitSchema = z.enum(['standard', 'metric', 'imperial']);
export const OpenWeatherOptionsSchema = z
	.object({
		exclude: OpenWeatherExcludeArraySchema,
		units: OpenWeatherUnitSchema,
		lang: z.string(),
	})
	.nullable()
	.optional();
// OpenWeather Options inference type
export type IOpenWeatherExcludeBlock = z.infer<
	typeof OpenWeatherExcludeBlockSchema
>;
export type IOpenWeatherExcludeArraySchema = z.infer<
	typeof OpenWeatherExcludeArraySchema
>;
export type OpenWeatherUnit = z.infer<typeof OpenWeatherUnitSchema>;
export type IOpenWeatherOptions = z.infer<typeof OpenWeatherOptionsSchema>;

// WeatherScorePayload Schema
export const WeatherScorePayloadSchema = z.object({
	// Uses z.coerce.number():
	// Attempts to convert the value to a number if it's a string (e.g., "1012.5" -> 1012.5)
	// Does nothing if it's already a number.
	// Fails if the conversion is not possible (e.g., "abc" -> NaN).
	pressure: z.coerce
		.number()
		.positive('La pression doit être une valeur positive.'),

	// Ensures the conversion result is between 0 and 100
	humidity: z.coerce
		.number()
		.min(0, "L'humidité doit être au minimum 0.")
		.max(100, "L'humidité doit être au maximum 100."),
});
// Exporting interface
export type IWeatherScorePayload = z.infer<typeof WeatherScorePayloadSchema>;
