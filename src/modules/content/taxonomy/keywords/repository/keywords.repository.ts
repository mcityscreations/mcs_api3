// src/modules/content/taxonomy/keywords/repository/keywords.repository.ts
import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../../system/database/postgresql/postgresql.service.js';
import type {
	IReadAdminKeywordDto,
	IReadPublicKeywordDto,
} from '../schemas/keywords.schemas.js';

@Injectable()
export class KeywordsRepository {
	constructor(private readonly dbService: PostgreSQLService) {}
	public async findOne(id: string): Promise<IReadAdminKeywordDto | null> {
		const query = `
        SELECT
            tk.id_public AS id,
            tk.title AS name,
            json_agg(json_build_object(
                'idLanguage', tl.id_language,
                'value', tki18n.title)
                ORDER BY tl.id_public) AS i18n,
            tk.created_at AS "createdAt",
            tk.updated_at AS "updatedAt"
        FROM taxonomy.keyword tk
        INNER JOIN taxonomy.keyword_i18n tki18n ON tk.id_keyword = tki18n.id_keyword
        INNER JOIN taxonomy.language tl ON tki18n.id_language = tl.id_language
        WHERE tk.id_public = $1
        GROUP BY 
            tk.id_public,
            tk.title,
            tk.created_at,
            tk.updated_at;
        `;
		const result = await this.dbService.execute<IReadAdminKeywordDto>(
			query,
			[id],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

	public async findOnei18n(
		keywordId: string,
		languageId: string,
	): Promise<IReadPublicKeywordDto | null> {
		const query = `
        SELECT
            tk.id_public AS id,
            COALESCE(tki18n.title, tk_fallback.title) AS name,
            COALESCE(tki18n.slug, tk_fallback.slug) AS slug,
            tk.created_at AS "createdAt",
            tk.updated_at AS "updatedAt"
        FROM taxonomy.keyword tk
        LEFT JOIN taxonomy.keyword_i18n tki18n ON tk.id_keyword = tki18n.id_keyword AND tki18n.id_language = $2
        LEFT JOIN taxonomy.keyword_i18n tk_fallback ON tk.id_keyword = tk_fallback.id_keyword AND tk_fallback.id_language = $3
        WHERE tk.id_public = $1;
        `;
		const result = await this.dbService.execute<IReadPublicKeywordDto>(
			query,
			[keywordId, languageId, 'en'],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

	public async findAll(): Promise<IReadAdminKeywordDto[] | null> {
		const query = `
        WITH keyword_translations AS (
            SELECT
                tki18n.id_keyword,
                json_agg(json_build_object(
                    'idLanguage', tki18n.id_language,
                    'value', tki18n.title,
                    'slug', tki18n.slug
            ) ORDER BY tki18n.id_language) AS i18n
            FROM taxonomy.keyword_i18n tki18n
            GROUP BY tki18n.id_keyword
        )
        
        SELECT
            tk.id_public AS id,
            tk.title AS name,
            COALESCE(tkt.i18n, '[]'::json) AS i18n,
            tk.created_at,
            tk.updated_at
        FROM taxonomy.keyword tk
        LEFT JOIN keyword_translations tkt ON tk.id_keyword = tkt.id_keyword;
        `;
		const result = await this.dbService.execute<IReadAdminKeywordDto>(
			query,
			[],
			'standard',
		);
		return result.length > 0 ? result : null;
	}

	public async findAlli18n(
		languageId: string,
	): Promise<IReadPublicKeywordDto[] | null> {
		const query = `
            SELECT
                tk.id_public AS id,
                COALESCE(tki18n.title, tk.title) AS name,
                COALESCE(tki18n.slug, 'N/A') AS slug,
                tk.created_at AS created_at,
                tk.updated_at AS updated_at
            FROM
                taxonomy.keyword tk
            LEFT JOIN
                taxonomy.keyword_i18n tki18n ON tk.id_keyword = tki18n.id_keyword
                AND tki18n.id_language = $1
        `;
		const result = await this.dbService.execute<IReadPublicKeywordDto>(
			query,
			[languageId],
			'standard',
		);
		return result.length > 0 ? result : null;
	}
}
