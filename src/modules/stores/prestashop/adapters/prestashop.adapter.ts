import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { AxiosResponse } from 'node_modules/axios/index.cjs';
import {
	InternalError,
	BadRequestError,
} from '../../../../system/errors/index.js';
import { WinstonLoggerService } from '../../../../system/logger/logger-service/winston-logger.service.js';
import { getErrorMessage } from '../../../../common/utils/error.utils.js';
import { xmlValidator } from '../../../../common/validators/xml.validators.js';
import { IDateFilter } from '../../../../common/dates/datefilter.schema.js';
import { StoreAdapter } from '../../interfaces/stores.interface.js';
import type { IStoreProcessorDto } from '../../schemas/store-processor.dto.js';
import { StoresRepository } from '../../repository/stores.repository.js';
import { PrestashopConfigService } from '../configs/prestashop.config.js';
// Invoice schemas
import type {
	IPrestashopInvoice,
	IPrestashopInvoiceList,
} from '../schemas/invoices.schema.js';
import {
	PrestashopNestedInvoiceSchema,
	PrestashopInvoiceListSchema,
	PrestashopInvoiceListSchemaFull,
} from '../schemas/invoices.schema.js';
// Payment schemas
import {
	PrestashopPaymentListSchema,
	PrestashopSinglePaymentSchema,
} from '../schemas/payment.schema.js';
// Order schemas
import type { IPrestashopOrderDetailsNormalized } from '../schemas/order-detail.schema.js';
import { PrestashopOrderDetailsResponseSchema } from '../schemas/order-detail.schema.js';
import type { IPrestashopOrder } from '../schemas/order.schema.js';
import { PrestashopOrdersResponseSchema } from '../schemas/order.schema.js';
// Address schema
import type { IPrestashopAddress } from '../schemas/address.schema.js';
import { PrestashopAddressesResponseSchema } from '../schemas/address.schema.js';
// Customer schema
import type { IPrestashopCustomer } from '../schemas/customer.schema.js';
import { PrestashopCustomersResponseSchema } from '../schemas/customer.schema.js';
// Person service
import { PeopleService } from '../../../content/people/people.service.js';
// Country service
import { PrestashopCountryListSchema } from '../schemas/country.schema.js';
import { CountryService } from '../../../content/taxonomy/country/service/country.service.js';
import type { IPrestashopPayment } from '../schemas/payment.schema.js';

@Injectable()
export class PrestashopAdapter extends StoreAdapter {
	protected apiEndpoint: string = '';
	protected authorizationKey: string = '';

