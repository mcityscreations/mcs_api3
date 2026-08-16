// src/modules/content/people/people.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import { getIDType } from '../../../common/utils/getIDType.utils.js';
import { PoolClient } from 'pg';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import { PeopleRepository } from './repository/people.repository.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import {
	CreateIndividualSchema,
	type ICreateIndividual,
} from './schemas/individual.schema.js';
import type { IPerson } from './schemas/person.schema.js';
import { CountryService } from '../taxonomy/country/service/country.service.js';
import {
	CreateOrganizationSchema,
	ICreateOrganization,
} from './schemas/organization.schema.js';

@Injectable()
export class PeopleService {
	constructor(
		private readonly logger: WinstonLoggerService,
		private readonly peopleRepository: PeopleRepository,
		private readonly dbService: PostgreSQLService,
		private readonly countryService: CountryService,
	) {}

	async findOne(id: string | number): Promise<IPerson | null> {
		switch (getIDType(id)) {
			case 'private':
				return this.peopleRepository.findOneByID(id as number);
			case 'public':
				return this.peopleRepository.findOneByUUID(id as string);
			case 'invalid':
				throw new BadRequestException(
					`Unable to load the person's information. Wrong parameter value.`,
				);
			default:
				throw new BadRequestException(
					`Unable to load the person's information. Wrong parameter value.`,
				);
		}
	}

	async getMcitysID(
		externalID: string,
		systemSource: string, // mcitys, prestashop, qonto
	): Promise<number | null> {
		if (!externalID || !systemSource) {
			throw new InternalServerErrorException(
				'Both externalID and systemSource are required to retrieve the Mcitys ID.',
			);
		}
		const mcitysID = await this.peopleRepository.getMcitysID(
			externalID,
			systemSource,
		);
		return mcitysID;
	}

	async addIndividual(payload: ICreateIndividual): Promise<string | null> {
		if (!payload) {
			throw new InternalServerErrorException(
				'Both firstName and lastName are required to add an individual.',
			);
		}
		if (!CreateIndividualSchema.safeParse(payload).success) {
			throw new InternalServerErrorException(
				'Invalid payload. Please ensure that firstName and lastName are provided and meet the required criteria.',
			);
		}
		//Start transaction
		const transaction: PoolClient = await this.dbService.beginTransaction();
		try {
			const idPerson = await this.peopleRepository.addPerson(
				false,
				transaction,
			);
			if (!idPerson) {
				throw new InternalServerErrorException(
					'Failed to add individual. Please try again later.',
				);
			}
			await this.peopleRepository.addIndividual(
				idPerson,
				payload.details.firstName,
				payload.details.lastName,
				transaction,
			);
			await this.dbService.commit(transaction);
			return idPerson.toString();
		} catch (error) {
			if (transaction) {
				await this.dbService.rollback(transaction);
			}
			this.logger.error('Failed to add individual', getErrorMessage(error));
			throw new InternalServerErrorException(
				'Failed to add individual. Please try again later.',
			);
		}
	}

	async addOrganization(payload: ICreateOrganization): Promise<string | null> {
		if (!payload) {
			throw new InternalServerErrorException(
				'Payload is required to add an organization.',
			);
		}
		// Check for required fields in the payload
		if (!CreateOrganizationSchema.safeParse(payload).success) {
			throw new InternalServerErrorException(
				'Invalid payload. Please ensure that all required fields are provided and meet the required criteria.',
			);
		}
		//Start transaction
		const transaction: PoolClient = await this.dbService.beginTransaction();
		try {
			const idPerson = await this.peopleRepository.addPerson(true, transaction);

			// Convert public IDs to private IDs
			const registrationCountryID =
				getIDType(payload.details.registrationCountry) === 'private'
					? (payload.details.registrationCountry as number)
					: await this.countryService.convertPublicIDtoPrivateID(
							payload.details.registrationCountry as string,
						);
			const categoryID =
				getIDType(payload.details.category) === 'private'
					? (payload.details.category as number)
					: await this.peopleRepository.getCategoryPrivateID(
							payload.details.category as string,
						);
			if (!registrationCountryID || !categoryID || !idPerson)
				throw new InternalServerErrorException(
					`Failed to add organization. Please try again later.`,
				);

			await this.peopleRepository.addOrganization(
				idPerson,
				payload.details.legalName,
				registrationCountryID,
				payload.details.idRegistration || 'N/A',
				payload.details.idVAT || 'N/A',
				categoryID,
				transaction,
			);
			await this.dbService.commit(transaction);
			return idPerson.toString();
		} catch (error) {
			if (transaction) {
				await this.dbService.rollback(transaction);
			}
			this.logger.error('Failed to add organization', getErrorMessage(error));
			throw new InternalServerErrorException(
				'Failed to add organization. Please try again later.',
			);
		}
	}
}
