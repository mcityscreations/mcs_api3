// src/system/logger/logger-service/winston-logger.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonLoggerService } from './winston-logger.service';
// Assurez-vous d'ajuster ce chemin d'importation si nécessaire
import { WINSTON_LOGGER } from '../logger-factory/winston-logger.factory';
import { AlsService } from '../../als/als.service';
import { Logger } from 'winston';

// --- 1. Mocks de Données et de Dépendances ---

const TEST_MESSAGE = 'Test message for the log';
const TEST_CONTEXT = 'TestContextModule';
const TEST_CORRELATION_ID = '1234-5678-90ab';
const TEST_TRACE = 'Error stack trace details';

// Mock du Winston Logger (Toutes les méthodes de log sont des espions Jest)
const mockWinstonLogger: Partial<Logger> = {
	info: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
	debug: jest.fn(),
	verbose: jest.fn(),
};

// Mock du AlsService (Contrôle de l'ID de corrélation)
const mockAlsService = {
	getCorrelationId: jest.fn(),
};

describe('WinstonLoggerService', () => {
	let service: WinstonLoggerService;

	beforeEach(async () => {
		// Réinitialiser les espions avant chaque test
		jest.clearAllMocks();

		// Par défaut, simuler qu'il n'y a pas d'ID de corrélation
		mockAlsService.getCorrelationId.mockReturnValue(undefined);

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				WinstonLoggerService,
				// SOLUTION pour l'injection par jeton: fournir le mock Winston sous son jeton
				{
					provide: WINSTON_LOGGER,
					useValue: mockWinstonLogger,
				},
				// Fournir le Mock pour AlsService
				{
					provide: AlsService,
					useValue: mockAlsService,
				},
			],
		}).compile();

		service = module.get<WinstonLoggerService>(WinstonLoggerService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	// --- Tests de la méthode log (Niveau 'info') ---

	describe('log', () => {
		it('should call logger.info with message and context (no Correlation ID)', () => {
			service.log(TEST_MESSAGE, TEST_CONTEXT);

			// 1. Vérifie l'appel à AlsService
			expect(mockAlsService.getCorrelationId).toHaveBeenCalledTimes(1);

			// 2. Vérifie l'appel au logger Winston
			expect(mockWinstonLogger.info).toHaveBeenCalledWith(
				TEST_MESSAGE,
				{ context: TEST_CONTEXT }, // Métadonnées sans correlationId
			);
		});

		it('should include Correlation ID in metadata when available', () => {
			// Configurer le mock pour retourner l'ID
			mockAlsService.getCorrelationId.mockReturnValue(TEST_CORRELATION_ID);

			service.log(TEST_MESSAGE, TEST_CONTEXT);

			expect(mockWinstonLogger.info).toHaveBeenCalledWith(
				TEST_MESSAGE,
				{ context: TEST_CONTEXT, correlationId: TEST_CORRELATION_ID }, // Métadonnées enrichies
			);
		});

		it('should correctly handle object metadata and include Correlation ID', () => {
			// Teste la logique de `getEnhancedMeta` avec un objet au lieu d'une chaîne
			mockAlsService.getCorrelationId.mockReturnValue(TEST_CORRELATION_ID);
			const extraMeta = { component: 'ServiceX' };

			service.log(TEST_MESSAGE, extraMeta);

			expect(mockWinstonLogger.info).toHaveBeenCalledWith(
				TEST_MESSAGE,
				{ ...extraMeta, correlationId: TEST_CORRELATION_ID }, // Fusion des métadonnées
			);
		});
	});

	// --- Tests de la méthode error (Niveau 'error') ---

	describe('error', () => {
		it('should call logger.error and include trace, context, and correlationId', () => {
			mockAlsService.getCorrelationId.mockReturnValue(TEST_CORRELATION_ID);

			service.error(TEST_MESSAGE, TEST_TRACE, TEST_CONTEXT);

			expect(mockWinstonLogger.error).toHaveBeenCalledWith(TEST_MESSAGE, {
				context: TEST_CONTEXT,
				trace: TEST_TRACE,
				correlationId: TEST_CORRELATION_ID,
			});
		});
	});

	// --- Tests de la méthode warn (Niveau 'warn') ---

	describe('warn', () => {
		it('should call logger.warn with message and enriched metadata', () => {
			mockAlsService.getCorrelationId.mockReturnValue(TEST_CORRELATION_ID);

			service.warn(TEST_MESSAGE, TEST_CONTEXT);

			expect(mockWinstonLogger.warn).toHaveBeenCalledWith(TEST_MESSAGE, {
				context: TEST_CONTEXT,
				correlationId: TEST_CORRELATION_ID,
			});
		});
	});

	// Vous pouvez ajouter ici les tests pour debug et verbose si vous les utilisez
});
