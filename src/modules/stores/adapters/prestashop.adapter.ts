import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import { xmlToJsonConverter } from '../../../common/utils/XMLToJson.utils.js';
import { IDateFilter } from '../../../common/dates/datefilter.schema.js';
import { StoreAdapter } from '../interfaces/stores.interface.js';
import { StoresRepository } from '../repository/stores.repository.js';
import { PrestashopConfigService } from '../configs/prestashop/prestashop.config.js';
import type {
	IPrestashopInvoice,
	IPrestashopInvoiceList,
} from '../schemas/prestashop/invoices.schema.js';
import {
	PrestashopInvoiceSchema,
	PrestashopInvoiceListSchema,
} from '../schemas/prestashop/invoices.schema.js';
import type { IPrestashopOrderDetailsNormalized } from '../schemas/prestashop/order-detail.schema.js';
import { PrestashopOrderDetailsResponseSchema } from '../schemas/prestashop/order-detail.schema.js';

@Injectable()
export class PrestashopAdapter extends StoreAdapter {
	protected apiEndpoint: string = '';
	protected authorizationKey: string = '';

	constructor(
		private readonly configService: PrestashopConfigService,
		private readonly logger: WinstonLoggerService,
		private readonly storesRepository: StoresRepository,
	) {
		super();
		this.initializeStore();
	}

	initializeStore() {
		this.apiEndpoint = this.configService.url;
		this.authorizationKey = this.configService.authorizationKey;
		if (this.apiEndpoint !== '' && this.authorizationKey !== '') {
			this.logger.log(
				'PrestaShop Adapter initialized with API Endpoint: ' + this.apiEndpoint,
			);
		} else {
			this.logger.error(
				'Failed to initialize PrestaShop Adapter. Missing API endpoint or authorization key.',
			);
			throw new InternalServerErrorException(
				'Failed to initialize PrestaShop Adapter. Missing API endpoint or authorization key.',
			);
		}
	}

	uploadProduct(): void {
		// The logic to upload a product to PrestaShop
	}

	updateProduct(): void {
		// The logic to update a product in PrestaShop
	}

	uploadProductImage(): void {
		// The logic to upload a product image to PrestaShop
	}

	getProductCategories(): void {
		// The logic to retrieve product categories from PrestaShop
	}

	getProductAttributes(): void {
		// The logic to retrieve product attributes from PrestaShop
	}

	async getOrderDetailsByInvoiceID(
		invoiceID: number,
	): Promise<IPrestashopOrderDetailsNormalized> {
		if (!invoiceID || Number.isNaN(invoiceID)) {
			this.logger.error(
				`Wrong type for invoice ID. Expecting NUMBER, ${typeof invoiceID} given.`,
			);
			throw new InternalServerErrorException(
				`Wrong type for invoice ID. Expecting NUMBER, ${typeof invoiceID} given.`,
			);
		}
		const response = await axios.get(`${this.apiEndpoint}/order_details`, {
			params: {
				'filter[id_order_invoice]': invoiceID,
				display: 'full',
			},
			headers: {
				Authorization: this.authorizationKey,
			},
		});
		// Parse XML response
		const parsedResponse = xmlToJsonConverter(response.data as string);
		if (
			!PrestashopOrderDetailsResponseSchema.safeParse(parsedResponse).success
		) {
			this.logger.error(
				'Invalid order details data format received from PrestaShop',
			);
			throw new InternalServerErrorException(
				'Invalid order details data format received from PrestaShop',
			);
		}
		return PrestashopOrderDetailsResponseSchema.safeParse(parsedResponse)
			.data as IPrestashopOrderDetailsNormalized;
	}

