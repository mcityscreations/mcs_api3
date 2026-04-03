import { Module } from '@nestjs/common';
import { PrestashopConfigService } from './configs/prestashop/prestashop.config.js';
import { AdaptersService } from './adapters/adapters.service';

@Module({
  providers: [PrestashopConfigService, AdaptersService]
})
export class StoresModule {}
