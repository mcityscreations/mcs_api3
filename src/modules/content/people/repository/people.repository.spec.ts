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
import { PeopleRepository } from './people.repository.js';
import { PGSQLTestService } from '../../../../system/database/postgresql/test/pgsql-test.spec.js';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';

describe('PeopleRepository Integration Tests', () => {
	let moduleRef: TestingModule;
	let dbService: PGSQLTestService;
	let client: PoolClient;
	let repository: PeopleRepository;

	const mockOrganization = {
		type: 'organization',
		details: {
			legalName: 'Test Organization',
			category: 1,
			registrationCountry: 186,
			idRegistration: 'REG123456',
			idVAT: 'FR123456789',
		},
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
				PeopleRepository,
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
		repository = moduleRef.get<PeopleRepository>(PeopleRepository);
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

	it('should insert person and rollback automatically', async () => {
		// Execute request within the explicit transaction client context
		const personId = await repository.addPerson(true, client);
		const result2 = await repository.addOrganization(
			personId?.idPrivate as number,
			mockOrganization.details.legalName,
			mockOrganization.details.registrationCountry,
			mockOrganization.details.idRegistration,
			mockOrganization.details.idVAT,
			mockOrganization.details.category,
			client,
		);
		console.log('Inserted organization with person ID:', result2);
		// Verify isolation directly on the transaction client
		const checkRes = await client.query(
			'SELECT * FROM content.people_organization_detail WHERE id_person = $1',
			[personId?.idPrivate],
		);
		expect(checkRes.rows).toHaveLength(1);
	});
});
