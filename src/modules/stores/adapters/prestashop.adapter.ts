import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import { xmlValidator } from '../../../common/validators/xml.validators.js';
import { IDateFilter } from '../../../common/dates/datefilter.schema.js';
import { StoreAdapter } from '../interfaces/stores.interface.js';
import { StoresRepository } from '../repository/stores.repository.js';
import { PrestashopConfigService } from '../configs/prestashop/prestashop.config.js';
// Invoice schemas
import type {
	IPrestashopInvoice,
	IPrestashopInvoiceList,
	IPrestashopInvoiceListFull,
} from '../schemas/prestashop/invoices.schema.js';
import {
	PrestashopInvoiceSchema,
	PrestashopInvoiceListSchema,
	PrestashopInvoiceListSchemaFull,
} from '../schemas/prestashop/invoices.schema.js';
import { IMcitysInvoice } from '../../accounting/schemas/mcitys/invoice.schema.js';
import { mapPrestashopInvoiceToMcitysInvoice } from '../../accounting/schemas/mappers/invoice.mapper.js';
// Order schemas
import type { IPrestashopOrderDetailsNormalized } from '../schemas/prestashop/order-detail.schema.js';
import { PrestashopOrderDetailsResponseSchema } from '../schemas/prestashop/order-detail.schema.js';
import type { IPrestashopOrder } from '../schemas/prestashop/order.schema.js';
import { PrestashopOrdersResponseSchema } from '../schemas/prestashop/order.schema.js';
// Address schema
import type { IPrestashopAddress } from '../schemas/prestashop/address.schema.js';
import { PrestashopAddressesResponseSchema } from '../schemas/prestashop/address.schema.js';
// Customer schema
import type { IPrestashopCustomer } from '../schemas/prestashop/customer.schema.js';
import {
	PrestashopCustomerSchema,
	PrestashopCustomersResponseSchema,
} from '../schemas/prestashop/customer.schema.js';
// Person service
import { PeopleService } from '../../content/people/people.service.js';
import {
	IPrestashopCountryList,
	PrestashopCountryListSchema,
} from '../schemas/prestashop/country.schema.js';

@Injectable()
export class PrestashopAdapter extends StoreAdapter {
	protected apiEndpoint: string = '';
	protected authorizationKey: string = '';

