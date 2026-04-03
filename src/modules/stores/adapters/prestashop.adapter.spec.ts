import { Test, TestingModule } from '@nestjs/testing';
import { PrestashopAdapter } from './prestashop.adapter.js';

describe('PrestashopAdapter', () => {
  let service: PrestashopAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrestashopAdapter],
    }).compile();

    service = module.get<PrestashopAdapter>(PrestashopAdapter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
