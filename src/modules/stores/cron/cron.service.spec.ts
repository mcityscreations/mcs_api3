import { Test, TestingModule } from '@nestjs/testing';
import { PrestashopCronService } from './cron.service.js';

describe('PrestashopCronService', () => {
  let service: PrestashopCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrestashopCronService],
    }).compile();

    service = module.get<PrestashopCronService>(PrestashopCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
