import { IDateFilter } from '../../../common/dates/datefilter.schema.js';

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

	/**
	 * @param customerID as stored in the third party system
	 * @return mcitys private ID
	 */
	abstract syncCustomerDataToMcitys(payload: unknown): Promise<unknown>;
}
