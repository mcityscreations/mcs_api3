import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import {
	IAdminReadTechnique,
	IPublicReadTechnique,
} from './schemas/technique.schemas.js';

@Injectable()
export class TechniquesRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async findOne(id: string): Promise<IAdminReadTechnique | null> {
		const query = `SELECT
		tt.id_public AS id,
		tt.name AS name,
		json_agg(json_build_object(
			'idLanguage', tcl.id_language,
			'title', tti18n.title,
			'slug', tti18n.slug
		) ORDER BY tcl.id_public) AS i18n,
		tt.is_public AS "isPublic",
		tt.created_at AS "createdAt",
		tt.updated_at AS "updatedAt"
		FROM taxonomy.technique_i18n tti18n 
		INNER JOIN taxonomy.language tcl ON tti18n.id_language = tcl.id_language
		INNER JOIN taxonomy.technique tt ON tt.id_technique = tti18n.id_technique
		WHERE tt.id_public = $1
		GROUP BY 
			tt.id_public,
			tt.name,
			tt.is_public,
			tt.created_at,
			tt.updated_at;`;

		const result: IAdminReadTechnique[] = await this.dbService.execute(
			query,
			[id],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

	public async findOnei18n(
		id: string,
		lang: string,
	): Promise<IPublicReadTechnique | null> {
		const query = `
		SELECT
			tt.id_public AS id,
			COALESCE(tti18n.title, fallback_tech.title) AS name,
			COALESCE(tti18n.slug, fallback_tech.slug) AS slug,
			tt.is_public AS "isPublic",
			tt.created_at AS "createdAt",
			tt.updated_at AS "updatedAt"
		FROM taxonomy.technique tt
		LEFT JOIN taxonomy.technique_i18n tti18n
			ON tt.id_technique = tti18n.id_technique
			AND tti18n.id_language = $2
		LEFT JOIN taxonomy.technique_i18n fallback_tech
			ON tt.id_technique = fallback_tech.id_technique 
			AND fallback_tech.id_language = $3
		WHERE tt.id_public = $1;`;

		const result: IPublicReadTechnique[] = await this.dbService.execute(
			query,
			[id, lang, 'en'],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

	public async findAll(): Promise<IAdminReadTechnique[] | null> {
		const query = `
		WITH technique_translations AS (
			SELECT 
				tti18n.id_technique,
				json_agg(json_build_object(
					'idLanguage', tti18n.id_language,
					'value', tti18n.title,
					'slug', tti18n.slug
				) ORDER BY tti18n.id_language) AS i18n
			FROM taxonomy.technique_i18n tti18n
			GROUP BY tti18n.id_technique
		)

		SELECT
			tt.id_public AS id,
			tt.name AS name,
			COALESCE(technique_translations.i18n, '[]'::json) AS i18n,
			tt.is_public AS "isPublic",
			tt.created_at AS "createdAt",
			tt.updated_at AS "updatedAt"
		FROM taxonomy.technique tt
		LEFT JOIN technique_translations
			ON tt.id_technique = technique_translations.id_technique;`;

		const result = await this.dbService.execute<IAdminReadTechnique>(
			query,
			[],
			'standard',
		);
		return result.length > 0 ? result : null;
	}

	public async findAlli18n(
		lang: string,
	): Promise<IPublicReadTechnique[] | null> {
		const query = `
		SELECT
			tt.id_public AS id,
			COALESCE(tti18n.title, fallback_tech.title) AS name,
			COALESCE(tti18n.slug, fallback_tech.slug) AS slug,
			tt.is_public AS "isPublic",
			tt.created_at AS "createdAt",
			tt.updated_at AS "updatedAt"
		FROM taxonomy.technique tt
		LEFT JOIN taxonomy.technique_i18n tti18n
			ON tt.id_technique = tti18n.id_technique
			AND tti18n.id_language = $1
		LEFT JOIN taxonomy.technique_i18n fallback_tech
			ON tt.id_technique = fallback_tech.id_technique 
			AND fallback_tech.id_language = $2;`;

		const result = await this.dbService.execute<IPublicReadTechnique>(
			query,
			[lang, 'en'],
			'standard',
		);
		return result.length > 0 ? result : null;
	}
}
