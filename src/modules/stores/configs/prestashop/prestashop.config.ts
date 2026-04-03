import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrestashopConfigService {
  constructor(private readonly configService: ConfigService) {}

  get key(): string {
    const key = this.configService.get<string>('PRESTASHOP_KEY');
    if (!key) {
      throw new InternalServerErrorException('PRESTASHOP_KEY is not defined in the environment variables');
    }
    return key;
  }

  get url(): string {
    const url = this.configService.get<string>('PRESTASHOP_URL');
    if (!url) {
      throw new InternalServerErrorException('PRESTASHOP_URL is not defined in the environment variables');
    }
    return url;
  }
}
