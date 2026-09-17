import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import { ILanguage } from './schemas/languages.schemas.js';

@Injectable()
export class LanguagesRepository {
	constructor(private readonly dbService: PostgreSQLService) {}
	public async findOne(id: string): Promise<ILanguage | null> {
		const query = `
        SELECT
            tl.id_public AS id,
            tl.name AS name,
            json_agg(json_build_object(
                'idLanguage', tl.id_public,
                'title', tli18n.name
            ) ORDER BY tl.id_public) AS i18n,
            tl.slug AS slug,
            tl.created_at AS "createdAt"
        FROM taxonomy.language tl
        INNER JOIN taxonomy.language_i18n tli18n ON tl.id_language = tli18n.id_language
        WHERE tl.id_public = $1
        GROUP BY 
            tl.id_public,
            tl.name,
            tl.slug,
            tl.created_at;`;
		const result: ILanguage[] = await this.dbService.execute(
			query,
			[id],
			'standard',
			true,
		);

		return result.length > 0 ? result[0] : null;
	}
}
