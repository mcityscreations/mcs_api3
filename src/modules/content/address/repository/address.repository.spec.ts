import { Test, TestingModule } from '@nestjs/testing';
import {
	describe,
	beforeAll,
	afterAll,
	beforeEach,
	afterEach,
	it,
	expect,
} from '@jest/globals';
import { ConfigModule } from '@nestjs/config';
import { PoolClient } from 'pg';
import { AddressRepository } from './address.repository.js';
import { PGSQLTestService } from '../../../../system/database/postgresql/test/pgsql-test.spec.js';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';

describe('AddressRepository Integration Tests', () => {
	let moduleRef: TestingModule;
	let dbService: PGSQLTestService;
	let client: PoolClient;
	let repository: AddressRepository;

	const mockOrganizationAddress = {
		idPerson: '01a0572d-51f6-7513-8b70-10e1f554fa81',
		name: 'Headquarters',
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
	};

	beforeAll(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					envFilePath: '.env',
				}),
			],
			providers: [
				AddressRepository,
				PGSQLTestService, // Declares the test service provider
				{
					// Aliases PostgreSQLService to PGSQLTestService
					provide: PostgreSQLService,
					useExisting: PGSQLTestService,
				},
			],
		}).compile();

		// ⚠️ CRUCIAL: Triggers onModuleInit() to initialize pg pools
		await moduleRef.init();

		dbService = moduleRef.get<PGSQLTestService>(PGSQLTestService);
		repository = moduleRef.get<AddressRepository>(AddressRepository);
	});

	beforeEach(async () => {
		// 1. Get dedicated client from the standard pool
		client = await dbService.getPool('standard').connect();

		// 2. Start explicit transaction
		await client.query('BEGIN');
	});

	afterEach(async () => {
		// 3. Rollback changes made during the test
		await client.query('ROLLBACK');

		// 4. Release client back to the pool
		client.release();
	});

	afterAll(async () => {
		// Closes module AND pools via onModuleDestroy
		await moduleRef.close();
	});

	it('should insert address and rollback automatically', async () => {
		// Execute request within the explicit transaction client context
		const result = await repository.saveAddress(mockOrganizationAddress);

		expect(result).not.toBeNull();

		// Verify isolation directly on the transaction client
		const checkRes = await client.query(
			'SELECT * FROM content.address WHERE id_address = $1',
			[result?.idPrivate],
		);
		expect(checkRes.rows).toHaveLength(1);
	});
});
