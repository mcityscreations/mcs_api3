import { Test, TestingModule } from '@nestjs/testing';
import { SubjectRepository } from './subject.repository.js';

describe('SubjectRepository', () => {
	let service: SubjectRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [SubjectRepository],
		}).compile();

		service = module.get<SubjectRepository>(SubjectRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
