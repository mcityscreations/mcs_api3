import { ZodType } from 'zod';
import { InternalServerErrorException } from '@nestjs/common';
import { xmlToJsonConverter } from '../utils/XMLToJson.utils.js';

export function xmlValidator<T>(
	xmlData: string,
	schema: ZodType<T>,
	entity: string,
	source: string,
): T {
	const parsedResponse = xmlToJsonConverter(xmlData);
	const parseResult = schema.safeParse(parsedResponse);
	if (!parseResult.success) {
		throw new InternalServerErrorException({
			message: `Invalid ${entity} data format received from ${source}`,
			details: parseResult.error,
		});
	}
	return parseResult.data;
}
