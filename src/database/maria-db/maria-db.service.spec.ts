// src/database/maria-db/maria-db.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MariaDBService } from './maria-db.service';
import { Logger } from 'winston';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import * as mariadb from 'mariadb'; // Import du module réel pour le typage

// --------------------------------------------------------------------------
// I. Mocks Globaux
// --------------------------------------------------------------------------

// 1. Mock du Logger
const mockWinstonLogger = {
	info: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
} as unknown as Logger;

// 2. Mocks des Configurations (Factories de Valeurs)
const MOCK_DB_CONFIG = {
	host: 'localhost',
	user: 'test',
	password: 'password',
	database: 'test_db',
	port: 3306,
};

// --------------------------------------------------------------------------
// II. Mocks de Mariadb (le plus crucial)
// --------------------------------------------------------------------------

// 1. Mock d'une PoolConnection (simule une connexion active)
const mockConnection = {
	release: jest.fn(async () => {}), // Connexion release
	query: jest.fn(), // Méthode pour l'exécution SQL
	beginTransaction: jest.fn(async () => {}), // Début de transaction
	commit: jest.fn(async () => {}), // Commit de transaction
	rollback: jest.fn(async () => {}), // Rollback
	// Ajoutez d'autres méthodes de PoolConnection si nécessaire
} as unknown as mariadb.PoolConnection;

// 2. Mock d'une Pool (simule le pool de connexions)
const mockPool = {
	getConnection: jest.fn(() => mockConnection), // Retourne la connexion mockée
} as unknown as mariadb.Pool;

// 3. Mock du module 'mariadb'
// C'est ce qui permet de remplacer mariadb.createPool() par une fonction qui retourne notre mockPool.
jest.mock('mariadb', () => {
	// 1. Charger le module réel pour accéder aux autres exports non mockés
	const actualMariaDb = jest.requireActual<typeof mariadb>('mariadb');

	// 2. Retourner l'objet mocké
	return {
		...actualMariaDb,
		// Écraser la fonction createPool avec notre mock
		createPool: jest.fn(() => mockPool),
	} as typeof mariadb; // <-- ASSERTER LE TYPE FINAL DU MOCK
});

// Constantes pour les tests (pour éviter les NotFoundException)
const MOCK_SQL_RESULT = [{ id: 1, data: 'test' }];

// --------------------------------------------------------------------------
// III. Définition du Test Module
// --------------------------------------------------------------------------

