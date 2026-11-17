import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import { IArtist, IArtistI18n } from '../schemas/artist.schema.js';

@Injectable()
export class ArtistRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async findOne(id: string): Promise<IArtist | null> {
		const query = `
        SELECT
            ca.id_public AS "id",
            CONCAT(cpid.firstname, ' ', cpid.lastname) AS "name",
            ca.pseudo AS "pseudonym",
            '{"en": "", "fr": ""}'::json AS "bio",
            ca.created_at AS "createdAt",
            ca.updated_at AS "updatedAt"
        FROM 
            content.artist ca
        INNER JOIN
            content.people_individual_detail cpid
        ON ca.id_person = cpid.id_person
        WHERE
            ca.id_public = $1;
        `;
		const result = await this.dbService.execute<IArtist | null>(
			query,
			[id],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

	public async findOneByPersonId(
		personID: string,
	): Promise<IArtistI18n | null> {
		const query = `
        WITH person_data AS (
            SELECT
                cp.id_person
            FROM content.people cp
            WHERE cp.id_public = $1
        )
        SELECT
            ca.id_public AS "id",
            CONCAT(cpid.firstname, ' ', cpid.lastname) AS "name",
            ca.pseudo AS "pseudonym",
            'Bio' AS "bio",
            ca.created_at AS "createdAt",
            ca.updated_at AS "updatedAt"
        FROM 
            content.artist ca
        INNER JOIN
            content.people_individual_detail cpid
        ON ca.id_person = cpid.id_person
        WHERE
            ca.id_person = (SELECT id_person FROM person_data);`;
		const result = await this.dbService.execute<IArtistI18n | null>(
			query,
			[personID],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}
}
