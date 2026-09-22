// src/modules/content/taxonomy/keywords/repository/keywords.repository.ts
import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../../system/database/postgresql/postgresql.service.js';
import type { IReadAdminKeywordDto } from '../schemas/keywords.schemas.js';

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
}
