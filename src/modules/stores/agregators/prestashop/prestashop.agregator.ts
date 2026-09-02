import { Injectable } from '@nestjs/common';
import {
	InternalError,
	NotFoundError,
} from '../../../../system/errors/index.js';
import { PrestashopAdapter } from '../../adapters/prestashop.adapter.js';
import { AddressService } from '../../../content/address/service/address.service.js';
import { CountryService } from '../../../content/taxonomy/country/service/country.service.js';
import { IPrestashopInvoice } from '../../schemas/prestashop/invoices.schema.js';
import type { ICreateMcitysInvoice } from '../../../accounting/schemas/mcitys/invoice.schema.js';
import type { IPrestashopOrder } from '../../schemas/prestashop/order.schema.js';
import type { IPrestashopOrderDetailsNormalized } from '../../schemas/prestashop/order-detail.schema.js';
import { mapPrestashopInvoiceToMcitysInvoice } from '../../../accounting/schemas/mappers/invoice.mapper.js';

@Injectable()
export class PrestashopAgregator {
	constructor(
		private readonly prestashopStoreAdapter: PrestashopAdapter,
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
		prestashopInvoice: IPrestashopInvoice,
	): Promise<ICreateMcitysInvoice | null> {
		// Retrieving detailed invoice data from PrestaShop //
		const mainOrderData: IPrestashopOrder =
			await this.prestashopStoreAdapter.getMainOrderDataByInvoiceID(
				prestashopInvoice.id,
			);
		const detailedOrderData: IPrestashopOrderDetailsNormalized =
			await this.prestashopStoreAdapter.getOrderDetails(
				prestashopInvoice.id,
				'invoice',
			);

		// Get address & synchronize //
		if (!mainOrderData.id_address_invoice)
			throw new InternalError(
				`PrestashopInvoiceProcessor - ID address invoice is missing.`,
			);
		const addressData = await this.prestashopStoreAdapter.getAddressDataByID(
			mainOrderData.id_address_invoice,
		);
		const countryData = await this.countryService.getCountryFromExternalID({
			idCountry: addressData.id!,
			systemSource: 'prestashop',
		});
		if (!countryData) throw new NotFoundError(`Unable to get country data.`);

		// Synchronize customer data //
		if (!mainOrderData.id_customer) {
			throw new InternalError(
				`PrestashopAdapter : Missing customer ID in main order data for invoice ID ${prestashopInvoice.id}`,
			);
		}
		const customerData = await this.prestashopStoreAdapter.getCustomerDataByID(
			mainOrderData.id_customer,
		);
		const mcitysCustomerID: { idPrivate: number; idPublic: string } | null =
			await this.prestashopStoreAdapter.syncCustomerDataToMcitys({
				customerData: customerData,
				addressData: addressData,
				countryData: countryData,
			});
		if (!mcitysCustomerID)
			throw new InternalError(
				`Unable to synchronize customer data for Prestashop customer ${mainOrderData.id_customer}`,
			);

		// Save address //
		const addressID = await this.addressService.saveAddress({
			idPerson: mcitysCustomerID.idPrivate,
			name: 'Invoicing address',
			isDefault: false,
			address: {
				country: {
					iso2: countryData.iso2,
					iso3: countryData.iso3,
					name: countryData.name,
				},
				address1: addressData.address1,
				address2: addressData.address2 ?? undefined,
				city: addressData.city,
				state: addressData.id_state?.toString() ?? undefined,
				zip_code: addressData.postcode as string,
				phone: (addressData.phone || addressData.phone_mobile) ?? undefined,
			},
		});
		if (!addressID)
			throw new InternalError(
				`Unable to synchronize address data from Prestashop for invoice : ${prestashopInvoice.id}.`,
			);
		// Map invoice
		const mcitysInvoice = mapPrestashopInvoiceToMcitysInvoice(
			prestashopInvoice,
			mainOrderData,
			detailedOrderData,
			'invoice',
			{
				addressID: addressID.idPrivate,
				customerID: mcitysCustomerID.idPrivate,
			},
		);
		return mcitysInvoice;
	}
}
