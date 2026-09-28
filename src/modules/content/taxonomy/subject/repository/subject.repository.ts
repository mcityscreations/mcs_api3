import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../../system/database/postgresql/postgresql.service.js';
import type { IReadAdminSubject } from '../schemas/subject.schemas.js';
@Injectable()
export class SubjectRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async findOne(id: string): Promise<IReadAdminSubject | null> {
		const query = `
            SELECT
                ts.id_public AS id,
                ts.title AS name,
                json_agg(json_build_object(
                    'idLanguage', tsi18n.id_language,
                    'value', tsi18n.title,
                    'slug', tsi18n.slug)
                    ORDER BY tl.id_public) AS i18n,
                ts.created_at AS "createdAt",
                ts.updated_at AS "updatedAt"
            FROM taxonomy.subject ts
            INNER JOIN taxonomy.subject_i18n tsi18n ON ts.id_subject = tsi18n.id_subject
            WHERE ts.id_public = $1
            GROUP BY 
                ts.id_public,
                ts.title,
                ts.created_at,
                ts.updated_at;
                `;
		const result = await this.dbService.execute<IReadAdminSubject>(
			query,
			[id],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

    public async findOnei18n(id: string, lang: string): Promise<IReadPublicSubject | null> {
        const query = `
            SELECT
                ts.id_public AS id,
                COALESCE(tsi18n.title, fallback_sub.title) AS name,
                COALESCE(tsi18n.slug, fallback_sub.slug) AS slug,
                ts.is_public AS "isPublic",
                ts.created_at AS "createdAt",
                ts.updated_at AS "updatedAt"
            FROM taxonomy.subject ts,
            LEFT JOIN taxonomy.subject_i18n tsi18n
                ON ts.id_subject = tsi18n.id_subject
                AND tsi18n.id_language = $2
            LEFT JOIN taxonomy.subject_i18n fallback_sub
                ON ts.id_subject = fallback_sub.id_subject
                AND fallback_sub.id_language = $3
            WHERE ts.id_public = $1;
        `;
        const result = await this.dbService.execute<IReadPublicSubject>(
            query,
            [id, lang, 'en'],
            'standard',
        )
        return result && result.length > 0 ? result[0] : null;
    }

    public async findAll(): Promise<IReadAdminSubject[] | null>{
        const query = `
            WITH subject_translations AS
                (
                    SELECT 
                        tsi18n.id_subject,
                    json_agg(
                        json_build_object(
                            'idLanguage', tsi18n.id_language,
                            'value', tsi18n.title,
                            'slug', tsi18n.slug
                        ) ORDER BY tsi18n.id_language
                    ) AS i18n
                    FROM taxonomy.subject_i18n tsi18n
                    GROUP BY tsi18n.id_subject
                )
            SELECT
                ts.id_public AS id,
                ts.title AS name,
                COALESCE(st.i18n, '[]'::json) AS i18n,
                ts.is_public AS "isPublic",
                ts.created_at AS "createdAt",
                ts.updated_at AS "updatedAt"
            FROM 
                taxonomy.subject ts
            LEFT JOIN subject_translations st
                ON ts.id_subject = st.id_subject
        `;
        const result = await this.dbService.execute<IReadAdminSubject>(
            query,
            [],
            'standard',
        )
        return result && result.length > 0 ? result : null;
    }

    findAlli18n(lang: string): Promise<IReadPublicSubject | null>{
        const query = `
        SELECT
            ts.id_public AS id,
            COALESCE(tsi18n.title, fallback_subject.title) AS name,
            COALESCE(tsi18n.slug, fallback_subject.slug) AS slug,
            ts.is_public AS "isPublic",
            ts.created_at AS "createdAt",
            ts.updated_at AS "updatedAt"
        FROM taxonomy.subject ts
        LEFT JOIN taxonomy.subject_i18n tsi18n
            ON ts.id_subject = tsi18n.id_subject
            AND tsi18n.id_language = $1
        LEFT JOIN taxonomy.subject_i18n fallback_subject
            ON ts.id_subject = fallback_subject.id_subject
            AND fallback_subject.id_language = $2
        `;
        const result = await this.dbService.execute<IReadPublicSubject>(
            query,
            [lang, 'en'],
            'standard',
        )
        return result && result.legnth > 0 ? result : null;
    }
}
