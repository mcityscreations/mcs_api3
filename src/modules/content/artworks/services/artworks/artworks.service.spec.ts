import { ConfigService } from '@nestjs/config';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ArtworksService } from './artworks.service.js';
import { ArtworksRepository } from '../../repository/artworks.repository.js';
import { CategoriesService } from '../../../taxonomy/categories/categories.service.js';
import { CategoriesRepository } from '../../../taxonomy/categories/categories.repository.js';
import { TechniquesService } from '../../../taxonomy/techniques/techniques.service.js';
import { TechniquesRepository } from '../../../taxonomy/techniques/techniques.repository.js';
import { SubjectService } from '../../../taxonomy/subject/service/subject.service.js';
import { SubjectRepository } from '../../../taxonomy/subject/repository/subject.repository.js';
import { KeywordsService } from '../../../taxonomy/keywords/service/keywords.service.js';
import { KeywordsRepository } from '../../../taxonomy/keywords/repository/keywords.repository.js';
import { LanguagesService } from '../../../taxonomy/languages/languages.service.js';
import { LanguagesRepository } from '../../../taxonomy/languages/languages.repository.js';
import { TransactionManager } from '../../../../../system/database/postgresql/transactions/transaction-manager.service.js';
import { TransactionContext } from '../../../../../system/database/postgresql/transactions/transaction-context.service.js';
import { PGSQLTestService } from '../../../../../system/database/postgresql/test/pgsql-test.spec.js';
import { PostgreSQLService } from '../../../../../system/database/postgresql/postgresql.service.js';

type TaxonomyFixture = {
	categoryId: string;
	techniqueId: string;
	subjectId: string;
	keywordId: string;
	validLanguageId: string;
};

describe('ArtworksService integration', () => {
	const artistId = '019b902e-d7e5-75d5-92a7-8d257c91c375';
	let service: ArtworksService;
	let dbService: PGSQLTestService;
	let fixture: TaxonomyFixture;

	beforeAll(async () => {
		loadEnvFile();
		const configService = new ConfigService();
		const txContext = new TransactionContext();
		dbService = new PGSQLTestService(configService, txContext);
		await dbService.onModuleInit();
		await ensureArtistFixture(dbService, artistId);

		const postgresService = dbService as unknown as PostgreSQLService;
		const categoriesRepository = new CategoriesRepository(postgresService);
		const techniquesRepository = new TechniquesRepository(postgresService);
		const subjectRepository = new SubjectRepository(postgresService);
		const keywordsRepository = new KeywordsRepository(postgresService);
		const languagesRepository = new LanguagesRepository(postgresService);
		const artworksRepository = new ArtworksRepository(postgresService);

		service = new ArtworksService(
			new TransactionManager(postgresService, txContext),
			new CategoriesService(categoriesRepository),
			new TechniquesService(techniquesRepository),
			new SubjectService(subjectRepository),
			artworksRepository,
			new KeywordsService(keywordsRepository),
			new LanguagesService(languagesRepository),
		);
		fixture = await loadFixture(dbService);
	});

	afterAll(async () => {
		await dbService.onModuleDestroy();
	});

	it('should rollback artwork inserts when a language is invalid inside the transaction', async () => {
		const releaseDate = '2099-12-31';
		const invalidLanguageId = '01994f3c-4b17-7a52-b9c6-f9a53c0f1b6e';
		const artworkPayload = {
			idArtist: artistId,
			idCategory: fixture.categoryId,
			idTechnique: fixture.techniqueId,
			idSubject: fixture.subjectId,
			releaseDate,
			dimensions: {
				height: 987,
				width: 876,
				depth: 7,
			},
			title: [
				{
					idLanguage: invalidLanguageId,
					title: 'Rollback probe artwork',
				},
			],
			description: [
				{
					idLanguage: fixture.validLanguageId,
					description: 'This row should never be committed.',
				},
			],
			price: {
				price: 100,
				priceWithFrame: 120,
			},
			keywords: [fixture.keywordId],
		};
		const runtimeArtworkPayload = artworkPayload as unknown as Parameters<
			ArtworksService['addArtwork']
		>[0];

		expect(
			await countMatchingArtworks(
				dbService,
				releaseDate,
				artworkPayload.idArtist,
			),
		).toBe(0);

		await expect(service.addArtwork(runtimeArtworkPayload)).rejects.toThrow(
			'[ Languages Service ] Language not found',
		);

		expect(
			await countMatchingArtworks(
				dbService,
				releaseDate,
				artworkPayload.idArtist,
			),
		).toBe(0);
	});
});

