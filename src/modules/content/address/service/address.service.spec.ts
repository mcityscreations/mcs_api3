import { Test, TestingModule } from '@nestjs/testing';
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
	});
});
