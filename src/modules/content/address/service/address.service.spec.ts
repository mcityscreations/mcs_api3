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
});
