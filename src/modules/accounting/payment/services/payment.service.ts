import { Injectable } from '@nestjs/common';
import {
	ValidationError,
	NotFoundError,
} from '../../../../system/errors/index.js';
import type {
	ICreateMcitysPayment,
	IMcitysPayment,
} from '../schemas/mcitys/payment.schema.js';
import { InvoiceService } from '../../invoice/services/invoice.service.js';
import { PaymentRepository } from '../repository/payment.repository.js';
import { CreateMcitysInvoiceSchema } from '../../invoice/schemas/mcitys/invoice.schema.js';

@Injectable()
export class PaymentService {
	constructor(
		private readonly invoiceService: InvoiceService,
		private readonly paymentRepository: PaymentRepository,
	) {}
	public async addPayment(
		payload: ICreateMcitysPayment,
	): Promise<string | null> {
		// Parse payload
		if (!CreateMcitysInvoiceSchema.safeParse(payload).success) {
			throw new ValidationError(`
				[PaymentService] Unable to process payment : The payload format is wrong.`);
		}
		if (!payload.id_invoice && !payload.id_order)
			throw new ValidationError(`
				[PaymentService] Unable to process payment, invoice or order ID missing.
				`);

		const idInvoice =
			payload.id_invoice ??
			(await this.invoiceService.getInvoiceIdByOrderId({
				orderId: payload.id_order as string,
				systemSource: 'prestashop',
			}));
		if (!idInvoice)
			throw new NotFoundError(
				`[PrestashopSyncService] Unable to find invoice ID for ${payload.system_source} order reference ${payload.id_order}`,
			);
	}

	public async getPaymentMethodByExternalID(payload: {
		systemSource: string;
		externalPaymentMethodId: string;
	}): Promise<string | null> {
		if (!payload.systemSource || !payload.externalPaymentMethodId) {
			throw new ValidationError(
				`[PaymentService] Unable to get payment method : The payload format is wrong.`,
			);
		}
		const result =
			await this.paymentRepository.getPaymentMethodByExternalID(payload);
		if (!result) {
			throw new NotFoundError(
				`[PaymentService] Unable to find payment method for system source ${payload.systemSource} and external payment method ID ${payload.externalPaymentMethodId}`,
			);
		}
		return result;
	}

	public async getLastPayment(
		systemSource: string,
	): Promise<IMcitysPayment | null> {
		const lastPayment = systemSource
			? await this.paymentRepository.getLastPaymentBySource(systemSource)
			: await this.paymentRepository.getLastPayment();
		return lastPayment;
	}
}
