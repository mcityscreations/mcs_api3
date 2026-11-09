import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import {
	ValidationError,
	InternalError,
} from '../../../../system/errors/index.js';
import { AddressService } from './address.service.js';
import { AddressRepository } from '../repository/address.repository.js';

describe('AddressService', () => {
	let service: AddressService;
	let repository: jest.Mocked<AddressRepository>;
	const mockAddressRepository = {
		getAddressById: jest.fn(),
		getAddressByUUID: jest.fn(),
		saveAddress: jest.fn(),
	};
	const mockIndividualAddress = {
		idPerson: '01a05729-fecb-7675-9c74-f5a3ec194cad',
		name: 'Invoicing',
		address: {
			country: {
				iso2: 'FR',
				name: 'France',
				iso3: 'FRA',
			},
			id: undefined,
			address1: '123 Main St',
			address2: 'Apt 4B',
			address3: '',
			city: 'Paris',
			state: 'Île-de-France',
			zip_code: '75001',
			phone: '+33 1 23 45 67 89',
		},
		isDefault: true,
		isBillingAddress: true,
	};

	const mockOrganizationAddress = {
		idPerson: '01a0572d-51f6-7513-8b70-10e1f554fa81',
		name: 'Headquarters',
		systemSource: 'prestashop',
		idSource: 'prestashop-123456',
		address: {
			country: { iso2: 'FR', name: 'France', iso3: 'FRA' },
			id: undefined,
			address1: '456 Corporate Blvd',
			address2: 'Suite 100',
			address3: '',
			city: 'Paris',
			state: 'Île-de-France',
			zip_code: '75002',
			phone: '+33 1 98 76 54 32',
		},
		isDefault: true,
		isBillingAddress: false,
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AddressService,
				{
					provide: AddressRepository,
					useValue: mockAddressRepository,
				},
			],
		}).compile();

		service = module.get(AddressService);
		repository = module.get(AddressRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
		expect(repository).toBeDefined();
	});

	it('should throw an error when address payload has a wrong structure', async () => {
		await expect(service.saveAddress(undefined as any)).rejects.toThrow(
			ValidationError,
		);
	});
	it('should throw an internal error when the address repository fails to save the address', async () => {
		await expect(service.saveAddress(mockIndividualAddress)).rejects.toThrow(
			InternalError,
		);
	});

	it('should save an address and return ids when payload is valid', async () => {
		const expectedIds = {
			idPrivate: 123,
			idPublic: '01a12345-1234-7234-9234-123456789abc',
		};
		repository.saveAddress.mockResolvedValue(expectedIds);

		const result = await service.saveAddress(mockOrganizationAddress);

		expect(repository.saveAddress).toHaveBeenCalledWith(mockOrganizationAddress);
		expect(result).toEqual(expectedIds);
	});
});
