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
        ap.source_system AS "source_system",
        ap.id_payment_source "id_source",
        json_build_object(
            'id', apm.id_public,
            'label', apm.name
        ) AS payment_method,
        ap.payment_direction AS "payment_direction",
        ap.amount AS amount,
        ap.currency AS currency,
        ap.paid_at AS "paid_at",
        COALESCE(ap.id_transaction, 'N/A') AS "id_transaction"
    FROM accounting.payment ap
    INNER JOIN accounting.payment_method apm ON ap.id_payment_method = apm.id_payment_method
    INNER JOIN accounting.payment_allocation apa ON apa.id_payment = ap.id_payment
    INNER JOIN accounting.invoice ai ON apa.id_invoice = ai.id_invoice`;

	constructor(private readonly dbService: PostgreSQLService) {}

	public async addPayment(
		payload: ICreateMcitysPayment,
	): Promise<string | null> {
		const query = `
        INSERT INTO accounting.payment (
        `;
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
        SELECT ap.id_payment_method AS id_payment_method
        FROM accounting.payment_method ap
        INNER JOIN accounting.payment_method_mapper apm ON ap.id_payment_method = apm.id_payment_method
        WHERE apm.system_source = $1 AND apm.id_source = $2
        `;
		const result = await this.dbService.execute<{ id_payment_method: string }>(
			query,
			[payload.systemSource, payload.externalPaymentMethodId],
			'standard',
		);
		return result.length > 0 ? result[0].id_payment_method : null;
	}
}
