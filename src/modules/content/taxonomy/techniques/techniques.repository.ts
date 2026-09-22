import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import { IAdminReadTechnique } from './schemas/technique.schemas.js';

@Injectable()
export class TechniquesRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async findOne(id: string): Promise<IAdminReadTechnique[] | null> {
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
		return result.length > 0 ? result : null;
	}
}
