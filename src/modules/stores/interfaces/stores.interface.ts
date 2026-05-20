import { IDateFilter } from '../../../common/dates/datefilter.schema.js';

export abstract class StoreAdapter {
	abstract uploadProduct(): void;
	abstract updateProduct(): void;
	abstract uploadProductImage(): void;

	abstract getProductCategories(): void;
	abstract getProductAttributes(): void;

	abstract getOrderDetailsByInvoiceID(invoiceID: number): Promise<unknown>;

	abstract getLastInvoices(): Promise<unknown>;
	abstract getInvoicesByDatePeriod(dateFilter: IDateFilter): Promise<unknown>;
}
