import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { PrestashopSyncService } from './prestashop-sync.service.js';
import { PeopleService } from '../../../../content/people/people.service.js';
import { ContactService } from '../../../../content/contact/contact.service.js';

describe('PrestashopService', () => {
	let service: PrestashopSyncService;
	const mockPeopleService = {
		getOrganizationBySiret: jest.fn(),
		addOrganization: jest.fn(),
		addMemberToOrganization: jest.fn(),
		addPersonToMapper: jest.fn(),
		addIndividual: jest.fn(),
	};
	const mockContactService = {
		findPersonByContact: jest.fn(),
	};

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PrestashopSyncService,
				{
					provide: PeopleService,
					useValue: mockPeopleService,
				},
				{
					provide: ContactService,
					useValue: mockContactService,
				},
			],
		}).compile();

		service = module.get<PrestashopSyncService>(PrestashopSyncService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should synchronize a company customer and map it into Mcitys', async () => {
		const payload = {
			customerData: {
				id: 42,
				id_default_group: 4,
				id_lang: 2,
				passwd: 'secret',
				lastname: 'Doe',
				firstname: 'John',
				email: 'john.doe@example.com',
				company: 'ACME Corp',
				siret: '12345678901234',
			},
			addressData: {
				id: 10,
				id_customer: 42,
				id_country: 33,
				alias: 'HQ',
				company: 'ACME Corp',
				lastname: 'Doe',
				firstname: 'John',
				vat_number: 'FR12345678901',
				address1: '1 Main Street',
				city: 'Paris',
				phone: '0102030405',
				phone_mobile: '0607080910',
				dni: 'ID-1234',
			},
			countryData: {
				id: '019b8a59-1c9f-71bd-b108-3efcbe2cde93',
				iso2: 'FR',
				iso3: 'FRA',
				name: 'France',
				country_groups: [],
			},
		};

		mockPeopleService.getOrganizationBySiret.mockResolvedValue(null);
		mockPeopleService.addOrganization.mockResolvedValue('org-public-id');
		mockPeopleService.addMemberToOrganization.mockResolvedValue(true);
		mockPeopleService.addPersonToMapper.mockResolvedValue(true);
		jest
			.spyOn(service, 'syncCustomerIndividual')
			.mockResolvedValue('member-public-id');

		const result = await service.syncCustomerCompany(payload);

		expect(result).toBe('org-public-id');
		expect(mockPeopleService.getOrganizationBySiret).toHaveBeenCalledWith(
			'12345678901234',
		);
		expect(mockPeopleService.addOrganization).toHaveBeenCalledWith({
			type: 'organization',
			details: {
				legalName: 'ACME Corp',
				idRegistration: '12345678901234',
				idVAT: 'FR12345678901',
				category: '019b8a59-1c9f-71bd-b108-3efcbe2cde93',
				registrationCountry: 'FRA',
			},
		});
		expect(service.syncCustomerIndividual).toHaveBeenCalledWith(payload);
		expect(mockPeopleService.addMemberToOrganization).toHaveBeenCalledWith(
			'org-public-id',
			'member-public-id',
		);
		expect(mockPeopleService.addPersonToMapper).toHaveBeenCalledWith({
			idPerson: 'org-public-id',
			systemSource: 'prestashop',
			idPersonSource: '42',
			isProfessional: true,
			isAbroad: false,
			sourceData: JSON.stringify(payload),
		});
	});

	it('should throw when member cannot be linked to the organization', async () => {
		const payload = {
			customerData: {
				id: 42,
				id_default_group: 4,
				id_lang: 2,
				passwd: 'secret',
				lastname: 'Doe',
				firstname: 'John',
				email: 'john.doe@example.com',
				company: 'ACME Corp',
				siret: '12345678901234',
			},
			addressData: {
				id: 10,
				id_customer: 42,
				id_country: 33,
				alias: 'HQ',
				company: 'ACME Corp',
				lastname: 'Doe',
				firstname: 'John',
				vat_number: 'FR12345678901',
				address1: '1 Main Street',
				city: 'Paris',
				phone: '0102030405',
				phone_mobile: '0607080910',
				dni: 'ID-1234',
			},
			countryData: {
				id: '019b8a59-1c9f-71bd-b108-3efcbe2cde93',
				iso2: 'FR',
				iso3: 'FRA',
				name: 'France',
				country_groups: [],
			},
		};

		mockPeopleService.getOrganizationBySiret.mockResolvedValue({
			id: 'org-public-id',
		});
		mockPeopleService.addMemberToOrganization.mockResolvedValue(false);
		jest
			.spyOn(service, 'syncCustomerIndividual')
			.mockResolvedValue('member-public-id');

		await expect(service.syncCustomerCompany(payload)).rejects.toThrow(
			'Unable to link Prestashop member 42',
		);
		expect(mockPeopleService.addPersonToMapper).not.toHaveBeenCalled();
	});
});
