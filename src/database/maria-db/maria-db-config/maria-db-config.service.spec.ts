import { Test, TestingModule } from '@nestjs/testing';
import { MariaDbConfigService } from './maria-db-config.service';

describe('MariaDbConfigService', () => {
  let service: MariaDbConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MariaDbConfigService],
    }).compile();

    service = module.get<MariaDbConfigService>(MariaDbConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
