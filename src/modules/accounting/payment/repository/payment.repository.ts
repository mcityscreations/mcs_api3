import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import type {
	ICreateMcitysPayment,
	IMcitysPayment,
} from '../schemas/mcitys/payment.schema.js';

@Injectable()
export class PaymentRepository {
	private basePaymentRequest = `
    SELECT
        ap.id_public AS "id_payment",
        ai.id_public AS "id_invoice",
        ap.system_source AS "system_source",
        ap.id_payment_source AS "id_source",
        json_build_object(
            'id', apm.id_public,
            'label', apm.name
        ) AS payment_method,
        ap.amount AS amount,
        ap.currency AS currency,
        ap.paid_at AS "paid_at",
        COALESCE(ap.id_transaction, 'N/A') AS "id_transaction"
    FROM accounting.payment ap
    INNER JOIN accounting.payment_method apm ON ap.id_payment_method = apm.id_payment_method
    LEFT JOIN accounting.payment_allocation apa ON apa.id_payment = ap.id_payment
    LEFT JOIN accounting.invoice ai ON apa.id_invoice = ai.id_invoice`;

	constructor(private readonly dbService: PostgreSQLService) {}

	public async addPayment(
		payload: ICreateMcitysPayment,
	): Promise<string | null> {
		const query = `
		WITH payment_method AS (
			SELECT apm.id_payment_method
			FROM accounting.payment_method apm
			WHERE apm.id_public = $1
		)
        INSERT INTO accounting.payment (
			id_payment_method,
			amount,
			source_data,
			system_source,
			id_payment_source,
			paid_at,
			currency,
			id_order_source,
			id_invoice_source,
			id_transaction
		) VALUES (
			(SELECT id_payment_method FROM payment_method),
			$2, $3, $4, $5, $6, $7, $8, $9, $10
		) RETURNING id_public AS "id_payment";
		`;
		const result = await this.dbService.execute<{ id_payment: string }>(
			query,
			[
				payload.payment_method,
				payload.amount,
				payload.source_data,
				payload.system_source,
				payload.id_payment_source,
				payload.paid_at,
				payload.currency,
				payload.id_order ?? null,
				payload.id_invoice ?? null,
				payload.id_transaction ?? null,
			],
			'standard',
		);
		return result.length > 0 ? result[0].id_payment : null;
	}

	public async getLastPayment(): Promise<IMcitysPayment | null> {
		const query = `${this.basePaymentRequest} ORDER BY ap.paid_at DESC LIMIT 1`;
		const result = await this.dbService.execute<IMcitysPayment>(
			query,
			[],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

	public async getLastPaymentBySource(
		systemSource: string,
	): Promise<IMcitysPayment | null> {
		const query = `
        ${this.basePaymentRequest}
        WHERE ap.system_source = $1
        ORDER BY ap.paid_at DESC
        LIMIT 1;
        `;
		const result = await this.dbService.execute<IMcitysPayment>(
			query,
			[systemSource],
			'standard',
		);
		return result.length > 0 ? result[0] : null;
	}

	public async getPaymentMethodByExternalID(payload: {
		systemSource: string;
		externalPaymentMethodId: string;
	}): Promise<string | null> {
		const query = `
        SELECT ap.id_public AS id
        FROM accounting.payment_method ap
        INNER JOIN accounting.payment_method_mapper apm ON ap.id_payment_method = apm.id_payment_method
        WHERE apm.system_source = $1 AND apm.id_source = $2
        `;
		const result = await this.dbService.execute<{ id: string }>(
			query,
			[payload.systemSource, payload.externalPaymentMethodId],
			'standard',
		);
		return result.length > 0 ? result[0].id : null;
	}
}
