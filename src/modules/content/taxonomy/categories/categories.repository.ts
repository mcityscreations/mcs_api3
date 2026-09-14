import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import { Ii18n } from '../../../../common/schemas/i18n.schema.js';

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

	public async findOne(categoryId: string): Promise<Ii18n[] | null> {
		const query = `SELECT
		tcl.id_public as "idLanguage",
		tci18n.title AS value 
		FROM taxonomy.category_i18n tci18n 
		INNER JOIN taxonomy.language tcl ON tci18n.id_language = tcl.id_language
		INNER JOIN taxonomy.category tc ON tc.id_category = tci18n.id_category
		WHERE tc.id_public = $1;`;

		const result: Ii18n[] = await this.postgresqlService.execute(
			query,
			[categoryId],
			'standard',
			false,
		);
		return result.length > 0 ? result : null;
	}
}
