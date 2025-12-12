import { Test, TestingModule } from '@nestjs/testing';
import { SmsConfigService } from './sms-config.service';

describe('SmsConfigService', () => {
  let service: SmsConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsConfigService],
    }).compile();

    service = module.get<SmsConfigService>(SmsConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
