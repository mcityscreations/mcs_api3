import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
	let guard: RolesGuard;
	let reflector: Reflector;

	// Configuration du module de test avant chaque test
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RolesGuard,
				// Fournir une instance "mock" du Reflector, car c'est une dépendance
				{
					provide: Reflector,
					useValue: {
						// Nous moquons la méthode 'get' pour retourner les rôles requis par la route
						get: jest.fn(),
					},
				},
			],
		}).compile();

		guard = module.get<RolesGuard>(RolesGuard);
		reflector = module.get<Reflector>(Reflector);
	});

	// --- Test 1 : Le Guard est défini (Initialisation réussie) ---
	it('should be defined', () => {
		expect(guard).toBeDefined();
	});

	// --- Test 2 : Accès accordé si l'utilisateur a le bon rôle ---
	it('should allow access if user has the required role', () => {
		// 1. Définir le rôle requis sur la route (moqué via le Reflector)
		jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

		// 2. Créer un contexte d'exécution mocké avec un utilisateur (payload)
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({
					user: {
						username: 'testuser',
						privilege: 'ADMIN', // L'utilisateur est ADMIN
					},
				}),
			}),
			getHandler: jest.fn(),
		} as unknown as ExecutionContext; // Assertion pour TypeScript

		// 3. Exécuter le Guard
		expect(guard.canActivate(mockContext)).toBe(true);
	});

	// --- Test 3 : Accès refusé si l'utilisateur n'a pas le bon rôle ---
	it('should deny access if user does NOT have the required role', () => {
		// Rôle requis : ADMIN
		jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

		// Contexte avec un utilisateur ayant le rôle CLIENT
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({
					user: {
						username: 'testclient',
						privilege: 'ADMIN', // L'utilisateur est CLIENT
					},
				}),
			}),
			getHandler: jest.fn(),
		} as unknown as ExecutionContext;

		// Le Guard doit retourner false
		expect(guard.canActivate(mockContext)).toBe(false);
	});
});
