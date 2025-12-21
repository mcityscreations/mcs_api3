import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import {
	IRecaptchaConfig,
	RecaptchaConfigService,
} from './recaptcha-config.service';

// --- 1. Mocks de Données et de Dépendances ---

// Configuration de mock pour un scénario réussi
const mockRecaptchaConfig: IRecaptchaConfig = {
	projectId: 'mock-project-id',
	recaptchaSiteKey: 'mock-recaptcha-key',
	googleApplicationCredentials: '/path/to/mock/credentials.json',
};

// Mock du ConfigService : La dépendance que nous devons simuler
const mockConfigService = {
	get: jest.fn(), // La méthode 'get' est l'espion Jest
};

// --- 2. Fonction d'aide pour configurer le Mock de succès ---
const setupSuccessfulMocks = () => {
	// Simuler le comportement réussi de ConfigService.get
	mockConfigService.get.mockImplementation((key: string) => {
		switch (key) {
			case 'RECAPTCHA_PROJECT_ID':
				return mockRecaptchaConfig.projectId;
			case 'RECAPTCHA_KEY':
				return mockRecaptchaConfig.recaptchaSiteKey;
			case 'GOOGLE_APPLICATION_CREDENTIALS':
				return mockRecaptchaConfig.googleApplicationCredentials;
			default:
				return undefined;
		}
	});
};

// --- 3. Début de la Suite de Tests ---

describe('RecaptchaConfigService', () => {
	let service: RecaptchaConfigService;

	beforeEach(async () => {
		// Réinitialiser les mocks avant chaque test
		mockConfigService.get.mockClear();
		setupSuccessfulMocks(); // Assure que le service peut être instancié au départ

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RecaptchaConfigService,
				// SOLUTION AU PROBLÈME DE DÉPENDANCE : Fournir le mock pour ConfigService
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
			],
		}).compile();

		service = module.get<RecaptchaConfigService>(RecaptchaConfigService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	// --- Test de Succès ---

	it('should return the correct configuration when all keys are present', () => {
		const config = service.getRecaptchaConfig();

		// 1. Vérifie la valeur retournée
		expect(config).toEqual(mockRecaptchaConfig);

		// 2. Vérifie que le ConfigService a été appelé avec toutes les clés
		// AVANT : expect(getConfig).toHaveBeenCalledWith(...)
		// MAINTENANT : Utiliser le mock original défini en haut du fichier.
		expect(mockConfigService.get).toHaveBeenCalledWith('RECAPTCHA_PROJECT_ID');
		expect(mockConfigService.get).toHaveBeenCalledWith('RECAPTCHA_KEY');
		expect(mockConfigService.get).toHaveBeenCalledWith(
			'GOOGLE_APPLICATION_CREDENTIALS',
		);
		expect(mockConfigService.get).toHaveBeenCalledTimes(3);
	});

	// --- Tests d'Erreur (Tests Paramétrés pour la Clarté) ---

	// Le tableau contient : [ clé manquante, message d'erreur attendu ]
	it.each([
		[
			'RECAPTCHA_PROJECT_ID',
			'RECAPTCHA_PROJECT_ID is not defined in environment variables.',
		],
		['RECAPTCHA_KEY', 'RECAPTCHA_KEY is not defined in environment variables.'],
		[
			'GOOGLE_APPLICATION_CREDENTIALS',
			'GOOGLE_APPLICATION_CREDENTIALS is not defined in environment variables.',
		],
	])(
		'should throw InternalServerErrorException if %s is missing',
		(missingKey, expectedErrorMessage) => {
			// Configurer le mock pour simuler le manquement de la clé actuelle du test
			mockConfigService.get.mockImplementation((key: string) => {
				if (key === missingKey) return undefined; // La clé est manquante ou vide
				// Retourner des valeurs valides pour les autres clés
				return 'some-valid-value';
			});

			// Vérifier que la méthode lève l'exception attendue
			expect(() => service.getRecaptchaConfig()).toThrow(
				InternalServerErrorException,
			);
			expect(() => service.getRecaptchaConfig()).toThrow(expectedErrorMessage);
		},
	);
});
