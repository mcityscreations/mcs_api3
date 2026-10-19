// src/modules/content/people/people.service.ts
import { Injectable } from '@nestjs/common';
import {
	InternalError,
	BadRequestError,
} from '../../../system/errors/index.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import { getIDType } from '../../../common/utils/getIDType.utils.js';
import { IIds } from '../../../common/schemas/ids.schema.js';
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
import { PersonMapperSchema } from './schemas/personmapper.schema.js';
import type { IPersonMapper } from './schemas/personmapper.schema.js';

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
				throw new BadRequestError(
					`[People Service] Unable to load the person's information. Wrong parameter value.`,
				);
			default:
				throw new BadRequestError(
					`[People Service] Unable to load the person's information. Wrong parameter value.`,
				);
		}
	}

	async getMcitysID(
		externalID: string,
		systemSource: string, // mcitys, prestashop, qonto
	): Promise<string | null> {
		if (!externalID || !systemSource) {
			throw new InternalError(
				'[People Service] Both externalID and systemSource are required to retrieve the Mcitys ID.',
			);
		}
		const mcitysID = await this.peopleRepository.getMcitysID(
			externalID,
			systemSource,
		);
		return mcitysID;
	}

	async addIndividual(payload: ICreateIndividual): Promise<IIds | null> {
		if (!payload) {
			throw new InternalError(
				'[People Service] Both firstName and lastName are required to add an individual.',
			);
		}
		if (!CreateIndividualSchema.safeParse(payload).success) {
			throw new InternalError(
				'[People Service] Invalid payload. Please ensure that firstName and lastName are provided and meet the required criteria.',
			);
		}
		//Start transaction
		const transaction: PoolClient = await this.dbService.beginTransaction();
		try {
			const personIDs = await this.peopleRepository.addPerson(
				false,
				transaction,
			);
			if (!personIDs?.idPrivate) {
				throw new InternalError(
					`[People Service] Failed to add individual ${payload.details.firstName} ${payload.details.lastName}. Please try again later.`,
				);
			}
			await this.peopleRepository.addIndividual(
				personIDs.idPrivate,
				payload.details.firstName,
				payload.details.lastName,
				transaction,
			);
			await this.dbService.commit(transaction);
			return personIDs;
		} catch (error) {
			if (transaction) {
				await this.dbService.rollback(transaction);
			}
			this.logger.error('Failed to add individual', getErrorMessage(error));
			throw new InternalError(
				`[People Service] Failed to add individual ${payload.details.firstName} ${payload.details.lastName}. Please try again later.`,
			);
		}
	}

	async addOrganization(payload: ICreateOrganization): Promise<string | null> {
		if (!payload) {
			throw new InternalError(
				'[People Service] Payload is required to add an organization.',
			);
		}
		console.log(payload);
		// Check for required fields in the payload
		if (!CreateOrganizationSchema.safeParse(payload).success) {
			console.error(CreateOrganizationSchema.safeParse(payload).error);
			throw new InternalError(
				'[People Service] Invalid payload. Please ensure that all required fields are provided and meet the required criteria.',
			);
		}
		//Start transaction
		const transaction: PoolClient = await this.dbService.beginTransaction();
		try {
			// Check if the company is already registered in the system by its SIRET number
			const existingOrganization =
				await this.peopleRepository.getOrganizationBySiret(
					payload.details.idRegistration as string,
				);
			if (existingOrganization) return existingOrganization.id;
			const personIDs = await this.peopleRepository.addPerson(
				true,
				transaction,
			);

			if (!personIDs?.idPrivate)
				throw new InternalError(
					`[People Service] Failed to add organization ${payload.details.legalName}. Please try again later.`,
				);

			await this.peopleRepository.addOrganization(
				personIDs.idPrivate,
				payload.details.legalName,
				payload.details.registrationCountry,
				payload.details.idRegistration || 'N/A',
				payload.details.idVAT || 'N/A',
				payload.details.category,
				transaction,
			);
			await this.dbService.commit(transaction);
			return personIDs.idPublic;
		} catch (error) {
			if (transaction) {
				await this.dbService.rollback(transaction);
			}
			console.error(error);
			throw new InternalError(
				`[People Service] Failed to add organization ${payload.details.legalName}. Please try again later.` +
					getErrorMessage(error),
			);
		}
	}

	public async getOrganizationBySiret(siret: string): Promise<IPerson | null> {
		if (!siret) {
			throw new BadRequestError(
				'[People Service] Siret is required to get organization by siret.',
			);
		}
		return this.peopleRepository.getOrganizationBySiret(siret);
	}

	public async addPersonToMapper(
		payload: IPersonMapper,
	): Promise<number | null> {
		if (!PersonMapperSchema.safeParse(payload))
			throw new BadRequestError(
				`[People Service] Wrong payload type for addPersonMapper.`,
			);
		// Cast idPerson to string type for PG
		payload.idPerson =
			typeof payload.idPerson === 'string'
				? payload.idPerson
				: String(payload.idPerson);
		// Save Person
		const addPerson = await this.peopleRepository.addPersonMapper(payload);
		// Handle error
		if (!addPerson) {
			throw new InternalError(
				`[People Service] Failed to add person to mapper for idPerson: ${payload.idPerson}, systemSource: ${payload.systemSource}`,
			);
		}
		return addPerson;
	}
}
