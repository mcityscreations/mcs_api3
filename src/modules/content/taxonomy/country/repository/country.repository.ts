import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../../system/database/postgresql/postgresql.service.js';
import type { ICountry } from '../schemas/country.schema.js';

@Injectable()
export class CountryRepository {
	constructor(private readonly postgresqlService: PostgreSQLService) {}
	public async mapExternalIDToInternalID(
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

	public async convertPublicIDtoPrivateID(id: string): Promise<number | null> {
		const sqlRequest = `SELECT id_country FROM taxonomy.country tc WHERE tc.id_public = $1`;
		const result: { id_country: number }[] =
			await this.postgresqlService.execute(sqlRequest, [id], 'standard', false);
		return result.length > 0 ? result[0].id_country : null;
	}

	public async getCountryFromExternalID(
		externalID: string,
		systemSource: string,
	): Promise<ICountry | null> {
		const sqlRequest = `
		SELECT 
			tc.id_country AS id,
			tc.id_public AS id_public,
			tc.alpha_2_code AS iso2,
			tc.alpha_3_code AS iso3,
			tc.name AS name,
			(
				SELECT json_agg(
					json_build_object(
						'id', tcgm.id_country_group,
						'code', tcg.code,
						'name', tcg.name
					)
				)
				FROM taxonomy.country_group_member tcgm
				JOIN taxonomy.country_group tcg ON tcgm.id_country_group = tcg.id_country_group
				WHERE tcgm.id_country = tc.id_country
			) AS country_groups
		FROM taxonomy.country tc
		JOIN taxonomy.country_mapper tcm ON tc.id_country = tcm.id_country
		WHERE tcm.external_id = $1 
		AND tcm.system_source = $2;`;
		const result = await this.postgresqlService.execute<ICountry>(
			sqlRequest,
			[externalID, systemSource],
			'standard',
			false,
		);
		return result.length > 0 ? result[0] : null;
	}
}
