// src/modules/content/people/repository/people.repository.ts
import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import type { IPerson } from '../schemas/person.schema.js';

@Injectable()
export class PeopleRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async findOneByUUID(id: string): Promise<IPerson | null> {
		const sqlRequest = `SELECT * FROM content.v_people WHERE id_public = $1;`;
		const data: IPerson[] = await this.dbService.execute(
			sqlRequest,
			[id],
			'standard',
			true,
		);
		const result = data && data.length > 0 ? data[0] : null;
		return result;
	}

	public async findOneByID(id: number): Promise<IPerson | null> {
		const sqlRequest = `SELECT * FROM content.v_people WHERE id_person = $1;`;
		const data: IPerson[] = await this.dbService.execute(
			sqlRequest,
			[id],
			'standard',
			true,
		);
		const result = data && data.length > 0 ? data[0] : null;
		return result;
	}

	/**
	 * @param externalID Person ID in the third party system
	 * @param systemSource name of the third party system
	 * @returns the private ID in the Mcitys Database
	 */
	public async getMcitysID(
		externalID: string,
		systemSource: string,
	): Promise<number | null> {
		const sqlRequest = `SELECT id_person FROM content.people_mapper WHERE id_person_source = $1 AND system_source = $2;`;
		const data: { id_person: number }[] = await this.dbService.execute(
			sqlRequest,
			[externalID, systemSource],
			'standard',
			true,
		);
		const result = data && data.length > 0 ? data[0].id_person : null;
		return result;
	}

	public async addPerson(
		isOrganization: boolean,
		transactionClient: PoolClient,
	): Promise<number | null> {
		const sqlRequest = `INSERT INTO content.people (is_organization) VALUES ($1) RETURNING id_person;`;
		const data: { id_person: string }[] = await this.dbService.execute(
			sqlRequest,
			[isOrganization],
			'standard',
			false,
			transactionClient,
		);
		const result = data && data.length > 0 ? Number(data[0].id_person) : null;
		return result;
	}

	public async addIndividual(
		idPerson: number,
		firstName: string,
		lastName: string,
		transactionClient: PoolClient,
	): Promise<void> {
		const sqlRequest = `INSERT INTO content.people_individual (id_person, firstname, lastname) VALUES ($1, $2, $3);`;
		await this.dbService.execute(
			sqlRequest,
			[idPerson, firstName, lastName],
			'standard',
			false,
			transactionClient,
		);
	}

	public async addOrganization(
		idPerson: number,
		legalName: string,
		registrationCountry: number,
		idRegistration: string,
		idVAT: string,
		idOrganizationCategory: number,
		transactionClient: PoolClient,
	): Promise<void> {
		const sqlRequest = `INSERT INTO content.people_organization 
		(id_person, legal_name, registration_country, id_registration, id_vat, id_organization_category) 
		VALUES ($1, $2, SELECT(content.country.id_country WHERE content.country.id_public = $3), $4, $5, $6);`;
		await this.dbService.execute(
			sqlRequest,
			[
				idPerson,
				legalName,
				registrationCountry,
				idRegistration,
				idVAT,
				idOrganizationCategory,
			],
			'standard',
			false,
			transactionClient,
		);
	}

	public async getCategoryPrivateID(uuid: string): Promise<number | null> {
		const sqlRequest = `SELECT cp.id_organization_category 
		FROM 
			content.people_organization_category cp
		WHERE 
			cp.id_public = $1`;
		const result = await this.dbService.execute<{
			id_organization_category: number;
		}>(sqlRequest, [uuid], 'standard', false);
		return result.length > 0 ? result[0].id_organization_category : null;
	}
}
