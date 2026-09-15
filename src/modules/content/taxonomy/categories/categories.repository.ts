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
		const query = `SELECT
		tc.id_public AS id,
		tc.title AS name,
		json_agg(json_build_object(
			'idLanguage', tcl.id_public,
			'title', tci18n.title,
			'slug', tci18n.slug
		) ORDER BY tcl.id_public) AS i18n,
		tc.is_public AS "isPublic",
		tc.has_dimensions AS "hasDimensions",
		tc.created_at AS "createdAt",
		tc.updated_at AS "updatedAt"
		FROM taxonomy.category_i18n tci18n 
		INNER JOIN taxonomy.language tcl ON tci18n.id_language = tcl.id_language
		INNER JOIN taxonomy.category tc ON tc.id_category = tci18n.id_category
		WHERE tc.id_public = $1
		GROUP BY 
			tc.id_public,
			tc.title,
			tc.is_public,
			tc.has_dimensions,
			tc.created_at,
			tc.updated_at;`;

		const result: IAdminReadCategory[] = await this.postgresqlService.execute(
			query,
			[categoryId],
			'standard',
			false,
		);
		return result.length > 0 ? result[0] : null;
	}
}
