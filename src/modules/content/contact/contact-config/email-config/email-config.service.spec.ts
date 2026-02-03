// src/contact/contact-config/email-config/email-config.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
	EmailConfigService,
	IEmailAccountConfig,
} from './email-config.service.js';
import { InternalServerErrorException } from '@nestjs/common';

type EmailContactMode = 'noreply' | 'newsletter' | 'support';

// --- Mocks de Données ---

// Configuration de base pour simuler des variables d'environnement réussies
const mockCommonConfig = {
	host: 'custom.host.com',
	port: 587,
	secure: true,
};

// Mocks d'identifiants spécifiques pour chaque mode
const mockCredentials = {
	noreply: { user: 'noreply_user', pass: 'noreply_pass' },
	newsletter: { user: 'newsletter_user', pass: 'newsletter_pass' },
	support: { user: 'support_user', pass: 'support_pass' },
};

// Helper pour créer une configuration attendue complète
const createExpectedConfig = (
	mode: EmailContactMode,
	config: typeof mockCommonConfig = mockCommonConfig,
): IEmailAccountConfig => ({
	host: config.host,
	port: config.port,
	secure: config.secure,
	auth: mockCredentials[mode],
});

// Mock de la méthode get de ConfigService
const mockConfigService = {
	get: jest.fn(),
};

// --- Logique du Test ---