async function loadFixture(
	dbService: PGSQLTestService,
): Promise<TaxonomyFixture> {
	const [category, technique, subject, keyword, language] = await Promise.all([
		dbService.execute<{ id: string }>(
			'SELECT id_public AS id FROM taxonomy.category ORDER BY id_category LIMIT 1',
			[],
			'standard',
			true,
		),
		dbService.execute<{ id: string }>(
			'SELECT id_public AS id FROM taxonomy.technique ORDER BY id_technique LIMIT 1',
			[],
			'standard',
			true,
		),
		dbService.execute<{ id: string }>(
			'SELECT id_public AS id FROM taxonomy.subject ORDER BY id_subject LIMIT 1',
			[],
			'standard',
			true,
		),
		dbService.execute<{ id: string }>(
			'SELECT id_public AS id FROM taxonomy.keyword ORDER BY id_keyword LIMIT 1',
			[],
			'standard',
			true,
		),
		dbService.execute<{ id: string }>(
			'SELECT id_public AS id FROM taxonomy.language ORDER BY id_language LIMIT 1',
			[],
			'standard',
			true,
		),
	]);

	if (
		!category[0] ||
		!technique[0] ||
		!subject[0] ||
		!keyword[0] ||
		!language[0]
	) {
		throw new Error(
			'Missing taxonomy fixtures required for artworks integration tests.',
		);
	}

	return {
		categoryId: category[0].id,
		techniqueId: technique[0].id,
		subjectId: subject[0].id,
		keywordId: keyword[0].id,
		validLanguageId: language[0].id,
	};
}

async function countMatchingArtworks(
	dbService: PGSQLTestService,
	releaseDate: string,
	idArtist: string,
): Promise<number> {
	const result = await dbService.execute<{ total: string }>(
		`SELECT COUNT(*)::text AS total
		 FROM content.artwork
		 WHERE release_date = $1
		   AND id_artist = (
			   SELECT id_person
			   FROM content.artist
			   WHERE id_public = $2
		   )`,
		[releaseDate, idArtist],
		'standard',
		true,
	);

	return Number(result[0]?.total ?? '0');
}

async function ensureArtistFixture(
	dbService: PGSQLTestService,
	artistId: string,
): Promise<void> {
	const existingArtist = await dbService.execute<{ id: string }>(
		'SELECT id_public AS id FROM content.artist WHERE id_public = $1::uuid',
		[artistId],
		'standard',
		true,
	);

	if (existingArtist.length > 0) {
		return;
	}

	await dbService.execute(
		'INSERT INTO content.people (id_public, reference, is_organization) VALUES ($1::uuid, $2, $3)',
		[artistId, 'TEST-ARTIST', false],
		'standard',
		true,
	);
	await dbService.execute(
		'INSERT INTO content.people_individual_detail (id_person, firstname, lastname) SELECT id_person, $2, $3 FROM content.people WHERE id_public = $1::uuid',
		[artistId, 'Test', 'Artist'],
		'standard',
		true,
	);
}

function loadEnvFile(): void {
	const envFilePath = join(process.cwd(), '.env');
	if (!existsSync(envFilePath)) {
		return;
	}

	const rawEnv = readFileSync(envFilePath, 'utf8');
	for (const line of rawEnv.split(/\r?\n/u)) {
		const trimmedLine = line.trim();
		if (!trimmedLine || trimmedLine.startsWith('#')) {
			continue;
		}

		const separatorIndex = trimmedLine.indexOf('=');
		if (separatorIndex < 0) {
			continue;
		}

		const key = trimmedLine.slice(0, separatorIndex).trim();
		const value = trimmedLine.slice(separatorIndex + 1).trim();
		if (!(key in process.env)) {
			process.env[key] = value.replace(/^['"]|['"]$/gu, '');
		}
	}
}
