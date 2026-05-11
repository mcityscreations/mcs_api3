import { IDateFilter } from '../schemas/datefilter.schema.js';

export abstract class StoreAdapter {
	abstract uploadProduct(): void;
	abstract updateProduct(): void;
	abstract uploadProductImage(): void;

	abstract getProductCategories(): void;
	abstract getProductAttributes(): void;

	abstract getInvoicesByDatePeriod(dateFilter: IDateFilter): Promise<unknown>;
}
