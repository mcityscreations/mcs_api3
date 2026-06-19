import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { CountryRepository } from '../repository/country.repository.js';

@Injectable()
export class CountryService {
	constructor(private readonly countryRepository: CountryRepository) {}

	public async mapCountryIDToInternalID(
		countryID: string,
		systemSource: string,
	): Promise<number | null> {
		if (!countryID || !systemSource) {
			throw new BadRequestException(
				'Country ID and system source must be provided',
			);
		}
		return this.countryRepository.findInternalIdByUuid(countryID, systemSource);
	}
}
