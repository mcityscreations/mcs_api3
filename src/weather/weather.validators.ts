import { z } from 'zod';

// 1. Définir le schéma d'un élément 'weather'
const WeatherItemSchema = z.object({
	id: z.number(),
	main: z.string(),
	description: z.string(),
	icon: z.string(),
});

// 2. Définir le schéma du bloc 'current'
const CurrentWeatherSchema = z.object({
	dt: z.number(), // timestamp
	temp: z.number(),
	pressure: z.number(),
	humidity: z.number(),
	weather: z
		.array(WeatherItemSchema)
		.min(1, "Le tableau 'weather' ne doit pas être vide"),
	// Note: z.object().partial() permet de rendre les propriétés optionnelles
});

// 3. Définir le schéma de la réponse complète (si vous utilisez l'API One Call)
export const OpenWeatherMapRawResponseSchema = z.object({
	lat: z.number(),
	lon: z.number(),
	timezone: z.string(),
	current: CurrentWeatherSchema, // Le bloc qui nous intéresse
	// On peut ignorer les autres blocs (minutely, hourly) si on les 'exclude'
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
	// Permet au champ d'être undefined ou null
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
	// Utilise z.coerce.number() :
	// Tente de convertir la valeur en nombre si c'est une chaîne (ex: "1012.5" -> 1012.5)
	// Ne change rien si c'est déjà un nombre.
	// Échoue si la conversion n'est pas possible (ex: "abc" -> NaN).
	pressure: z.coerce
		.number()
		.positive('La pression doit être une valeur positive.'),

	// S'assure que le résultat de la conversion est entre 0 et 100
	humidity: z.coerce
		.number()
		.min(0, "L'humidité doit être au minimum 0.")
		.max(100, "L'humidité doit être au maximum 100."),
});
// Exporting interface
export type IWeatherScorePayload = z.infer<typeof WeatherScorePayloadSchema>;
