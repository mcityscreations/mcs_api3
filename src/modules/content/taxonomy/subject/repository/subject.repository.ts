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
                        'idLanguage', tl.id_public,
                        'value', tsi18n.title,
                        'slug', tsi18n.slug)
                        ORDER BY tl.id_public) AS i18n,
                    ts.created_at AS "createdAt",
                    ts.updated_at AS "updatedAt"
                FROM taxonomy.subject ts
                INNER JOIN taxonomy.subject_i18n tsi18n ON ts.id_subject = tsi18n.id_subject
                INNER JOIN taxonomy.language tl ON tsi18n.id_language = tl.id_language
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
			true,
		);
		return result.length > 0 ? result[0] : null;
	}
}
