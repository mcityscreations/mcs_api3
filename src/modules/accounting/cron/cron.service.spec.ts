import { Test, TestingModule } from '@nestjs/testing';
import { AccountingCronServiceService } from './cron.service.js';

describe('AccountingCronServiceService', () => {
  let service: AccountingCronServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountingCronServiceService],
    }).compile();

    service = module.get<AccountingCronServiceService>(AccountingCronServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
