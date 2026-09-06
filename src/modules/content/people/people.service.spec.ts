import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { PeopleService } from './people.service.js';
import { PeopleRepository } from './repository/people.repository.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { CountryService } from '../taxonomy/country/service/country.service.js';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';

describe('PeopleService', () => {
	let service: PeopleService;
	let repository: PeopleRepository;
	let dbService: PostgreSQLService;
	let logger: WinstonLoggerService;
	let countryService: CountryService;
	const mockPeopleRepository = {
		findOneByUUID: jest.fn(),
		findOneByID: jest.fn(),
		getMcitysID: jest.fn(),
		addPerson: jest.fn(),
		addIndividual: jest.fn(),
		addOrganization: jest.fn(),
		getCategoryPrivateID: jest.fn(),
		addPersonMapper: jest.fn(),
	};
	const mockLogger = {
		log: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	};
	const mockDbService = {
		execute: jest.fn(),
		beginTransaction: jest.fn(),
		commit: jest.fn(),
		rollback: jest.fn(),
	};
	const mockCountryService = {
		mapExternalIDToInternalID: jest.fn(),
		getCountryByCode: jest.fn(),
		convertPublicIDtoPrivateID: jest.fn(),
		getCountryFromExternalID: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PeopleService,
				{
					provide: PeopleRepository,
					useValue: mockPeopleRepository,
				},
				{
					provide: WinstonLoggerService,
					useValue: mockLogger,
				},
				{
					provide: PostgreSQLService,
					useValue: mockDbService,
				},
				{
					provide: CountryService,
					useValue: mockCountryService,
				},
			],
		}).compile();

		service = module.get<PeopleService>(PeopleService);
		repository = module.get<PeopleRepository>(PeopleRepository);
		dbService = module.get<PostgreSQLService>(PostgreSQLService);
		logger = module.get<WinstonLoggerService>(WinstonLoggerService);
		countryService = module.get<CountryService>(CountryService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
		expect(repository).toBeDefined();
		expect(dbService).toBeDefined();
		expect(logger).toBeDefined();
		expect(countryService).toBeDefined();
	});
});
