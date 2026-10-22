import { Inject, Injectable } from '@nestjs/common';
import {
	InternalError,
	NotFoundError,
} from '../../../../system/errors/index.js';
import type { IInvoiceStoreDto } from '../../schemas/invoice-store.dto.js';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import { AddressService } from '../../../content/address/service/address.service.js';
import { CountryService } from '../../../content/taxonomy/country/service/country.service.js';
import { IPrestashopInvoice } from '../schemas/invoices.schema.js';
import type { ICreateMcitysInvoice } from '../../../accounting/schemas/mcitys/invoice.schema.js';
import type { IPrestashopOrder } from '../schemas/order.schema.js';
import type { IPrestashopOrderDetailsNormalized } from '../schemas/order-detail.schema.js';
import { mapPrestashopInvoiceToMcitysInvoice } from '../../../accounting/schemas/mappers/invoice.mapper.js';
import { PrestashopSyncService } from '../sync/prestashop/prestashop-sync.service.js';

@Injectable()
export class PrestashopAgregator {
	constructor(
		@Inject('PRESTASHOP_STORE')
		private readonly prestashopStoreAdapter: PrestashopAdapter,
		private readonly prestashopSyncService: PrestashopSyncService,
		private readonly addressService: AddressService,
		private readonly countryService: CountryService,
	) {}

	/**
	 * @description This method agregates different data sources to generate a standardized invoice format.
	 * It also synchronizes customer and address data with the Mcitys system.
	 * @param invoiceID - The ID of the invoice to be aggregated.
	 * @returns A promise that resolves to a standardized invoice object or null if the aggregation fails.
	 * @throws InternalError if any required data is missing or if synchronization fails.
	 * @throws NotFoundError if country data cannot be retrieved.
	 * */
	public async agregateInvoiceData(
		currentInvoice: IInvoiceStoreDto,
	): Promise<ICreateMcitysInvoice | null> {
		const invoiceID = Number.parseInt(currentInvoice.id);

		// Retrieving detailed invoice data from PrestaShop //
		const mainInvoiceData: IPrestashopInvoice =
			await this.prestashopStoreAdapter.getInvoiceDetail(invoiceID);
		const mainOrderData: IPrestashopOrder =
			await this.prestashopStoreAdapter.getMainOrderDataByInvoiceID(invoiceID);
		const detailedOrderData: IPrestashopOrderDetailsNormalized =
			await this.prestashopStoreAdapter.getOrderDetails(invoiceID, 'invoice');

		// Get address //
		if (!mainOrderData.id_address_invoice)
			throw new InternalError(
				`[Prestashop Agregator] - ID address invoice is missing.`,
			);
		const addressData = await this.prestashopStoreAdapter.getAddressDataByID(
			mainOrderData.id_address_invoice,
		);
		const countryData = await this.countryService.getCountryFromExternalID({
			idCountry: addressData.id_country,
			systemSource: 'prestashop',
		});
		if (!countryData) throw new NotFoundError(`Unable to get country data.`);

		// Get customer //
		if (!mainOrderData.id_customer) {
			throw new InternalError(
				`[Prestashop Agregator] - Missing customer ID in main order data for invoice ID ${currentInvoice.id}`,
			);
		}
		const customerData = await this.prestashopStoreAdapter.getCustomerDataByID(
			mainOrderData.id_customer,
		);
		// Synchronize customer data with Mcitys system
		const isCompany: boolean = !!customerData?.siret;
		const mcitysCustomerID: string | null = !isCompany
			? await this.prestashopSyncService.syncCustomerIndividual({
					customerData: customerData,
					addressData: addressData,
					countryData: countryData,
				})
			: await this.prestashopSyncService.syncCustomerCompany({
					customerData: customerData,
					addressData: addressData,
					countryData: countryData,
				});
		if (!mcitysCustomerID)
			throw new InternalError(
				`[Prestashop Agregator] - Unable to synchronize customer data for Prestashop customer ${mainOrderData.id_customer}`,
			);

		// Synchronize contact data with Mcitys system
		const emailID = customerData?.email
			? await this.prestashopSyncService.syncContact({
					systemSource: 'prestashop',
					idSource: 'prestamail-' + mainOrderData.id_customer.toString(),
					idPerson: mcitysCustomerID,
					isPrimary: true,
					isProfessional: isCompany,
					title: 'My email',
					value: customerData.email,
					isVerified: true,
					contactCategory: 1, //Email
				})
			: null;
		if (!emailID)
			throw new InternalError(
				`[Prestashop Agregator] - Unable to synchronize Prestashop email data for customer ${mainOrderData.id_customer}`,
			);
		if (addressData?.phone) {
			await this.prestashopSyncService.syncContact({
				systemSource: 'prestashop',
				idSource: 'prestaphone-' + mainOrderData.id_customer.toString(),
				idPerson: mcitysCustomerID,
				isPrimary: true,
				isProfessional: isCompany,
				title: 'My phone',
				value: addressData.phone,
				isVerified: true,
				contactCategory: 2, //Phone
			});
		}
		if (addressData?.phone_mobile) {
			await this.prestashopSyncService.syncContact({
				systemSource: 'prestashop',
				idSource: 'prestamobile-' + mainOrderData.id_customer.toString(),
				idPerson: mcitysCustomerID,
				isPrimary: true,
				isProfessional: isCompany,
				title: 'My mobile phone',
				value: addressData.phone_mobile,
				isVerified: true,
				contactCategory: 2, //Phone
			});
		}
		// As phone number is optional, we don't throw an error if it fails to synchronize

		// Synchronize address data with Mcitys system
		const addressID = await this.prestashopSyncService.syncAddress({
			idPerson: mcitysCustomerID,
			addressData: addressData,
			countryData: countryData,
		});
		if (!addressID)
			throw new InternalError(
				`[Prestashop Agregator] - Unable to synchronize Prestashop address data for customer ${mainOrderData.id_customer}`,
			);
		// Map invoice
		const mcitysInvoice = mapPrestashopInvoiceToMcitysInvoice(
			mainInvoiceData,
			mainOrderData,
			detailedOrderData,
			'invoice',
			{
				addressID: addressID,
				customerID: mcitysCustomerID,
				emailID: emailID,
			},
		);
		return mcitysInvoice;
	}
}
