import { Test, TestingModule } from '@nestjs/testing';
import { PrestashopConfigService } from './prestashop.config.js';

describe('PrestashopConfigService', () => {
  let service: PrestashopConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrestashopConfigService],
    }).compile();

    service = module.get<PrestashopConfigService>(PrestashopConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