	async getLastInvoices(): Promise<IPrestashopInvoiceList> {
		// Retrieve last invoice ID stored in Postgres
		const lastInvoiceID =
			await this.storesRepository.getLastPrestashopInvoiceID();
		if (lastInvoiceID === 0) {
			// Make an api call to Prestashop to retrieve all invoices,
			// since there is no invoice stored in the database yet.
			const response = await axios.get(`${this.apiEndpoint}/order_invoices`, {
				params: {
					'filter[id]': [1, 999999],
				},
				headers: {
					Authorization: this.authorizationKey,
				},
			});
			// Parse response
			const parsedResponse = xmlToJsonConverter(response.data as string);
			if (!PrestashopInvoiceListSchema.safeParse(parsedResponse).success) {
				this.logger.error(
					'Invalid invoice data format received from PrestaShop',
				);
				throw new InternalServerErrorException(
					'Invalid invoice data format received from PrestaShop',
				);
			}
			return PrestashopInvoiceListSchema.safeParse(parsedResponse)
				.data as IPrestashopInvoiceList;
		} else {
			// Make an api call to Prestashop to retrieve invoices with an ID greater than the last one stored in the database.
			const nextInvoiceID = lastInvoiceID + 1;
			const response = await axios.get(`${this.apiEndpoint}/order_invoices`, {
				params: {
					'filter[id]': [nextInvoiceID, 999999],
				},
				headers: {
					Authorization: this.authorizationKey,
				},
			});
			// Parse response
			const parsedResponse = xmlToJsonConverter(response.data as string);
			if (!PrestashopInvoiceListSchema.safeParse(parsedResponse).success) {
				this.logger.error(
					'Invalid invoice data format received from PrestaShop',
				);
				throw new InternalServerErrorException(
					'Invalid invoice data format received from PrestaShop',
				);
			}
			return PrestashopInvoiceListSchema.safeParse(parsedResponse)
				.data as IPrestashopInvoiceList;
		}
	}

	async getInvoicesByDatePeriod(
		dateFilter: IDateFilter,
	): Promise<IPrestashopInvoiceList> {
		// The logic to retrieve invoices from PrestaShop
		const { startDate, endDate } = dateFilter;
		if (!startDate || !endDate) {
			this.logger.error(
				`Please provide a correct startDate and/or endDate value.`,
				`PrestashopAdapter`,
				`getInvoicesByDatePeriod`,
			);
			throw new InternalServerErrorException(
				`Please provide a correct startDate and/or endDate value.`,
			);
		}
		try {
			const response = await axios.get(`${this.apiEndpoint}/order_invoices`, {
				params: {
					date_min: startDate,
					date_max: endDate,
				},
				headers: {
					Authorization: this.authorizationKey,
				},
			});

			// Parse XML response
			const parsedResponse = xmlToJsonConverter(response.data as string);

			// Parse the response to match the IPrestashopInvoice interface
			if (!PrestashopInvoiceListSchema.safeParse(parsedResponse).success) {
				this.logger.error(
					'Invalid invoice data format received from PrestaShop',
				);
				throw new InternalServerErrorException(
					'Invalid invoice data format received from PrestaShop',
				);
			}
			return PrestashopInvoiceListSchema.safeParse(parsedResponse)
				.data as IPrestashopInvoiceList;
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error(
				'Error fetching invoices from PrestaShop',
				errorMessage,
			);
			throw new InternalServerErrorException(
				'Error fetching invoices from PrestaShop',
			);
		}
	}

	public async getInvoiceDetail(
		invoiceID: number,
	): Promise<IPrestashopInvoice> {
		const invoiceIDParsed = Number.parseInt(String(invoiceID));
		if (!invoiceIDParsed || Number.isNaN(invoiceIDParsed)) {
			this.logger.error(
				`Wrong type for invoice ID. Expecting NUMBER, ${typeof invoiceID} given.`,
			);
			throw new InternalServerErrorException(
				`Wrong type for invoice ID. Expecting NUMBER, ${typeof invoiceID} given.`,
			);
		}
		try {
			const response = await axios.get(
				`${this.apiEndpoint}/order_invoices/${invoiceID}`,
				{
					headers: {
						Authorization: this.authorizationKey,
					},
				},
			);
			// Parse response
			const parsedResponse = xmlToJsonConverter(response.data as string);
			// Check type
			if (!PrestashopInvoiceSchema.safeParse(parsedResponse).success) {
				this.logger.error(
					`Invalid invoice data format received from PrestaShop.`,
				);
				throw new InternalServerErrorException(
					`Invalid invoice data format received from PrestaShop.`,
				);
			}
			// Send result
			return PrestashopInvoiceSchema.safeParse(parsedResponse)
				.data as IPrestashopInvoice;
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error(
				`Error fetching invoice details from PrestaShop for invoice ID ${invoiceID}`,
				errorMessage,
			);
			throw new InternalServerErrorException(
				`Error fetching invoice details from PrestaShop for invoice ID ${invoiceID}`,
			);
		}
	}
}