describe('EmailConfigService', () => {
	let service: EmailConfigService;
	let configService: ConfigService;

	// Fonction pour simuler la configuration complète et réussie
	const setupSuccessfulMocks = () => {
		mockConfigService.get.mockImplementation(
			<T>(key: string, defaultValue?: T): T | string | number | undefined => {
				// Configuration Commune
				switch (key) {
					case 'COMMON_EMAIL_HOST':
						return mockCommonConfig.host; // string
					case 'COMMON_EMAIL_PORT':
						return mockCommonConfig.port; // number
					case 'COMMON_EMAIL_SECURE':
						return mockCommonConfig.secure ? 'true' : 'false'; // string
				}

				// Configuration Spécifique au Mode (Identifiants)
				if (key.endsWith('_EMAIL_USER')) {
					const mode = key.split('_')[0].toLowerCase() as EmailContactMode;
					return mockCredentials[mode].user; // string
				}
				if (key.endsWith('_EMAIL_PASS')) {
					const mode = key.split('_')[0].toLowerCase() as EmailContactMode;
					return mockCredentials[mode].pass; // string
				}

				// Retourne la valeur par défaut si présente
				// Sinon, retourne undefined (le comportement par défaut de get() sans valeur de configuration)
				if (defaultValue !== undefined) {
					return defaultValue; // Ici, TypeScript sait que defaultValue est de type T
				}
				return undefined; // ou simplement return;
			},
		);
	};

	beforeEach(async () => {
		jest.clearAllMocks(); // Réinitialiser tous les mocks
		setupSuccessfulMocks(); // Configurer pour une instanciation réussie

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				EmailConfigService,
				{ provide: ConfigService, useValue: mockConfigService },
			],
		}).compile();

		service = module.get<EmailConfigService>(EmailConfigService);
		configService = module.get<ConfigService>(ConfigService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('getAccountConfig', () => {
		const modes: EmailContactMode[] = ['noreply', 'newsletter', 'support'];

		it.each(modes)(
			'should successfully load configuration for mode: %s',
			(mode) => {
				const expectedConfig = createExpectedConfig(mode);
				const config = service.getAccountConfig(mode);

				expect(config).toEqual(expectedConfig);
			},
		);

		it('should correctly handle default common values (host, port, secure)', () => {
			// Configurer le mock pour retourner des valeurs par défaut/manquantes pour les paramètres communs
			mockConfigService.get.mockImplementation(
				<T>(key: string, defaultValue?: T): T | string | undefined => {
					//                                     ^-- Typage explicite ici

					// Les identifiants doivent toujours être présents pour ne pas throw une erreur ici
					if (key === 'NOREPLY_EMAIL_USER') return mockCredentials.noreply.user;
					if (key === 'NOREPLY_EMAIL_PASS') return mockCredentials.noreply.pass;

					// Forcer l'utilisation des valeurs par défaut pour host/port/secure
					if (key === 'COMMON_EMAIL_HOST') return undefined; // Host par défaut
					if (key === 'COMMON_EMAIL_PORT') return defaultValue; // Port par défaut (465)
					if (key === 'COMMON_EMAIL_SECURE') return 'false'; // Secure par défaut (false si non 'true')

					// S'assurer que le retour correspond à un type possible
					if (defaultValue !== undefined) {
						return defaultValue;
					}
					return undefined;
				},
			);

			// Re-instancier pour recharger la configuration avec les nouveaux mocks
			const serviceWithDefaults = new EmailConfigService(configService);

			const config = serviceWithDefaults.getAccountConfig('noreply');

			expect(config.host).toBe('mail.mcitys.com'); // Valeur par défaut
			expect(config.port).toBe(465); // Valeur par défaut
			expect(config.secure).toBe(false); // Faux car la variable est 'false'
		});

		it('should throw InternalServerErrorException if user is missing for a mode', () => {
			const mode: EmailContactMode = 'newsletter';

			// Simuler la configuration où seul le USER est manquant
			mockConfigService.get.mockImplementation((key: string) => {
				if (key === 'NEWSLETTER_EMAIL_USER') return undefined; // Manquant
				if (key === 'NEWSLETTER_EMAIL_PASS')
					return mockCredentials.newsletter.pass; // Présent

				// Assurer que le provider commun est bon
				if (key === 'COMMON_EMAIL_HOST') return mockCommonConfig.host;
				return undefined;
			});

			// Doit lever l'exception
			expect(() => service.getAccountConfig(mode)).toThrow(
				InternalServerErrorException,
			);
			expect(() => service.getAccountConfig(mode)).toThrow(
				'Missing credentials for email mode: newsletter (NEWSLETTER_EMAIL_USER/NEWSLETTER_EMAIL_PASS).',
			);
		});

		it('should throw InternalServerErrorException if pass is missing for a mode', () => {
			const mode: EmailContactMode = 'support';

			// Simuler la configuration où seul le PASS est manquant
			mockConfigService.get.mockImplementation((key: string) => {
				if (key === 'SUPPORT_EMAIL_USER') return mockCredentials.support.user; // Présent
				if (key === 'SUPPORT_EMAIL_PASS') return undefined; // Manquant

				// Assurer que le provider commun est bon
				if (key === 'COMMON_EMAIL_HOST') return mockCommonConfig.host;
				return undefined;
			});

			// Doit lever l'exception
			expect(() => service.getAccountConfig(mode)).toThrow(
				InternalServerErrorException,
			);
			expect(() => service.getAccountConfig(mode)).toThrow(
				'Missing credentials for email mode: support (SUPPORT_EMAIL_USER/SUPPORT_EMAIL_PASS).',
			);
		});

		it('should cache the result and avoid calling ConfigService again', () => {
			const mode: EmailContactMode = 'noreply';

			// 1. Premier appel : force le chargement et le caching
			service.getAccountConfig(mode);

			// Récupérer le nombre initial d'appels à configService.get()
			const initialCallCount = mockConfigService.get.mock.calls.length;

			// 2. Deuxième appel : devrait utiliser le cache
			service.getAccountConfig(mode);

			// Le nombre d'appels NE DOIT PAS avoir changé
			const subsequentCallCount = mockConfigService.get.mock.calls.length;

			expect(subsequentCallCount).toBe(initialCallCount);

			// Si la configuration est chargée une fois de plus, le test échouera
			/* eslint-disable @typescript-eslint/unbound-method */
			expect(configService.get).not.toHaveBeenCalledTimes(initialCallCount + 1);
		});

		it('should load configuration correctly even after a previous failed load attempt for a different mode', () => {
			// Ce test assure qu'un échec de chargement pour 'newsletter'
			// n'empêche pas un chargement réussi pour 'noreply'

			// Mock pour faire échouer le mode 'newsletter' (manque le pass)
			mockConfigService.get.mockImplementation((key: string) => {
				if (key === 'NEWSLETTER_EMAIL_PASS') return undefined;

				// S'assurer que le mode 'noreply' fonctionne (utilisé par le service ci-dessous)
				if (key === 'NOREPLY_EMAIL_USER') return mockCredentials.noreply.user;
				if (key === 'NOREPLY_EMAIL_PASS') return mockCredentials.noreply.pass;

				// Assurer les configurations communes pour la tentative de chargement
				if (key === 'COMMON_EMAIL_HOST') return mockCommonConfig.host;
				if (key === 'COMMON_EMAIL_PORT') return mockCommonConfig.port;
				if (key === 'COMMON_EMAIL_SECURE')
					return mockCommonConfig.secure ? 'true' : 'false';

				return undefined;
			});

			// 1. Tenter le chargement qui échoue (newsletter)
			expect(() => service.getAccountConfig('newsletter')).toThrow(
				InternalServerErrorException,
			);

			// 2. Tenter le chargement réussi (noreply)
			expect(() => service.getAccountConfig('noreply')).not.toThrow();
			const config = service.getAccountConfig('noreply');

			expect(config.auth.user).toBe(mockCredentials.noreply.user);
			// La configuration échouée n'a pas été mise en cache pour 'newsletter'
			// et n'a pas affecté la configuration réussie de 'noreply'.
		});
	});
});
