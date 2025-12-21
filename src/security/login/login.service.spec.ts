import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_LOGGER } from '../../system/logger/logger-factory/winston-logger.factory';

// Fichiers à tester
import { LoginService } from '../login.service';
import { User } from '../../../users/entities/user.entity';
import { JwtService } from '../jwt/jwt.service';

// Mocks nécessaires
import * as bcrypt from 'bcrypt'; // TypeORM utilise bcrypt par défaut, mais le service utilise 'scrypt' ici.

// Simuler les fonctions crypto (scrypt et timingSafeEqual)
// NOTE : Il est critique de mocker la fonction 'scrypt' si le hachage est dans le service.
jest.mock('crypto', () => ({
	// Simuler le scrypt de manière à retourner une valeur connue pour le test
	scrypt: jest.fn(async (password, salt, keylen) => {
		// Simuler le succès si le mot de passe est 'valid_password'
		if (password === 'valid_password') {
			// Clé dérivée simulée pour le succès
			return Buffer.from('derived_key_match', 'hex');
		}
		// Clé dérivée simulée pour l'échec
		return Buffer.from('derived_key_fail', 'hex');
	}),
	// timingSafeEqual doit être simulé pour comparer les Buffers
	timingSafeEqual: jest.fn((derived, stored) => {
		// Le match est basé sur la simulation scrypt ci-dessus
		return derived.toString('hex') === stored.toString('hex');
	}),
}));

// MOCK des dépendances
const mockUserRepository = {
	// Simuler la requête unique QueryBuilder
	createQueryBuilder: jest.fn(() => ({
		leftJoinAndSelect: jest.fn().mockReturnThis(),
		addSelect: jest.fn().mockReturnThis(),
		where: jest.fn().mockReturnThis(),
		getOne: jest.fn(),
	})),
	// S'assurer qu'un autre cas de figure utilise findOne si jamais
	findOne: jest.fn(),
};

const mockJwtService = {
	createToken: jest.fn(),
};

const mockLogger = {
	error: jest.fn(),
};

describe('LoginService', () => {
	let service: LoginService;
	let userRepository: typeof mockUserRepository;
	let jwtService: typeof mockJwtService;

	// Définitions de données de test
	const VALID_USERNAME = 'testuser';
	const VALID_PASSWORD = 'valid_password';
	const ADMIN_ROLE_ID = 100; // Utilisé dans le UserRole type

	// Simuler l'utilisateur trouvé en base (Doit correspondre à la sortie de QueryBuilder)
	const mockUserInDB: Partial<User> = {
		username: VALID_USERNAME,
		accountActive: true,
		// Ces valeurs doivent correspondre aux Buffers simulés dans le mock de 'crypto'
		password: Buffer.from('derived_key_match', 'hex').toString('hex'),
		salt: 'some_salt',
		role: { id: ADMIN_ROLE_ID, name: 'ADMIN', users: [] } as any, // MOCK du rôle
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LoginService,
				{ provide: getRepositoryToken(User), useValue: mockUserRepository },
				{ provide: JwtService, useValue: mockJwtService },
				{ provide: WINSTON_LOGGER, useValue: mockLogger },
			],
		}).compile();

		service = module.get<LoginService>(LoginService);
		userRepository = module.get(getRepositoryToken(User));
		jwtService = module.get(JwtService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('doit être défini', () => {
		expect(service).toBeDefined();
	});

	// --- SCÉNARIO 1 : SUCCÈS ---
	describe('authenticateUser (Succès)', () => {
		it("devrait retourner le nom d'utilisateur et le rôle si l'authentification réussit", async () => {
			// Arrange
			userRepository
				.createQueryBuilder()
				.getOne.mockResolvedValue(mockUserInDB);

			// Act
			const result = await service.authenticateUser(
				VALID_USERNAME,
				VALID_PASSWORD,
			);

			// Assert
			expect(userRepository.createQueryBuilder().getOne).toHaveBeenCalledTimes(
				1,
			);
			expect(result).toEqual({
				username: VALID_USERNAME,
				role: ADMIN_ROLE_ID,
			});
		});
	});

	// --- SCÉNARIO 2 : ÉCHEC - UTILISATEUR INCONNU ---
	describe('authenticateUser (Échec - Utilisateur Inconnu)', () => {
		it("devrait lever UnauthorizedException si l'utilisateur n'est pas trouvé", async () => {
			// Arrange
			userRepository.createQueryBuilder().getOne.mockResolvedValue(null);

			// Assert
			await expect(
				service.authenticateUser('unknown', VALID_PASSWORD),
			).rejects.toThrow(UnauthorizedException);
			expect(userRepository.createQueryBuilder().getOne).toHaveBeenCalledTimes(
				1,
			);
		});
	});

	// --- SCÉNARIO 3 : ÉCHEC - MOT DE PASSE INCORRECT ---
	describe('authenticateUser (Échec - Mot de passe incorrect)', () => {
		it('devrait lever UnauthorizedException si le mot de passe est incorrect', async () => {
			// Arrange
			userRepository
				.createQueryBuilder()
				.getOne.mockResolvedValue(mockUserInDB);

			// Act & Assert (Le mock de scrypt/timingSafeEqual gérera l'échec pour un mot de passe différent)
			await expect(
				service.authenticateUser(VALID_USERNAME, 'wrong_password'),
			).rejects.toThrow(UnauthorizedException);
		});
	});

	// --- SCÉNARIO 4 : ÉCHEC - COMPTE INACTIF ---
	describe('authenticateUser (Échec - Compte Inactif)', () => {
		it('devrait lever UnauthorizedException si le compte est inactif', async () => {
			// Arrange
			const inactiveUser = { ...mockUserInDB, accountActive: false };
			userRepository
				.createQueryBuilder()
				.getOne.mockResolvedValue(inactiveUser);

			// Assert
			await expect(
				service.authenticateUser(VALID_USERNAME, VALID_PASSWORD),
			).rejects.toThrow(
				'Your account has been disabled. Please contact your webmaster.',
			);
		});
	});

	// --- SCÉNARIO 5 : ÉCHEC - DONNÉES INVALIDE (BadRequestException) ---
	describe('authenticateUser (Échec - Données Invalides)', () => {
		it("devrait lever BadRequestException si le nom d'utilisateur est manquant", async () => {
			// Assert
			await expect(
				service.authenticateUser('', VALID_PASSWORD),
			).rejects.toThrow(BadRequestException);
		});

		it('devrait lever UnauthorizedException si le rôle est invalide', async () => {
			// Arrange
			const invalidRoleUser = {
				...mockUserInDB,
				role: { id: 9999, name: 'INVALID_ROLE' } as any,
			};
			userRepository
				.createQueryBuilder()
				.getOne.mockResolvedValue(invalidRoleUser);

			// Assert
			await expect(
				service.authenticateUser(VALID_USERNAME, VALID_PASSWORD),
			).rejects.toThrow('Rôle utilisateur invalide.');
		});
	});

	// --- SCÉNARIO 6 : GÉNÉRATION DU JETON ---
	describe('generateFinalToken', () => {
		it('devrait générer le jeton JWT avec le bon payload', () => {
			// Arrange
			const tokenMock = 'mocked_jwt_token';
			jwtService.createToken.mockReturnValue({ token: tokenMock });

			// Act
			const result = service.generateFinalToken(VALID_USERNAME, ADMIN_ROLE_ID);

			// Assert
			expect(jwtService.createToken).toHaveBeenCalledWith({
				username: VALID_USERNAME,
				role: ADMIN_ROLE_ID,
			});
			expect(result.jwt_token).toBe(tokenMock);
		});
	});
});
