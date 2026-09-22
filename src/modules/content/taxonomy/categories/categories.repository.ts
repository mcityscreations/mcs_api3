import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import { IAdminReadCategory } from './schemas/category.schemas.js';

@Injectable()
export class CategoriesRepository {
	constructor(private readonly postgresqlService: PostgreSQLService) {}

	public async findInternalIdByUuid(uuid: string): Promise<number | null> {
		const query = `SELECT id_category FROM taxonomy.category WHERE id_public = $1`;
		const result: { id_category: number }[] =
			await this.postgresqlService.execute(query, [uuid]);
		if (result.length === 0) {
			return null;
		}
		return result[0].id_category;
	}

	public async findOne(categoryId: string): Promise<IAdminReadCategory | null> {
		const query = `
		WITH entity_translations AS (
			SELECT 
				tei18n.id_entity,
				json_agg(json_build_object(
					'idLanguage', tcl.id_language,
					'value', tei18n.title,
					'value', tei18n.slug
				) ORDER BY tcl.id_public) AS i18n
			FROM taxonomy.entity_i18n tei18n
			INNER JOIN taxonomy.language tcl ON tei18n.id_language = tcl.id_language
			GROUP BY tei18n.id_entity
		),
		category_translations AS (
			SELECT 
				tci18n.id_category,
				json_agg(json_build_object(
					'idLanguage', tcl.id_language,
					'value', tci18n.title,
					'slug', tci18n.slug
				) ORDER BY tcl.id_public) AS i18n
			FROM taxonomy.category_i18n tci18n
			INNER JOIN taxonomy.language tcl ON tci18n.id_language = tcl.id_language
			GROUP BY tci18n.id_category
		)

		SELECT
			tc.id_public AS id,
			tc.title AS name,
			json_build_object(
				'id', te.id_public,
				'name', te.title,
				'i18n', COALESCE(et.i18n, '[]'::json)
			) AS entity,
			COALESCE(ct.i18n, '[]'::json) AS i18n,
			tc.is_public AS "isPublic",
			tc.has_dimensions AS "hasDimensions",
			tc.created_at AS "createdAt",
			tc.updated_at AS "updatedAt"
		FROM taxonomy.category tc
		INNER JOIN taxonomy.entity te ON tc.id_entity = te.id_entity
		LEFT JOIN entity_translations et ON te.id_entity = et.id_entity
		LEFT JOIN category_translations ct ON tc.id_category = ct.id_category
		WHERE tc.id_public = $1`;

		const result: IAdminReadCategory[] = await this.postgresqlService.execute(
			query,
			[categoryId],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

	public async findOnei18n(
		categoryId: string,
		languageId: string,
	): Promise<IAdminReadCategory | null> {
		const query = `
		SELECT
			tc.id_public AS id,

			--  Entity translation with fallback
			json_build_object(
				'id', te.id_public,
				'name', COALESCE(tei18n.title, fallback_ent.title),
				'slug', COALESCE(tei18n.slug, fallback_ent.slug)
			) AS entity,

			-- Category translation with fallback
			COALESCE(tci18n.title, fallback_cat.title) AS name,
			COALESCE(tci18n.slug, fallback_cat.slug) AS slug,
			
			tc.is_public AS "isPublic",
			tc.has_dimensions AS "hasDimensions",
			tc.created_at AS "createdAt",
			tc.updated_at AS "updatedAt"
		FROM taxonomy.category tc 

		-- Main entity
		INNER JOIN taxonomy.entity te 
			ON tc.id_entity = te.id_entity

		-- Category translation: Target ($1 = ex: 'es') + Fallback ($2 = ex: 'en')
		LEFT JOIN taxonomy.category_i18n tci18n 
			ON tc.id_category = tci18n.id_category 
		AND tci18n.id_language = $1

		LEFT JOIN taxonomy.category_i18n fallback_cat 
			ON tc.id_category = fallback_cat.id_category 
		AND fallback_cat.id_language = $2

		-- Entity translation: Target ($1) + Fallback ($2)
		LEFT JOIN taxonomy.entity_i18n tei18n 
			ON te.id_entity = tei18n.id_entity 
		AND tei18n.id_language = $1

		LEFT JOIN taxonomy.entity_i18n fallback_ent 
			ON te.id_entity = fallback_ent.id_entity 
		AND fallback_ent.id_language = $2

		WHERE tc.id_public = $3;`;
		const result: IAdminReadCategory[] = await this.postgresqlService.execute(
			query,
			[languageId, 'en', categoryId],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}
}