	constructor(
		private readonly configService: PrestashopConfigService,
		private readonly logger: WinstonLoggerService,
		private readonly storesRepository: StoresRepository,
		private readonly peopleService: PeopleService,
		private readonly countryService: CountryService,
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
			throw new InternalError(
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

	async getMainOrderData(orderID: number): Promise<IPrestashopOrder> {
		if (!orderID || Number.isNaN(orderID)) {
			throw new InternalError(
				`Wrong type for order ID. Expecting NUMBER, ${typeof orderID} given.`,
			);
		}
		try {
			const response = await axios.get<string>(
				`${this.apiEndpoint}/orders/${orderID}`,
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
			throw new InternalError(
				`Error fetching main order data from PrestaShop for order ID ${orderID}: ${errorMessage}`,
			);
		}
	}

	async getOrderDetails(
		elementID: number,
		elementType: 'invoice' | 'order' = 'invoice',
	): Promise<IPrestashopOrderDetailsNormalized> {
		if (!elementID || Number.isNaN(elementID)) {
			throw new InternalError(
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
			throw new InternalError(
				`Error fetching order details from PrestaShop : ${errorMessage}`,
			);
		}
	}

	async getLastInvoices(): Promise<IStoreProcessorDto[]> {
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
				const mappedResponse =
					parsedResponse.prestashop.order_invoices.order_invoice.map(
						(invoice) => ({
							id: String(invoice.id),
							source_system: 'prestashop',
						}),
					);
				return mappedResponse;
			} catch (error: unknown) {
				const errorMessage = getErrorMessage(error);
				throw new InternalError(
					`Error fetching invoices from PrestaShop: ${errorMessage}`,
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
				const mappedResponse =
					parsedResponse.prestashop.order_invoices.order_invoice.map(
						(invoice) => ({
							id: String(invoice.id),
							source_system: 'prestashop',
						}),
					);
				return mappedResponse;
			} catch (error: unknown) {
				const errorMessage = getErrorMessage(error);
				throw new InternalError(
					`Error fetching invoices from PrestaShop: ${errorMessage}`,
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
			throw new BadRequestError(
				`PrestashopAdapter: Please provide a correct startDate and/or endDate value.`,
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
			throw new InternalError(
				`Error fetching invoices from PrestaShop: ${errorMessage}`,
			);
		}
	}

	public async getInvoiceDetail(
		invoiceID: number,
	): Promise<IPrestashopInvoice> {
		const invoiceIDParsed = Number.parseInt(String(invoiceID));
		if (!invoiceIDParsed || Number.isNaN(invoiceIDParsed)) {
			throw new InternalError(
				`PrestashopAdapter: Wrong type for invoice ID. Expecting NUMBER, ${typeof invoiceID} given.`,
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
				PrestashopNestedInvoiceSchema,
				'invoice',
				'PrestaShop',
			);
			// Send result
			return parsedResponse.prestashop.order_invoice;
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			throw new InternalError(
				`Error fetching invoice details from PrestaShop for invoice ID ${invoiceID}: ${errorMessage}`,
			);
		}
	}

	public async getCustomerDataByID(
		customerID: number,
	): Promise<IPrestashopCustomer> {
		if (!customerID || Number.isNaN(customerID)) {
			throw new InternalError(
				`Wrong type for customer ID. Expecting NUMBER, ${typeof customerID} given.`,
			);
		}

		const fetchCustomerFromPrestaShop = async (
			id: number,
		): Promise<AxiosResponse<string>> => {
			return axios.get<string>(`${this.apiEndpoint}/customers/${id}`, {
				headers: {
					Authorization: this.authorizationKey,
				},
			});
		};

		let customerData: AxiosResponse<string>;

		try {
			try {
				// 1. Trying to fetch the requested customer data from PrestaShop
				customerData = await fetchCustomerFromPrestaShop(customerID);
			} catch (error) {
				const axiosError = error as AxiosError;

				// 2. If the customer no longer exists (404), fall back to ID 1 (Anonymous)
				if (axiosError?.response && axiosError.response.status === 404) {
					console.warn(
						`Customer ID ${customerID} not found (404). Falling back to anonymous customer (ID: 1).`,
					);
					customerData = await fetchCustomerFromPrestaShop(1);
				} else {
					// For any other error (500, network issue, etc.), propagate it
					throw error;
				}
			}

			// 3. Parse XML response
			const parsedResponse = xmlValidator(
				customerData.data,
				PrestashopCustomersResponseSchema,
				'customer',
				'PrestaShop',
			);

			if (!parsedResponse?.customers || parsedResponse.customers.length === 0) {
				throw new Error(
					`Customer data could not be parsed or is empty for ID ${customerID}`,
				);
			}

			return parsedResponse.customers[0];
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			throw new InternalError(
				`Error fetching customer data from PrestaShop for customer ID ${customerID}: ${errorMessage}`,
			);
		}
	}

	async getAddressDataByID(addressID: number): Promise<IPrestashopAddress> {
		if (!addressID || Number.isNaN(addressID)) {
			throw new InternalError(
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
			throw new InternalError(
				`Error fetching address data from PrestaShop for address ID ${addressID}: ${errorMessage}`,
			);
		}
	}

	public async getCountryData(
		prestashopID: number,
	): Promise<{ iso3: string; name: string } | null> {
		// Retrieve country code by requesting customer's address data from Prestashop API
		if (!prestashopID || Number.isNaN(Number.parseInt(String(prestashopID)))) {
			throw new BadRequestError(
				`Prestashop country ID must be a string. ${typeof prestashopID} given.`,
			);
		}
		try {
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
			return {
				iso3: parsedResponse.prestashop.country[0].iso_code || 'FRA',
				name:
					parsedResponse.prestashop.country[0].name.language?.[0]?.value ||
					'Unknown',
			};
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			throw new InternalError(
				`Unable to get country ISO code 2 from Prestashop: ${errorMessage}`,
			);
		}
	}

	public async getOrderPayments(
		orderReference: string,
	): Promise<IPrestashopPayment[]> {
		if (!orderReference || typeof orderReference !== 'string') {
			throw new BadRequestError(
				`Prestashop order reference must be a string. ${typeof orderReference} given.`,
			);
		}
		try {
			const response = await axios.get<string>(
				`${this.apiEndpoint}/order_payments`,
				{
					params: {
						['filter[order_reference]']: orderReference,
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
				PrestashopPaymentListSchema,
				'order_payment',
				'PrestaShop',
			);
			// Send result
			return parsedResponse.prestashop.order_payments.order_payment || [];
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			throw new InternalError(
				`Error fetching payment details from PrestaShop for order reference ${orderReference}: ${errorMessage}`,
			);
		}
	}

	public async getPayment(
		paymentId: string,
	): Promise<IPrestashopPayment | null> {
		if (!paymentId || typeof paymentId !== 'string') {
			throw new BadRequestError(
				`Prestashop payment ID must be a string. ${typeof paymentId} given.`,
			);
		}
		try {
			const response = await axios.get<string>(
				`${this.apiEndpoint}/order_payments/${paymentId}`,
				{
					params: {
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
				PrestashopSinglePaymentSchema,
				'order_payment',
				'PrestaShop',
			);
			// Send result
			return parsedResponse.prestashop.order_payment[0] ?? null;
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			throw new InternalError(
				`Error fetching payment details from PrestaShop for payment ID ${paymentId}: ${errorMessage}`,
			);
		}
	}

	public async getLastPayments(
		lastPaymentID: number,
	): Promise<IPrestashopPayment[] | null> {
		if (!lastPaymentID || typeof lastPaymentID !== 'number')
			throw new BadRequestError(`
				[Prestashop Adapter] Wrong format for lastPaymentID.
			`);
		const nextPaymentID = lastPaymentID + 1;

		let paymentsData: AxiosResponse<string>;

		const fetchLastPaymentsData = async () => {
			return axios.get<string>(`${this.apiEndpoint}/order_payments`, {
				params: {
					['filter[id]']: `[${nextPaymentID}, 999999]`,
					display: 'full',
				},
				headers: {
					Authorization: this.authorizationKey,
				},
			});
		};
		// Execute request and intercept errors, handling 404 separately
		try {
			try {
				paymentsData = await fetchLastPaymentsData();
			} catch (error) {
				const axiosError = error as AxiosError;

				// 2. If no payments recorded (404), return an empty array
				if (axiosError?.response && axiosError.response.status === 404) {
					console.warn(
						`Payments starting from ID ${nextPaymentID} not found (404). Returning empty array.`,
					);
					return [];
				} else {
					// For any other error (500, network issue, etc.), propagate it
					throw error;
				}
			}

			// Parse response
			const parsedResponse = xmlValidator(
				paymentsData.data,
				PrestashopPaymentListSchema,
				'order_payment',
				'PrestaShop',
			);
			// Send result
			return parsedResponse.prestashop.order_payments.order_payment || [];
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			throw new InternalError(
				`Error fetching payment details from PrestaShop for payments between n°${nextPaymentID} and n°999999: ${errorMessage}`,
			);
		}
	}
}
