import { Injectable } from '@nestjs/common';
import {
	InternalError,
	ValidationError,
} from '../../../../../system/errors/index.js';
import { isUuidV7 } from '../../../../../common/validators/isuuidv7.validator.js';
// People
import { PeopleService } from '../../../../content/people/people.service.js';
import type { IPrestashopCustomer } from '../../schemas/customer.schema.js';
import { PrestashopCustomerSchema } from '../../schemas/customer.schema.js';
// Address
import { AddressService } from '../../../../content/address/service/address.service.js';
import { PrestashopAddressSchema } from '../../schemas/address.schema.js';
import type { IPrestashopAddress } from '../../schemas/address.schema.js';
import type { ICountry } from '../../../../content/taxonomy/country/schemas/country.schema.js';
import { CountrySchema } from '../../../../content/taxonomy/country/schemas/country.schema.js';
// Contact
import { ContactService } from '../../../../content/contact/contact.service.js';
import {
	AddContactSchema,
	type IAddContact,
} from '../../../../content/contact/schemas/contact.schema.js';

@Injectable()
export class PrestashopSyncService {
	constructor(
		private readonly peopleService: PeopleService,
		private readonly contactService: ContactService,
		private readonly addressService: AddressService,
	) {}

	public async syncCustomerIndividual(payload: {
		customerData: IPrestashopCustomer;
		addressData: IPrestashopAddress;
		countryData: ICountry;
	}): Promise<string | null> {
		console.log(payload);
		const { customerData, addressData, countryData } = payload;

		// Validate the types of the provided data
		if (!PrestashopCustomerSchema.safeParse(customerData).success) {
			throw new ValidationError(
				`[PrestashopAdapter] - Wrong type for customer data.`,
			);
		}
		if (!PrestashopAddressSchema.safeParse(addressData).success) {
			throw new ValidationError(
				`[PrestashopAdapter] - Wrong type for address data.`,
			);
		}
		if (!CountrySchema.safeParse(countryData).success) {
			throw new ValidationError(
				`[PrestashopAdapter] - Wrong type for country data.`,
			);
		}

		// 1. Is the customer already in Mcitys?
		const customerID: string = String(customerData.id);
		const existingMcitysID = await this.contactService.findPersonByContact([
			customerData.email,
		]);

		// 2. If yes, return the existing Mcitys ID
		if (existingMcitysID) return existingMcitysID;

		// 3. If no, create a new person in Mcitys and return the new Mcitys ID
		const newMcitysIDs = await this.peopleService.addIndividual({
			type: 'individual',
			details: {
				firstName: customerData.firstname,
				lastName: customerData.lastname,
			},
		});
		if (!newMcitysIDs)
			throw new InternalError(
				`Unable to synchronize Prestashop customer data :` +
					JSON.stringify(payload),
			);
		// 4. Add the new person to the person mapper
		// Do not map the customer here if it is a company.
		// Company mapping is handled in the syncCustomerCompany method.
		if (!customerData.siret) {
			const personMapperID = await this.peopleService.addPersonToMapper({
				idPerson: newMcitysIDs.idPublic,
				systemSource: 'prestashop',
				idPersonSource: customerID,
				isProfessional: false,
				isAbroad: payload.countryData.iso3 !== 'FRA',
				sourceData: JSON.stringify(payload),
			});
			if (!personMapperID)
				throw new InternalError(
					`Unable to add person to person mapper for Prestashop customer ${customerID}`,
				);
		}
		return newMcitysIDs.idPublic;
	}

