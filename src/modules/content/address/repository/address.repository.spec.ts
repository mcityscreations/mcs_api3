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
import { TransactionContext } from '../../../../system/database/postgresql/transactions/transaction-context.service.js';

describe('AddressRepository Integration Tests', () => {
	let moduleRef: TestingModule;
	let dbService: PGSQLTestService;
	let client: PoolClient;
	let repository: AddressRepository;

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
				PGSQLTestService,
				TransactionContext,
				{
					provide: PostgreSQLService,
					useExisting: PGSQLTestService,
				},
			],
		}).compile();

		await moduleRef.init();

		dbService = moduleRef.get<PGSQLTestService>(PGSQLTestService);
		repository = moduleRef.get<AddressRepository>(AddressRepository);
	});

	beforeEach(async () => {
		client = await dbService.getPool('standard').connect();
	});

	afterEach(() => {
		if (client) client.release();
	});

	afterAll(async () => {
		if (moduleRef) await moduleRef.close();
	});

	it('should save an address in database with real insert and cleanup', async () => {
		const personResult = await client.query<{
			id_person: number;
			id_public: string;
		}>(
			'INSERT INTO content.people (is_organization, reference) VALUES ($1, $2) RETURNING id_person, id_public',
			[true, 'TEST-ADDRESS-REPOSITORY'],
		);

		const personIdPrivate = personResult.rows[0].id_person;
		const personIdPublic = personResult.rows[0].id_public;
		let savedAddress: { idPrivate: number; idPublic: string } | null = null;

		const payload = {
			idPerson: personIdPublic,
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

		try {
			savedAddress = await repository.saveAddress(payload);
			expect(savedAddress).not.toBeNull();

			const checkRes = await client.query<{
				id_person: number;
				name: string;
				system_source: string;
				id_source: string;
				is_default: boolean;
				is_billing_address: boolean;
				value: {
					city: string;
					zip_code: string;
					country: { iso2: string; iso3: string; name: string };
				};
			}>(
				'SELECT id_person, name, system_source, id_source, is_default, is_billing_address, value FROM content.address WHERE id_address = $1',
				[savedAddress?.idPrivate],
			);

			expect(checkRes.rows).toHaveLength(1);
			expect(checkRes.rows[0].id_person).toBe(personIdPrivate);
			expect(checkRes.rows[0].name).toBe(payload.name);
			expect(checkRes.rows[0].system_source).toBe(payload.systemSource);
			expect(checkRes.rows[0].id_source).toBe(payload.idSource);
			expect(checkRes.rows[0].is_default).toBe(true);
			expect(checkRes.rows[0].is_billing_address).toBe(false);
			expect(checkRes.rows[0].value.city).toBe(payload.address.city);
			expect(checkRes.rows[0].value.zip_code).toBe(payload.address.zip_code);
			expect(checkRes.rows[0].value.country.iso2).toBe(
				payload.address.country.iso2,
			);
		} finally {
			if (savedAddress?.idPublic) {
				await client.query('DELETE FROM content.address WHERE id_public = $1', [
					savedAddress.idPublic,
				]);
			}
			await client.query('DELETE FROM content.people WHERE id_person = $1', [
				personIdPrivate,
			]);
		}
	});

	it('should upsert address when systemSource and idSource already exist', async () => {
		const personResult = await client.query<{
			id_person: number;
			id_public: string;
		}>(
			'INSERT INTO content.people (is_organization, reference) VALUES ($1, $2) RETURNING id_person, id_public',
			[true, 'TEST-ADDRESS-REPOSITORY-CONFLICT'],
		);

		const personIdPrivate = personResult.rows[0].id_person;
		const personIdPublic = personResult.rows[0].id_public;
		const uniqueSourceId = `prestashop-conflict-${personIdPublic}`;

		const firstPayload = {
			idPerson: personIdPublic,
			name: 'Headquarters',
			systemSource: 'prestashop',
			idSource: uniqueSourceId,
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

		const secondPayload = {
			...firstPayload,
			name: 'Headquarters Updated',
			address: {
				...firstPayload.address,
				address1: '789 Updated Blvd',
				city: 'Lyon',
				zip_code: '69001',
			},
			isBillingAddress: true,
		};

		try {
			const firstSave = await repository.saveAddress(firstPayload);
			const secondSave = await repository.saveAddress(secondPayload);

			expect(firstSave).not.toBeNull();
			expect(secondSave).not.toBeNull();
			expect(secondSave?.idPrivate).toBe(firstSave?.idPrivate);

			const countRes = await client.query<{ total: string }>(
				'SELECT COUNT(*)::text AS total FROM content.address WHERE system_source = $1 AND id_source = $2',
				[firstPayload.systemSource, firstPayload.idSource],
			);
			expect(countRes.rows[0].total).toBe('1');

			const checkRes = await client.query<{
				name: string;
				is_billing_address: boolean;
				value: {
					address1: string;
					city: string;
					zip_code: string;
				};
			}>(
				'SELECT name, is_billing_address, value FROM content.address WHERE id_address = $1',
				[secondSave?.idPrivate],
			);

			expect(checkRes.rows).toHaveLength(1);
			expect(checkRes.rows[0].name).toBe(secondPayload.name);
			expect(checkRes.rows[0].is_billing_address).toBe(true);
			expect(checkRes.rows[0].value.address1).toBe(
				secondPayload.address.address1,
			);
			expect(checkRes.rows[0].value.city).toBe(secondPayload.address.city);
			expect(checkRes.rows[0].value.zip_code).toBe(
				secondPayload.address.zip_code,
			);
		} finally {
			await client.query('DELETE FROM content.address WHERE id_person = $1', [
				personIdPrivate,
			]);
			await client.query('DELETE FROM content.people WHERE id_person = $1', [
				personIdPrivate,
			]);
		}
	});
});
