import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../../system/database/postgresql/postgresql.service.js';
import type { IEntity, IEntityi18n } from '../schemas/entity.schema.js';

@Injectable()
export class EntitiesRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async findAll(): Promise<IEntity[] | null> {
		const query = `
            WITH entity_translations AS (
                SELECT 
                    tei18n.id_entity,
                    json_agg(json_build_object(
                        'idLanguage', tei18n.id_language,
                        'value', tei18n.title,
                        'slug', tei18n.slug
                    ) ORDER BY tei18n.id_language) AS i18n
                FROM taxonomy.entity_i18n tei18n
                GROUP BY tei18n.id_entity
            )
            SELECT
                te.id_public AS "id",
                te.title AS "name",
                COALESCE(et.i18n, '[]'::json) AS i18n,
                te.created_at AS "createdAt",
                te.updated_at AS "updatedAt"
            FROM
                taxonomy.entity te
            LEFT JOIN
                entity_translations et ON te.id_entity = et.id_entity
        `;
		const result = await this.dbService.execute<IEntity>(query, [], 'standard');
		return result.length > 0 ? result : null;
	}

	public async findAllI18n(lang: string): Promise<IEntityi18n[] | null> {
		const query = `
            SELECT
                te.id_public AS "id",
                COALESCE(tei18n.title, fallback_ent.title) AS name,
			    COALESCE(tei18n.slug, fallback_ent.slug) AS slug,
                te.created_at AS "createdAt",
                te.updated_at AS "updatedAt"
            FROM taxonomy.entity te
            LEFT JOIN taxonomy.entity_i18n tei18n 
                ON te.id_entity = tei18n.id_entity 
            AND tei18n.id_language = $1

            LEFT JOIN taxonomy.entity_i18n fallback_ent
                ON te.id_entity = fallback_ent.id_entity 
            AND fallback_ent.id_language = $2
        `;
		const result = await this.dbService.execute<IEntityi18n>(
			query,
			[lang, 'en'],
			'standard',
		);
		return result.length > 0 ? result : null;
	}
}
