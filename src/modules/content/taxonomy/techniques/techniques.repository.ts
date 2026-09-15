import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import { Ii18n } from '../../../../common/schemas/i18n.schema.js';

@Injectable()
export class TechniquesRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async findOne(id: string): Promise<Ii18n[] | null> {
		const query = `SELECT
                tcl.id_public as "idLanguage",
                tti18n.title AS value 
                tti18n.slug AS slug
                FROM taxonomy.technique_i18n tti18n 
                INNER JOIN taxonomy.language tcl ON tti18n.id_language = tcl.id_language
                INNER JOIN taxonomy.technique tt ON tt.id_technique = tti18n.id_technique
                WHERE tt.id_public = $1;`;

		const result: Ii18n[] = await this.dbService.execute(
			query,
			[id],
			'standard',
			false,
		);
		return result.length > 0 ? result : null;
	}
}
