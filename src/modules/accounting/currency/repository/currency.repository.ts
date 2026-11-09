import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import type { ICurrency } from '../schemas/currency.schema.js';

@Injectable()
export class CurrencyRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async findOneById(id_currency: string): Promise<ICurrency | null> {
		const query = `
            SELECT
                ac.id_currency AS "id_currency",
                ac.id_currency AS "iso_alpha_3_code",
                ac.iso_digit_code AS "iso_digit_code",
                ac.name AS "name",
                ac.symbol AS "symbol",
                ac.display_format AS "display_format"
            FROM accounting.currency ac
            WHERE ac.id_currency = $1
            LIMIT 1;
        `;
		const result = await this.dbService.execute<ICurrency>(
			query,
			[id_currency],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

	public async findOneByExternalId(payload: {
		systemSource: string;
		externalCurrencyId: string;
	}): Promise<ICurrency | null> {
		const query = `
         SELECT
            ac.id_currency AS "id_currency",
            ac.id_currency AS "iso_alpha_3_code",
            ac.iso_digit_code AS "iso_digit_code",
            ac.name AS "name",
            ac.symbol AS "symbol",
            ac.display_format AS "display_format"
        FROM accounting.currency ac
        JOIN accounting.currency_mapper acm ON ac.id_currency = acm.id_currency
        WHERE acm.system_source = $1
          AND acm.id_source = $2
        `;
		const result = await this.dbService.execute<ICurrency>(
			query,
			[payload.systemSource, payload.externalCurrencyId],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}
}
