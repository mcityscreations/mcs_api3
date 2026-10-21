// src/modules/content/contact/repository/contact.repository.ts
import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import { IContact, IAddContact } from '../schemas/contact.schema.js';

@Injectable()
export class ContactRepository {
	constructor(private readonly postgreSQLService: PostgreSQLService) {}

	private readonly baseSelect = `
    SELECT
		c.id_contact AS "idContact",
		c.id_public AS "idContactPublic",
		c.id_person AS "idPerson",
		jsonb_build_object(
			'id', pc.id_contact_category,
			'name', pc.name
		) AS "contactCategory",
		c.is_primary AS "isPrimary",
		c.is_professional AS "isProfessional",
		c.title AS "title",
		c.value AS "value",
		c.is_verified AS "isVerified",
		c.created_at AS "createdAt",
		c.updated_at AS "updatedAt"
	FROM content.contact c
	JOIN content.contact_category pc ON c.id_contact_category = pc.id_contact_category;
    `;

	/**
	 * @param personId Private Postgres ID used as foreign key
	 * @returns contact list
	 */
	public async findContactsByPersonId(
		personId: string | number,
	): Promise<IContact[] | null> {
		const sql = `${this.baseSelect} WHERE c.id_person = $1`;
		const result = await this.postgreSQLService.execute<IContact>(
			sql,
			[personId],
			'standard',
		);
		return result ?? null;
	}

	/**
	 * @param publicId // Mcitys person public ID (uuid)
	 * @returns contact list
	 */
	public async findContactsByPublicId(
		publicId: string,
	): Promise<IContact[] | null> {
		const sql = `
            ${this.baseSelect}
            JOIN content.people ps ON c.id_person = ps.id_person
            WHERE ps.id_public = $1
        `;
		const result = await this.postgreSQLService.execute<IContact>(
			sql,
			[publicId],
			'standard',
		);
		return result ?? null;
	}

	public async findPersonByContact(contact: string): Promise<string | null> {
		const request = `
		SELECT 
			cp.id_public AS id
		FROM content.people cp
		INNER JOIN content.contact cc ON cp.id_person = cc.id_person
		WHERE cc.value = $1`;
		const result = await this.postgreSQLService.execute<{ id: string }>(
			request,
			[contact],
			'standard',
		);
		return result && result.length > 0 ? result[0].id : null;
	}

	public async addContact(payload: IAddContact): Promise<string | null> {
		const query = `
		WITH person AS (
			SELECT cp.id_person
			FROM content.people cp
			WHERE cp.id_public = $1
		)
		INSERT INTO content.contact (
			id_person,
			id_contact_category,
			is_primary,
			is_professional,
			title,
			value,
			is_verified
		) VALUES ((SELECT id_person FROM person), $2, $3, $4, $5, $6, $7)
		RETURNING id_person;
		`;
		const result = await this.postgreSQLService.execute<{ idPerson: string }>(
			query,
			[
				payload.idPerson,
				payload.contactCategory,
				payload.isPrimary,
				payload.isProfessional,
				payload.title,
				payload.value,
				payload.isVerified,
			],
			'standard',
		);
		return result && result.length > 0 ? result[0].idPerson : null;
	}
}
