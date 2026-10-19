// src/modules/content/people/repository/people.repository.ts
import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import type { IPerson } from '../schemas/person.schema.js';
import { IPersonMapper } from '../schemas/personmapper.schema.js';
import { IIds } from '../../../../common/schemas/ids.schema.js';

@Injectable()
export class PeopleRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async findOneByUUID(id: string): Promise<IPerson | null> {
		const sqlRequest = `SELECT * FROM content.v_people WHERE id_public = $1;`;
		const data: IPerson[] = await this.dbService.execute(
			sqlRequest,
			[id],
			'standard',
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
	): Promise<string | null> {
		const sqlRequest = `
		SELECT 
			cp.id_public as "id" 
		FROM 
			content.people cp
		INNER JOIN content.people_mapper cpm ON cpm.id_person = cp.id_person
		WHERE 
			cpm.id_person_source = $1 AND cpm.system_source = $2;
		`;
		const data: { id: string }[] = await this.dbService.execute(
			sqlRequest,
			[externalID, systemSource],
			'standard',
		);
		const result = data && data.length > 0 ? data[0].id : null;
		return result;
	}

	public async getOrganizationBySiret(siret: string): Promise<IPerson | null> {
		const query = `
		WITH country_data AS (
			SELECT json_build_object(
				'id_country', tc.id_country,
				'id', tc.id_public,
				'name', tc.name
			) as registration_country
			FROM taxonomy.country tc
			INNER JOIN content.people_organization_detail cpo
			ON tc.id_country = cpo.registration_country
			WHERE cpo.id_registration = $1
		),
		category_data AS (
			SELECT json_build_object(
				'id', cpc.id_public,
				'name', cpc.name
			) AS category
			FROM content.people_organization_category cpc
			INNER JOIN content.people_organization_detail cpo
			ON cpc.id_organization_category = cpo.id_organization_category
			WHERE cpo.id_registration = $1
		),
		details_data AS (
			SELECT json_build_object(
				'category', (SELECT category FROM category_data),
				'legalName', cpo.legal_name,
				'registrationCountry', (SELECT registration_country FROM country_data),
				'idRegistration', cpo.id_registration,
				'idVAT', cpo.id_vat
				
			) AS details_obj
			FROM content.people_organization_detail cpo
			WHERE cpo.id_registration = $1
		)
		SELECT 
			cp.id_public AS "id",
			'organization' AS "type",
			(SELECT details_obj FROM details_data) AS "details"
		FROM content.people cp
		INNER JOIN content.people_organization_detail cpo 
		ON cp.id_person = cpo.id_person
		WHERE cpo.id_registration = $1;
		`;
		const data: IPerson[] = await this.dbService.execute(
			query,
			[siret],
			'standard',
		);
		const result = data && data.length > 0 ? data[0] : null;
		return result;
	}

	public async addPerson(
		isOrganization: boolean,
		transactionClient: PoolClient,
	): Promise<IIds | null> {
		const sqlRequest = `INSERT INTO content.people (is_organization, reference) VALUES ($1, $2) RETURNING id_person AS "idPrivate", id_public AS "idPublic";`;
		const data: { idPrivate: number; idPublic: string }[] =
			await this.dbService.execute(
				sqlRequest,
				[isOrganization, 'N/A'],
				'standard',
				transactionClient,
			);
		const result = data && data.length > 0 ? data[0] : null;
		return result;
	}

	public async addIndividual(
		idPerson: number,
		firstName: string,
		lastName: string,
		transactionClient: PoolClient,
	): Promise<void> {
		const sqlRequest = `INSERT INTO content.people_individual_detail (id_person, firstname, lastname) VALUES ($1, $2, $3);`;
		await this.dbService.execute(
			sqlRequest,
			[idPerson, firstName, lastName],
			'standard',
			transactionClient,
		);
	}

	public async addOrganization(
		idPerson: number,
		legalName: string,
		registrationCountry: string,
		idRegistration: string,
		idVAT: string,
		idOrganizationCategory: string,
		transactionClient: PoolClient,
	): Promise<number | null> {
		const sqlRequest = `
		WITH country_data AS (
			SELECT id_country AS registration_country_id
			FROM taxonomy.country tc
			WHERE tc.id_public = $3
		),
		organization_category_data AS (
			SELECT id_organization_category AS organization_category_id
			FROM content.people_organization_category cpoc
			WHERE cpoc.id_public = $6
		)
		INSERT INTO content.people_organization_detail 
		(id_person, legal_name, registration_country, id_registration, id_vat, id_organization_category) 
		VALUES ($1, $2, (SELECT registration_country_id FROM country_data), $4, $5, (SELECT organization_category_id FROM organization_category_data)) RETURNING id_person;`;
		const result: { id_person: number }[] = await this.dbService.execute(
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
			transactionClient,
		);
		const finalResult =
			result && result.length > 0 ? result[0].id_person : null;
		return finalResult;
	}

	public async getCategoryPrivateID(uuid: string): Promise<number | null> {
		const sqlRequest = `SELECT cp.id_organization_category 
		FROM 
			content.people_organization_category cp
		WHERE 
			cp.id_public = $1`;
		const result = await this.dbService.execute<{
			id_organization_category: number;
		}>(sqlRequest, [uuid], 'standard');
		return result.length > 0 ? result[0].id_organization_category : null;
	}

	public async addPersonMapper(payload: IPersonMapper): Promise<number | null> {
		const sqlRequest = `INSERT INTO content.people_mapper 
		(id_person, system_source, id_person_source, is_professional, is_abroad, source_data, is_verified)
		VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id_person;`;
		const data: { id_person: number }[] = await this.dbService.execute(
			sqlRequest,
			[
				payload.idPerson,
				payload.systemSource,
				payload.idPersonSource,
				payload.isProfessional,
				payload.isAbroad,
				JSON.stringify(payload.sourceData),
			],
			'standard',
		);
		const result = data && data.length > 0 ? data[0].id_person : null;
		return result;
	}
}
