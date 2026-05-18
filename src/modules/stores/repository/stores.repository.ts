import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import { IPrestashopInvoice } from '../schemas/prestashop/invoices.schema.js';

@Injectable()
export class StoresRepository {
	constructor(private readonly postgreSQLService: PostgreSQLService) {}

	saveInvoice(invoiceData: IPrestashopInvoice): void {
		// The logic to save the invoice data into the database
	}

	/** Retrieves the ID of the last Prestashop invoice recorded in the Mcitys database */
	async getLastPrestashopInvoiceID(): Promise<number> {
		const sqlRequest = `SELECT id_technical_erp FROM accounting.invoice ORDER BY issue_date DESC LIMIT 1;`;
		const result = await this.postgreSQLService.execute(
			sqlRequest,
			[],
			'standard',
			true,
		);
		// Invoice ID is stored as a string in the database, we need to parse it to an integer before returning it.
		return Number.parseInt(result[0] as string) || 0;
	}
}
