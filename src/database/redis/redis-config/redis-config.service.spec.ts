import { Test, TestingModule } from '@nestjs/testing';
import { RedisConfigService } from './redis-config.service';

describe('RedisConfigService', () => {
  let service: RedisConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisConfigService],
    }).compile();

    service = module.get<RedisConfigService>(RedisConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
