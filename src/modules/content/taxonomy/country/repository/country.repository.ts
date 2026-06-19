import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../../system/database/postgresql/postgresql.service.js';

@Injectable()
export class CountryRepository {
	constructor(private readonly postgresqlService: PostgreSQLService) {}
	public async findInternalIdByUuid(
		externalID: string,
		systemSource: string,
	): Promise<number | null> {
		const query = `SELECT id_country FROM taxonomy.country_mapper WHERE external_id = $1 AND system_source = $2`;
		const result: { id_country: number }[] =
			await this.postgresqlService.execute<{ id_country: number }>(query, [
				externalID,
				systemSource,
			]);
		return result.length > 0 ? result[0].id_country : null;
	}
}