describe('MariaDBService', () => {
	let service: MariaDBService;

	beforeEach(async () => {
		// Réinitialiser les mocks avant chaque test
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MariaDBService,
				// --- Injection des Factories de Valeurs (Config) ---
				{
					provide: 'STANDARD_DB_CONFIG',
					useValue: MOCK_DB_CONFIG,
				},
				{
					provide: 'OAUTH_DB_CONFIG',
					useValue: MOCK_DB_CONFIG, // Utiliser la même config pour la simplicité
				},
				// --- Injection de la Factory du Logger ---
				{
					provide: 'WINSTON_LOGGER', // Assurez-vous que c'est bien la clé d'injection
					useValue: mockWinstonLogger,
				},
			],
		}).compile();

		service = module.get<MariaDBService>(MariaDBService);
	});

	// --------------------------------------------------------------------------
	// IV. Tests
	// --------------------------------------------------------------------------

	it('should be defined and call createPool twice', () => {
		// Le service est créé dans le beforeEach.
		// On vérifie que le constructeur a appelé mariadb.createPool pour les deux pools.
		expect(service).toBeDefined();
		expect(mariadb.createPool).toHaveBeenCalledTimes(2);
		// On vérifie que le logger a confirmé l'initialisation
		expect(mockWinstonLogger.info).toHaveBeenCalledWith(
			'MariaDBService initialized with 2 pools.',
		);
	});

	describe('onModuleInit (Connection Tests)', () => {
		// Le test simule le onModuleInit qui essaie d'établir une connexion.
		it('should test connections and log success', async () => {
			// Dans ce scénario, mockPool.getConnection (qui retourne mockConnection) réussit.
			await service.onModuleInit();

			// OnModuleInit appelle testConnection 2 fois, chacune appelle getConnection 1 fois.
			/* eslint-disable @typescript-eslint/unbound-method */
			expect(mockPool.getConnection).toHaveBeenCalledTimes(2);
			// On vérifie que les connexions ont été relâchées après le test.
			expect(mockConnection.release).toHaveBeenCalledTimes(2);
			// On vérifie les logs
			expect(mockWinstonLogger.info).toHaveBeenCalledWith(
				'Pool Standard connected.',
			);
			expect(mockWinstonLogger.info).toHaveBeenCalledWith(
				'Pool OAuth connected.',
			);
		});

		it('should log an error if connection fails', async () => {
			// Simuler l'échec de la connexion pour le premier pool (Standard)
			(mockPool.getConnection as jest.Mock).mockRejectedValueOnce(
				new Error('Connection failed'),
			);

			await service.onModuleInit();

			// L'erreur doit être loguée
			expect(mockWinstonLogger.error).toHaveBeenCalledWith(
				'Pool Standard connection ERROR: Connection failed',
			);
			// La seconde connexion doit quand même être tentée et réussir (OAuth)
			expect(mockWinstonLogger.info).toHaveBeenCalledWith(
				'Pool OAuth connected.',
			);
			// On vérifie que release a été appelée une seule fois (pour la connexion réussie)
			expect(mockConnection.release).toHaveBeenCalledTimes(1);
		});
	});

	describe('execute (Main Query Method)', () => {
		it('should execute a query and return results (standard pool)', async () => {
			// Simuler le résultat de la requête SQL
			(mockConnection.query as jest.Mock).mockResolvedValueOnce(
				MOCK_SQL_RESULT,
			);
			const getPoolSpy = jest.spyOn(service as any, 'getPool');
			const result = await service.execute(
				'SELECT * FROM users',
				[],
				'standard',
			);
			// Vérifier le résultat retourné
			expect(result).toEqual(MOCK_SQL_RESULT);
			// Vérifier que getPool a été appelé correctement
			expect(getPoolSpy).toHaveBeenCalledWith('standard');
			// Vérifier que getConnection a été appelé sur la pool
			expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
			// Vérifier que query a été appelé sur la connexion
			expect(mockConnection.query).toHaveBeenCalledWith(
				'SELECT * FROM users',
				[],
			);
			// Vérifier que la connexion a été relâchée
			expect(mockConnection.release).toHaveBeenCalledTimes(1);
			// Optionnel : Restaurer le mock pour éviter les interférences
			getPoolSpy.mockRestore();
		});

		it('should throw NotFoundException if result is empty and isEmptyResultAllowed is false', async () => {
			// Simuler un résultat vide de la requête SQL
			(mockConnection.query as jest.Mock).mockResolvedValueOnce([]);

			await expect(
				service.execute('SELECT * FROM users', [], 'standard', false),
			).rejects.toThrow(NotFoundException);

			expect(mockConnection.release).toHaveBeenCalledTimes(1);
		});

		it('should throw ServiceUnavailableException on ER_TOO_MANY_USER_CONNECTIONS', async () => {
			// MariaDbError doit être mocké
			const mockDbError = {
				code: 'ER_TOO_MANY_USER_CONNECTIONS',
				errno: 1040,
				sqlState: '42000',
				message: 'Too many connections',
			};
			(mockConnection.query as jest.Mock).mockRejectedValueOnce(mockDbError);

			await expect(service.execute('SELECT * FROM test')).rejects.toThrow(
				ServiceUnavailableException,
			);

			expect(mockWinstonLogger.error).toHaveBeenCalledWith(
				'Database connection limit reached:',
				mockDbError,
			);
			expect(mockConnection.release).toHaveBeenCalledTimes(1);
		});

		// ... (Ajouter des tests pour les transactions, l'accès refusé, et les exceptions 500)
	});

	describe('Transactions', () => {
		it('beginTransaction should return a connection and call beginTransaction on it', async () => {
			const conn = await service.beginTransaction('oauth');

			// On vérifie qu'une connexion a été établie depuis le pool
			expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
			// On vérifie que beginTransaction a été appelé sur cette connexion
			expect(conn.beginTransaction).toHaveBeenCalledTimes(1);
		});

		it('commit should call commit and release the connection', async () => {
			await service.commit(mockConnection);

			expect(mockConnection.commit).toHaveBeenCalledTimes(1);
			expect(mockConnection.release).toHaveBeenCalledTimes(1);
		});

		// ... (Ajouter des tests pour rollback et les échecs)
	});
});
