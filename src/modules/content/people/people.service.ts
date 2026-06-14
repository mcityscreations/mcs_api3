// src/modules/content/people/people.service.ts
import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import { PoolClient } from 'pg';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import { PeopleRepository } from './repository/people.repository.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { IPersonBase } from './types/person.interface.js';
import { IndividualSchema } from './schemas/individual.schema.js';
import type { IIndividual } from './schemas/individual.schema.js';

@Injectable()
export class PeopleService {
	constructor(
		private readonly logger: WinstonLoggerService,
		private readonly peopleRepository: PeopleRepository,
		private readonly dbService: PostgreSQLService,
	) {}

	async findOne(id: string): Promise<IPersonBase | null> {
		const result = await this.peopleRepository.findOne(id);
		return result;
	}

	async getMcitysID(
		externalID: string,
		systemSource: string,
	): Promise<string | null> {
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

	async addIndividual(payload: IIndividual): Promise<string | null> {
		if (!payload) {
			throw new InternalServerErrorException(
				'Both firstName and lastName are required to add an individual.',
			);
		}
		if (!IndividualSchema.safeParse(payload).success) {
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
				payload.firstName,
				payload.lastName,
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
}
