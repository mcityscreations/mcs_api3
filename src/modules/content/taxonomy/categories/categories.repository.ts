import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';

@Injectable()
export class CategoriesRepository {
	constructor(private readonly postgresqlService: PostgreSQLService) {}

	async findInternalIdByUuid(uuid: string): Promise<number | null> {
		const query = `SELECT id_category FROM taxonomy.category WHERE id_public = $1`;
		const result: { id_category: number }[] =
			await this.postgresqlService.execute(query, [uuid]);
		if (result.length === 0) {
			return null;
		}
		return result[0].id_category;
	}
}