	public async syncCustomerCompany(payload: {
		customerData: IPrestashopCustomer;
		addressData: IPrestashopAddress;
		countryData: ICountry;
	}): Promise<string | null> {
		const { customerData, addressData, countryData } = payload;
		if (!PrestashopCustomerSchema.safeParse(customerData).success) {
			throw new ValidationError(
				`[PrestashopAdapter] - Wrong type for customer data.`,
			);
		}
		if (!PrestashopAddressSchema.safeParse(addressData).success) {
			throw new ValidationError(
				`[PrestashopAdapter] - Wrong type for address data.`,
			);
		}
		if (!CountrySchema.safeParse(countryData).success) {
			throw new ValidationError(
				`[PrestashopAdapter] - Wrong type for country data.`,
			);
		}
		// Is company registered in the Mcitys system by its SIRET number?
		const customerID: string = String(customerData.id);
		const existingOrganization =
			await this.peopleService.getOrganizationBySiret(
				customerData.siret as string,
			);
		// If not stored in the system, add it
		const mcitysID = !existingOrganization
			? await this.peopleService.addOrganization({
					type: 'organization',
					details: {
						legalName: customerData.company as string,
						idRegistration: customerData.siret as string,
						idVAT: addressData.vat_number,
						category: '019b8a59-1c9f-71bd-b108-3efcbe2cde93', // Default category for companies
						registrationCountry: countryData.iso3 ?? 'FRA',
					},
				})
			: existingOrganization.id;
		if (!mcitysID)
			throw new InternalError(
				`Unable to synchronize Prestashop customer data :` +
					JSON.stringify(payload),
			);

		// Is the company member already in the Mcitys system by its email?
		const member = await this.syncCustomerIndividual(payload);
		if (!member)
			throw new InternalError(
				`Unable to synchronize Prestashop customer data :` +
					JSON.stringify(payload),
			);

		// Add the member to the organization if not already added
		const isLinkedToOrganization =
			await this.peopleService.addMemberToOrganization(mcitysID, member);
		if (!isLinkedToOrganization) {
			throw new InternalError(
				`[PrestashopSync] Unable to link Prestashop member ${customerID} 
				to organization ${customerData.company} in Mcitys system.`,
			);
		}

		// Add company to person mapper
		const isMapped = await this.peopleService.addPersonToMapper({
			idPerson: mcitysID,
			systemSource: 'prestashop',
			idPersonSource: customerID,
			isProfessional: true,
			isAbroad: payload.countryData.iso3 !== 'FRA',
			sourceData: JSON.stringify(payload),
		});
		if (!isMapped)
			throw new InternalError(
				`[PrestashopSync] Unable to add person to person mapper for Prestashop customer ${customerID}`,
			);
		return mcitysID;
	}

	public async syncAddress(payload: {
		idPerson: string;
		addressData: IPrestashopAddress;
		countryData: ICountry;
	}): Promise<string | null> {
		const { idPerson, addressData, countryData } = payload;
		if (!isUuidV7(idPerson)) {
			throw new ValidationError(
				`[PrestashopSync] - Invalid UUID for idPerson.`,
			);
		}
		if (!PrestashopAddressSchema.safeParse(addressData).success) {
			throw new ValidationError(
				`[PrestashopSync] - Wrong type for address data.`,
			);
		}
		if (!CountrySchema.safeParse(countryData).success) {
			throw new ValidationError(
				`[PrestashopSync] - Wrong type for country data.`,
			);
		}
		const isAddressSynced = await this.addressService.saveAddress({
			idPerson: idPerson,
			name: 'Invoicing address',
			systemSource: 'prestashop',
			idSource: addressData.id ? String(addressData.id) : undefined,
			isDefault: false,
			isBillingAddress: true,
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
				zip_code: String(addressData.postcode),
				phone: (addressData.phone || addressData.phone_mobile) ?? undefined,
			},
		});
		if (!isAddressSynced)
			throw new InternalError(
				`[PrestashopSync] Unable to synchronize Prestashop address data :` +
					JSON.stringify(payload),
			);
		return isAddressSynced ?? null;
	}

	public async syncContact(payload: IAddContact): Promise<string | null> {
		if (!AddContactSchema.safeParse(payload).success) {
			throw new ValidationError(
				`[PrestashopSync] - Wrong type for contact data.`,
			);
		}
		const contactID = await this.contactService.addPersonContact(payload);
		if (!contactID)
			throw new InternalError(
				`[PrestashopSync] Unable to synchronize Prestashop contact data :` +
					JSON.stringify(payload),
			);
		return contactID ?? null;
	}

	public async syncInvoice() {}
}
