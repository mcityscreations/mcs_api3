import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import { xmlToJsonConverter } from '../../../common/utils/XMLToJson.utils.js';
import { IDateFilter } from '../../../common/dates/datefilter.schema.js';
import { StoreAdapter } from '../interfaces/stores.interface.js';
import { PrestashopConfigService } from '../configs/prestashop/prestashop.config.js';
import type { IPrestashopInvoice, IPrestashopInvoiceList } from '../schemas/prestashop/invoices.schema.js';
import { PrestashopInvoiceSchema, PrestashopInvoiceListSchema } from '../schemas/prestashop/invoices.schema.js';

@Injectable()
export class PrestashopAdapter extends StoreAdapter {
	protected apiEndpoint: string = '';
	protected authorizationKey: string = '';

	constructor(
		private readonly configService: PrestashopConfigService,
		private readonly logger: WinstonLoggerService,
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

	async getInvoicesByDatePeriod(
		dateFilter: IDateFilter,
	): Promise<IPrestashopInvoiceList> {
		// The logic to retrieve invoices from PrestaShop
		const { startDate, endDate } = dateFilter;
		if (!startDate || !endDate) {
			this.logger.error(`Please provide a correct startDate and/or endDate value.`,`PrestashopAdapter`,`getInvoicesByDatePeriod`);
			throw new InternalServerErrorException(`Please provide a correct startDate and/or endDate value.`)
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
			const parsedResponse = xmlToJsonConverter(response.data);
			
			// Parse the response to match the IPrestashopInvoice interface
			if (!PrestashopInvoiceListSchema.safeParse(
				parsedResponse,
			).success) {
				this.logger.error(
					'Invalid invoice data format received from PrestaShop',
				);
				throw new InternalServerErrorException(
					'Invalid invoice data format received from PrestaShop',
				);
			}
			return parsedResponse as IPrestashopInvoiceList;
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

	public async getInvoiceDetail(invoiceID: number): Promise<IPrestashopInvoice> {
		if (!invoiceID || Number.isNaN(invoiceID)) {
			this.logger.error(`Wrong type for invoice ID. Expecting NUMBER, ${typeof invoiceID} given.`);
			throw new InternalServerErrorException(`Wrong type for invoice ID. Expecting NUMBER, ${typeof invoiceID} given.`);
		}
		try {
			const response = await axios.get(`${this.apiEndpoint}/order_invoices/${invoiceID}`, {
				headers: {
						Authorization: this.authorizationKey,
					}
				}
			);
			// Parse response
			const parsedResponse = xmlToJsonConverter(response.data)
			// Check type
			if (!PrestashopInvoiceSchema.safeParse(parsedResponse).success) {
				this.logger.error(`Invalid invoice data format received from PrestaShop.`);
				throw new InternalServerErrorException(`Invalid invoice data format received from PrestaShop.`);
			}
			// Send result
			return parsedResponse as IPrestashopInvoice;
		} catch(error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error(`Error fetching invoice details from PrestaShop for invoice ID ${invoiceID}`, errorMessage);
			throw new InternalServerErrorException(`Error fetching invoice details from PrestaShop for invoice ID ${invoiceID}`);
		}
		
	}
}
