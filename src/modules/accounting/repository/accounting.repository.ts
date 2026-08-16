import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import type { PoolClient } from 'pg';
import type { IMcitysInvoice } from '../schemas/mcitys/invoice.schema.js';

@Injectable()
export class AccountingRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async doesInvoiceExist({
		reference,
		systemSource,
	}: {
		reference: string;
		systemSource: string;
	}): Promise<boolean> {
		const sqlRequest = `
            SELECT EXISTS (
                SELECT 1 
                FROM accounting.invoice 
                WHERE reference = $1 AND system_source = $2
            ) as "exists";
        `;
		const result = await this.dbService.execute<{ exists: boolean }>(
			sqlRequest,
			[reference, systemSource],
			'standard',
			false,
			null,
		);
		return result.length > 0 ? result[0].exists : false;
	}

	public async saveMainInvoiceData(
		data: IMcitysInvoice,
		transactionClient: PoolClient,
	): Promise<number | null> {
		const sqlRequest = `INSERT INTO accounting.invoice 
        (system_source, reference, id_technical_erp, amount_wt, amount_vat, amount_at, 
        issue_date, due_date, paid_at, emitter, recipient, currency, payment_direction, invoice_type) 
        
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id_invoice`;
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
