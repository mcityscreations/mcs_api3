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
import { McitysCreatePaymentSchema } from '../../payment/schemas/mcitys/payment.schema.js';

@Injectable()
export class PaymentService {
	constructor(
		private readonly invoiceService: InvoiceService,
		private readonly paymentRepository: PaymentRepository,
	) {}
	public async addPayment(
		payload: ICreateMcitysPayment,
	): Promise<string | null> {
		console.log(payload);
		// Parse payload
		if (!McitysCreatePaymentSchema.safeParse(payload).success) {
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
		const paymentId = await this.paymentRepository.addPayment({
			...payload,
			id_invoice: idInvoice ?? null,
			id_order: payload.id_order ?? null,
		});
		return paymentId;
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
		if (lastPayment?.id_invoice) {
			lastPayment.id_invoice = lastPayment?.id_invoice ?? 'Not allocated';
		}
		return lastPayment;
	}
}
