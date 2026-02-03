// src/contact/contact-config/sms-config/sms-config.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SmsConfigService, IOvhConfig } from './sms-config.service.js';
import { InternalServerErrorException } from '@nestjs/common';

// Configuration factice pour les tests réussis
const mockOvhConfig: IOvhConfig = {
	provider: 'OVH',
	appID: 'mockAppID',
	appSecret: 'mockAppSecret',
	consumerKey: 'mockConsumerKey',
};

// Mock de la méthode get de ConfigService pour simuler la lecture des variables d'environnement
const mockConfigService = {
	get: jest.fn(),
};

describe('SmsConfigService', () => {
	let service: SmsConfigService;
	let configService: ConfigService;

	// Définir une configuration de base pour un test réussi
	const setupSuccessfulMocks = () => {
		mockConfigService.get.mockImplementation((key: string) => {
			switch (key) {
				case 'SMS_PROVIDER':
					return 'OVH';
				case 'OVH_APPLICATION_KEY':
					return mockOvhConfig.appID;
				case 'OVH_APPLICATION_SECRET':
					return mockOvhConfig.appSecret;
				case 'OVH_CONSUMER_KEY':
					return mockOvhConfig.consumerKey;
				default:
					return undefined;
			}
		});
	};

	// Configuration du module de test avant chaque test
	beforeEach(async () => {
		// Réinitialiser les mocks avant chaque test
		mockConfigService.get.mockClear();
		setupSuccessfulMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SmsConfigService,
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
			],
		}).compile();

		// On appelle `setupSuccessfulMocks()` ici pour s'assurer que le service peut être instancié
		// correctement lors de `module.get(SmsConfigService)` (le constructeur est appelé)

		service = module.get<SmsConfigService>(SmsConfigService);
		configService = module.get<ConfigService>(ConfigService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('getOvhConfig', () => {
		it('should return the correct OVH configuration on successful load', () => {
			// Le service a été instancié avec succès dans le beforeEach
			// On vérifie que la configuration chargée est celle attendue
			const config = service.getOvhConfig();
			expect(config).toEqual(mockOvhConfig);

			// Vérifier que ConfigService.get a été appelé pour toutes les clés
			/* eslint-disable @typescript-eslint/unbound-method */
			expect(configService.get).toHaveBeenCalledWith('SMS_PROVIDER');
			expect(configService.get).toHaveBeenCalledWith('OVH_APPLICATION_KEY');
			expect(configService.get).toHaveBeenCalledWith('OVH_APPLICATION_SECRET');
			expect(configService.get).toHaveBeenCalledWith('OVH_CONSUMER_KEY');
		});
	});

	describe('Initialization (Constructor/loadConfig)', () => {
		it('should throw InternalServerErrorException if SMS_PROVIDER is missing', async () => {
			// Configuration pour le test: SMS_PROVIDER retourne undefined
			mockConfigService.get.mockImplementation((key: string) => {
				if (key === 'SMS_PROVIDER') return undefined;
				// Simuler les autres valeurs si elles étaient vérifiées
				return 'someValue';
			});

			// On s'attend à ce que l'instanciation échoue
			await expect(
				Test.createTestingModule({
					providers: [
						SmsConfigService,
						{ provide: ConfigService, useValue: mockConfigService },
					],
				}).compile(),
			).rejects.toThrow(InternalServerErrorException);

			// Vérifier le message d'erreur si vous voulez être plus spécifique
			await expect(
				Test.createTestingModule({
					providers: [
						SmsConfigService,
						{ provide: ConfigService, useValue: mockConfigService },
					],
				}).compile(),
			).rejects.toThrow('SMS provider missing or not supported: undefined.');
		});

		it('should throw InternalServerErrorException if SMS_PROVIDER is not OVH', async () => {
			// Configuration pour le test: SMS_PROVIDER retourne une autre valeur
			mockConfigService.get.mockReturnValue('OTHER_PROVIDER'); // Pour toutes les clés

			// On s'attend à ce que l'instanciation échoue
			await expect(
				Test.createTestingModule({
					providers: [
						SmsConfigService,
						{ provide: ConfigService, useValue: mockConfigService },
					],
				}).compile(),
			).rejects.toThrow(InternalServerErrorException);

			// Vérifier le message d'erreur
			await expect(
				Test.createTestingModule({
					providers: [
						SmsConfigService,
						{ provide: ConfigService, useValue: mockConfigService },
					],
				}).compile(),
			).rejects.toThrow(
				'SMS provider missing or not supported: OTHER_PROVIDER.',
			);
		});

		// Test pour vérifier si une des clés OVH est manquante
		it.each([
			['OVH_APPLICATION_KEY', 'appID'],
			['OVH_APPLICATION_SECRET', 'appSecret'],
			['OVH_CONSUMER_KEY', 'consumerKey'],
		])(
			'should throw InternalServerErrorException if %s is missing',
			async (missingKey) => {
				// Configuration pour le test: simuler le manquement d'une clé spécifique
				mockConfigService.get.mockImplementation((key: string) => {
					if (key === 'SMS_PROVIDER') return 'OVH';
					if (key === missingKey) return undefined;
					// Retourner des valeurs valides pour les autres
					if (key === 'OVH_APPLICATION_KEY') return mockOvhConfig.appID;
					if (key === 'OVH_APPLICATION_SECRET') return mockOvhConfig.appSecret;
					if (key === 'OVH_CONSUMER_KEY') return mockOvhConfig.consumerKey;
					return undefined;
				});

				// On s'attend à ce que l'instanciation échoue
				await expect(
					Test.createTestingModule({
						providers: [
							SmsConfigService,
							{ provide: ConfigService, useValue: mockConfigService },
						],
					}).compile(),
				).rejects.toThrow(InternalServerErrorException);

				// Vérifier le message d'erreur générique pour les clés OVH manquantes
				await expect(
					Test.createTestingModule({
						providers: [
							SmsConfigService,
							{ provide: ConfigService, useValue: mockConfigService },
						],
					}).compile(),
				).rejects.toThrow('OVH API keys are missing (KEY/SECRET/CONSUMER).');
			},
		);
	});
});
