import { Test, TestingModule } from '@nestjs/testing';
import { StoresRepository } from './stores.repository.js';

describe('StoresRepository', () => {
  let service: StoresRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoresRepository],
    }).compile();

    service = module.get<StoresRepository>(StoresRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
