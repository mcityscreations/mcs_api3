import { IDateFilter } from '../../../common/dates/datefilter.schema.js';

export interface IInvoiceStoreDto {
	id: string;
	source_system: string;
}

export abstract class StoreAdapter {
	abstract uploadProduct(): void;
	abstract updateProduct(): void;
	abstract uploadProductImage(): void;

	abstract getProductCategories(): void;
	abstract getProductAttributes(): void;
	abstract getOrderDetails(
		elementID: number,
		elementType: 'invoice' | 'order',
	): Promise<unknown>;

	abstract getLastInvoices(): Promise<unknown>;
	abstract getInvoicesByDatePeriod(dateFilter: IDateFilter): Promise<unknown>;
}
