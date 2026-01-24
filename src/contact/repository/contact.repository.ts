// src/contact/repository/contact.repository.ts
import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../database/postgresql/postgresql.service.js';
import { IContact } from '../types/contact.interface.js';

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

	public async findContactsByPersonId(
		personId: string | number,
	): Promise<IContact[]> {
		const sql = `${this.baseSelect} WHERE c.id_person = $1`;
		return await this.postgreSQLService.execute<IContact>(
			sql,
			[personId],
			'standard',
			true,
		);
	}

	public async findContactsByPublicId(publicId: string): Promise<IContact[]> {
		const sql = `
            ${this.baseSelect}
            JOIN content.people ps ON c.id_person = ps.id_person
            WHERE ps.id_public = $1
        `;
		return await this.postgreSQLService.execute<IContact>(
			sql,
			[publicId],
			'standard',
			true,
		);
	}
}
