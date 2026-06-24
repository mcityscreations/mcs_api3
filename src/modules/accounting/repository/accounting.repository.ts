import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import type { PoolClient } from 'pg';
import type { IMcitysInvoice } from '../schemas/mcitys/invoice.schema.js';

@Injectable()
export class AccountingRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async saveMainInvoiceData(
		data: IMcitysInvoice,
		transactionClient: PoolClient,
	): Promise<number | null> {
		const sqlRequest = `INSERT INTO accounting.invoice 
        (system_source, reference, id_technical_erp, amount_wt, amount_vat, amount_at, 
        issue_date, due_date, paid_at, emitter, recipient, currency, payment_direction, invoice_type) 
        
        VALUES ($1) RETURNING id_invoice`;
		const result = await this.dbService.execute<{ id_invoice: number }>(
			sqlRequest,
			[
				data.source_system,
				data.reference,
				data.id_technical,
				data.total_amount_tax_excl,
				data.vat_amount,
				data.total_amount_tax_incl,
				data.issue_date,
				data.due_date,
				data.paid_at,
				data.emitter,
				data.recipient,
				data.currency,
				data.payment_direction,
				data.invoice_type,
			],
			'standard',
			false,
			transactionClient,
		);
		return result.length > 0 ? result[0].id_invoice : null;
	}
}
