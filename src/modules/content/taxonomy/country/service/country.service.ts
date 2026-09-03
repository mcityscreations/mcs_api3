import { Injectable, BadRequestException } from '@nestjs/common';
import { CountryRepository } from '../repository/country.repository.js';
import {
	NotFoundError,
	ValidationError,
} from '../../../../../system/errors/index.js';
import { CountryMapSchema } from '../schemas/country-map.schema.js';
import type { ICountry } from '../schemas/country.schema.js';

@Injectable()
export class CountryService {
	constructor(private readonly countryRepository: CountryRepository) {}

	public async mapExternalIDToInternalID(
		countryID: string | number,
		systemSource: string,
	): Promise<number | null> {
		if (!countryID || !systemSource) {
			throw new BadRequestException(
				'Country ID and system source must be provided',
			);
		}
		const parsedID =
			typeof countryID === 'string' ? countryID : String(countryID);
		return this.countryRepository.mapExternalIDToInternalID(
			parsedID,
			systemSource,
		);
	}

	public async convertPublicIDtoPrivateID(id: string): Promise<number | null> {
		if (!id || id === 'undefined')
			throw new BadRequestException('Country ID must be provided');
		return this.countryRepository.convertPublicIDtoPrivateID(id);
	}

	public async getCountryFromExternalID(payload: {
		idCountry: string | number;
		systemSource: string;
	}): Promise<ICountry | null> {
		const parsedData = CountryMapSchema.safeParse(payload);
		if (!parsedData.success)
			throw new ValidationError(
				`Wrong data type for country map :` + JSON.stringify(parsedData.error),
			);
		const countryData = await this.countryRepository.getCountryFromExternalID(
			parsedData.data.idCountry,
			parsedData.data.systemSource,
		);
		if (!countryData)
			throw new NotFoundError(
				`The country with the code ${payload.idCountry} from ${payload.systemSource} couldn't be mapped to an Mcitys entity.`,
			);
		return countryData;
	}
}