	constructor(
		private readonly configService: PrestashopConfigService,
		private readonly logger: WinstonLoggerService,
		private readonly storesRepository: StoresRepository,
		private readonly peopleService: PeopleService,
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
				'PrestashopAdapter',
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

	async mapInvoice(invoice: IPrestashopInvoice): Promise<IMcitysInvoice> {
		const mainOrderData: IPrestashopOrder =
			await this.getMainOrderDataByInvoiceID(invoice.id);
		const detailedOrderData: IPrestashopOrderDetailsNormalized =
			await this.getOrderDetails(invoice.id, 'invoice');
		const customerData = await this.getCustomerDataByID(
			mainOrderData.id_customer,
		);
		const addressData = await this.getAddressDataByID(
			mainOrderData.id_address_invoice,
		);
		const mappedInvoice = mapPrestashopInvoiceToMcitysInvoice(
			invoice,
			mainOrderData,
			detailedOrderData,
			customerData,
			addressData,
		);
		return mappedInvoice;
	}

	async getMainOrderDataByInvoiceID(
		invoiceID: number,
	): Promise<IPrestashopOrder> {
		if (!invoiceID || Number.isNaN(invoiceID)) {
			this.logger.error(
				`Wrong type for invoice ID. Expecting NUMBER, ${typeof invoiceID} given.`,
				'PrestashopAdapter',
			);
			throw new InternalServerErrorException(
				`Wrong type for invoice ID. Expecting NUMBER, ${typeof invoiceID} given.`,
			);
		}
		try {
			const response = await axios.get<string>(
				`${this.apiEndpoint}/orders/${invoiceID}`,
				{
					headers: {
						Authorization: this.authorizationKey,
					},
				},
			);
			// Parse XML response
			const parsedResponse = xmlValidator(
				response.data,
				PrestashopOrdersResponseSchema,
				'order',
				'PrestaShop',
			);
			return parsedResponse.orders[0];
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error(
				`Error fetching main order data from PrestaShop for invoice ID ${invoiceID}`,
				errorMessage,
			);
			throw new InternalServerErrorException(
				`Error fetching main order data from PrestaShop for invoice ID ${invoiceID}`,
			);
		}
	}

	async getOrderDetails(
		elementID: number,
		elementType: 'invoice' | 'order' = 'invoice',
	): Promise<IPrestashopOrderDetailsNormalized> {
		if (!elementID || Number.isNaN(elementID)) {
			this.logger.error(
				`Wrong type for ${elementType} ID. Expecting NUMBER, ${typeof elementID} given.`,
				'PrestashopAdapter',
				'getOrderDetails',
			);
			throw new InternalServerErrorException(
				`Wrong type for ${elementType} ID. Expecting NUMBER, ${typeof elementID} given.`,
			);
		}
		try {
			const filterKey =
				elementType === 'invoice'
					? 'filter[id_order_invoice]'
					: 'filter[id_order]';
			const response = await axios.get<string>(
				`${this.apiEndpoint}/order_details`,
				{
					params: {
						[filterKey]: elementID,
						display: 'full',
					},
					headers: {
						Authorization: this.authorizationKey,
					},
				},
			);
			// Parse XML response
			const parsedResponse = xmlValidator(
				response.data,
				PrestashopOrderDetailsResponseSchema,
				'order details',
				'PrestaShop',
			);
			return parsedResponse;
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error(
				'Error fetching order details from PrestaShop',
				errorMessage,
			);
			throw new InternalServerErrorException(
				'Error fetching order details from PrestaShop',
			);
		}
	}

	async getLastInvoices(): Promise<IPrestashopInvoiceListFull> {
		// Retrieve last invoice ID stored in Postgres
		const lastInvoiceID =
			await this.storesRepository.getLastPrestashopInvoiceID();
		if (lastInvoiceID === 0) {
			// Make an api call to Prestashop to retrieve all invoices,
			// since there is no invoice stored in the database yet.
			try {
				const response = await axios.get<string>(
					`${this.apiEndpoint}/order_invoices`,
					{
						params: {
							'filter[id]': '[1, 999999]',
							display: 'full',
						},
						paramsSerializer: {
							indexes: null,
						},
						headers: {
							Authorization: this.authorizationKey,
						},
					},
				);
				// Parse response
				const parsedResponse = xmlValidator(
					response.data,
					PrestashopInvoiceListSchemaFull,
					'invoice list',
					'PrestaShop',
				);
				return parsedResponse;
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
		} else {
			// Make an api call to Prestashop to retrieve invoices with an ID greater than the last one stored in the database.
			const nextInvoiceID = lastInvoiceID + 1;
			try {
				const response = await axios.get<string>(
					`${this.apiEndpoint}/order_invoices`,
					{
						params: {
							'filter[id]': `[${nextInvoiceID}, 999999]`,
							display: 'full',
						},
						headers: {
							Authorization: this.authorizationKey,
						},
					},
				);
				// Parse response
				const parsedResponse = xmlValidator(
					response.data,
					PrestashopInvoiceListSchemaFull,
					'invoice list',
					'PrestaShop',
				);
				return parsedResponse;
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
			const response = await axios.get<string>(
				`${this.apiEndpoint}/order_invoices`,
				{
					params: {
						date_min: startDate,
						date_max: endDate,
					},
					headers: {
						Authorization: this.authorizationKey,
					},
				},
			);

			// Parse XML response
			const parsedResponse = xmlValidator(
				response.data,
				PrestashopInvoiceListSchema,
				'invoice list',
				'PrestaShop',
			);
			return parsedResponse;
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
				'PrestashopAdapter',
				'getInvoiceDetail',
			);
			throw new InternalServerErrorException(
				`Wrong type for invoice ID. Expecting NUMBER, ${typeof invoiceID} given.`,
			);
		}
		try {
			const response = await axios.get<string>(
				`${this.apiEndpoint}/order_invoices/${invoiceID}`,
				{
					headers: {
						Authorization: this.authorizationKey,
					},
				},
			);
			// Parse response
			const parsedResponse = xmlValidator(
				response.data,
				PrestashopInvoiceSchema,
				'invoice',
				'PrestaShop',
			);
			// Send result
			return parsedResponse;
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

	async getCustomerDataByID(customerID: number): Promise<IPrestashopCustomer> {
		if (!customerID || Number.isNaN(customerID)) {
			this.logger.error(
				`Wrong type for customer ID. Expecting NUMBER, ${typeof customerID} given.`,
				'PrestashopAdapter',
				'getCustomerDataByID',
			);
			throw new InternalServerErrorException(
				`Wrong type for customer ID. Expecting NUMBER, ${typeof customerID} given.`,
			);
		}
		try {
			const response = await axios.get<string>(
				`${this.apiEndpoint}/customers/${customerID}`,
				{
					headers: {
						Authorization: this.authorizationKey,
					},
				},
			);
			// Parse XML response
			const parsedResponse = xmlValidator(
				response.data,
				PrestashopCustomersResponseSchema,
				'customer',
				'PrestaShop',
			);
			return parsedResponse.customers[0];
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error(
				`Error fetching customer data from PrestaShop for customer ID ${customerID}`,
				errorMessage,
			);
			throw new InternalServerErrorException(
				`Error fetching customer data from PrestaShop for customer ID ${customerID}`,
			);
		}
	}

	async syncCustomerDataToMcitys(
		customerData: IPrestashopCustomer,
	): Promise<number | null> {
		if (!PrestashopCustomerSchema.safeParse(customerData).success) {
			this.logger.error(
				`Wrong type for customer data.`,
				'PrestashopAdapter',
				'syncCustomerDataToMcitys',
			);
			throw new InternalServerErrorException(`Wrong type for customer data.`);
		}
		// Is the customer already in Mcitys?
		const customerID = customerData.id?.toString() || 'unknown';
		const existingMcitysID = await this.peopleService.getMcitysID(
			customerID,
			'prestashop',
		);
		// 1. If yes, return the existing Mcitys ID
		if (existingMcitysID) return existingMcitysID;
		// 2. If no, create a new person in Mcitys and return the new Mcitys ID
		if (customerData.siret && customerData.siret !== '') {
			const getCountryISOCode = await this.getCountryISOCode(customerD);
			const customerID = await this.peopleService.addOrganization({
				type: 'organization',
				legalName: customerData.company,
				idRegistration: customerData.siret,
				idVAT: 'N/A',
				category: { id: 3, name: 'administration' },
				registrationCountry: { id: 8, name: 'France' },
			});
		}
		// 3. Add contact information (email, phone, etc.) to the person in Mcitys
	}

	async getAddressDataByID(addressID: number): Promise<IPrestashopAddress> {
		if (!addressID || Number.isNaN(addressID)) {
			this.logger.error(
				`Wrong type for address ID. Expecting NUMBER, ${typeof addressID} given.`,
				'PrestashopAdapter',
				'getAddressDataByID',
			);
			throw new InternalServerErrorException(
				`Wrong type for address ID. Expecting NUMBER, ${typeof addressID} given.`,
			);
		}
		try {
			const response = await axios.get<string>(
				`${this.apiEndpoint}/addresses/${addressID}`,
				{
					headers: {
						Authorization: this.authorizationKey,
					},
				},
			);
			// Parse XML response
			const parsedResponse = xmlValidator(
				response.data,
				PrestashopAddressesResponseSchema,
				'address',
				'PrestaShop',
			);
			return parsedResponse.addresses[0];
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error(
				`Error fetching address data from PrestaShop for address ID ${addressID}`,
				errorMessage,
			);
			throw new InternalServerErrorException(
				`Error fetching address data from PrestaShop for address ID ${addressID}`,
			);
		}
	}

	public async getCountryISOCode(prestashopID: number): Promise<string | null> {
		// Retrieve country code by requesting customer's address data from Prestashop API
		if (!prestashopID || Number.isNaN(prestashopID)) {
			throw new BadRequestException(
				`Prestashop country ID must be a string. ${typeof prestashopID} given.`,
			);
		}
		const { data } = await axios.get<string>(
			`${this.apiEndpoint}/countries/${prestashopID}`,
			{
				headers: {
					Authorization: this.authorizationKey,
				},
			},
		);
		const parsedResponse = xmlValidator(
			data,
			PrestashopCountryListSchema,
			'country',
			'prestashop',
		);
		return parsedResponse.prestashop.country[0].iso_code || 'FRA';
	}
}
