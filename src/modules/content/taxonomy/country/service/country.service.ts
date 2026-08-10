import { Injectable, BadRequestException } from '@nestjs/common';
import { CountryRepository } from '../repository/country.repository.js';

@Injectable()
export class CountryService {
	constructor(private readonly countryRepository: CountryRepository) {}

	public async mapExternalIDToInternalID(
		countryID: string,
		systemSource: string,
	): Promise<number | null> {
		if (!countryID || !systemSource) {
			throw new BadRequestException(
				'Country ID and system source must be provided',
			);
		}
		return this.countryRepository.mapExternalIDToInternalID(
			countryID,
			systemSource,
		);
	}

	public async convertPublicIDtoPrivateID(id: string): Promise<number | null> {
		if (!id || id === 'undefined')
			throw new BadRequestException('Country ID must be provided');
		return this.countryRepository.convertPublicIDtoPrivateID(id);
	}
}
