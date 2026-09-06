import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { PeopleController } from './people.controller.js';
import { PeopleService } from './people.service.js';

describe('PeopleController', () => {
	let controller: PeopleController;
	let service: PeopleService;
	const mockPeopleService = {
		findOne: jest.fn(),
		getMcitysID: jest.fn(),
		addIndividual: jest.fn(),
		addOrganization: jest.fn(),
		addPersonToMapper: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PeopleController],
			providers: [
				{
					provide: PeopleService,
					useValue: mockPeopleService,
				},
			],
		}).compile();

		controller = module.get<PeopleController>(PeopleController);
		service = module.get<PeopleService>(PeopleService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
		expect(service).toBeDefined();
	});
});
