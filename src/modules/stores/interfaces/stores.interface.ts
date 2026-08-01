import { IDateFilter } from '../../../common/dates/datefilter.schema.js';
import { IMcitysInvoice } from '../../accounting/schemas/mcitys/invoice.schema.js';

export abstract class StoreAdapter {
	abstract uploadProduct(): void;
	abstract updateProduct(): void;
	abstract uploadProductImage(): void;

	abstract getProductCategories(): void;
	abstract getProductAttributes(): void;
	abstract mapInvoice(invoice: unknown): Promise<IMcitysInvoice>;
	abstract getOrderDetails(
		elementID: number,
		elementType: 'invoice' | 'order',
	): Promise<unknown>;

	abstract getLastInvoices(): Promise<unknown>;
	abstract getInvoicesByDatePeriod(dateFilter: IDateFilter): Promise<unknown>;
}
