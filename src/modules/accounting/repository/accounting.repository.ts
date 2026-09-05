import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import type { ICreateMcitysInvoice } from '../schemas/mcitys/invoice.schema.js';

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
		data: ICreateMcitysInvoice,
		items: string,
	): Promise<number | null> {
		const sqlRequest = `
		WITH 
		new_invoice AS (
		INSERT INTO accounting.invoice 
			(system_source, reference, id_technical_erp, amount_wt, amount_vat, amount_at, 
			issue_date, due_date, paid_at, emitter, recipient, currency, payment_direction, invoice_type
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
			ON CONFLICT (reference, system_source) DO NOTHING;
			RETURNING id_invoice
		),
		new_payment_status AS (
		INSERT INTO accounting.invoice_status_history
			(id_invoice, id_invoice_status)
			SELECT id_invoice, 5 
    		FROM new_invoice
		),
		new_sync_status AS (
		INSERT INTO accounting.invoice_sync_history (id_invoice, id_sync_status)
			SELECT id_invoice, 1 
    		FROM new_invoice
		)

		INSERT INTO accounting.invoice_detail
			(id_invoice, id_item, label, description, unit_price_tax_excl, discount, 
			unit_price_tax_excl_discount, unit_price_tax_incl, vat_rate, total_price_tax_excl, 
			total_price_tax_incl, quantity)
		SELECT 
			new_invoice.id_invoice,
			items.id_item,
			items.label,
			items.description,
			items.unit_price_tax_excl,
			items.discount,
			items.unit_price_tax_excl_discount,
			items.unit_price_tax_incl,
			items.vat_rate,
			items.total_price_tax_excl,
			items.total_price_tax_incl,
			items.quantity
		FROM new_invoice
		CROSS JOIN jsonb_to_recordset($1::jsonb) AS items(
			id VARCHAR(255),
			label VARCHAR(255),
			description TEXT,
			quantity INT,
			unit_price_tax_excl INT,
			discount JSONB ,
			unit_price_tax_excl_discount INT,
			unit_price_tax_incl INT,
			vat_rate INT,
			total_price_tax_excl INT,
			total_price_tax_incl INT
		)`;

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
				items,
			],
			'standard',
			false,
		);
		return result.length > 0 ? result[0].id_invoice : null;
	}
}
