import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StoreAdapter } from '../interfaces/stores.interface.js';
import { PrestashopConfigService } from '../configs/prestashop/prestashop.config.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { IDateFilter } from '../schemas/datefilter.schema.js';

@Injectable()
export class PrestashopAdapter extends StoreAdapter {
    protected apiEndpoint: string = "";
    protected authorizationKey: string = "";

    constructor(
        private readonly configService: PrestashopConfigService,
        private readonly logger: WinstonLoggerService
    ) {
        super();
        this.initializeStore();
    }

    initializeStore(){
        this.apiEndpoint = this.configService.url;
        this.authorizationKey = this.configService.authorizationKey;
        if(this.apiEndpoint !== "" && this.authorizationKey !== "") {
            this.logger.log('PrestaShop Adapter initialized with API Endpoint: ' + this.apiEndpoint);
        } else {
            this.logger.error('Failed to initialize PrestaShop Adapter. Missing API endpoint or authorization key.');
            throw new InternalServerErrorException('Failed to initialize PrestaShop Adapter. Missing API endpoint or authorization key.');
        }
    }

    uploadProduct(): void {
        // The logic to upload a product to PrestaShop
    }

    updateProduct(): void {
        // The logic to update a product in PrestaShop
    }

    uploadProductImage(): void {
        // The logic to upload a product image to PrestaShop
    }

    getProductCategories(): void {
        // The logic to retrieve product categories from PrestaShop
    }

    getProductAttributes(): void {
        // The logic to retrieve product attributes from PrestaShop
    }

    getInvoicesByDatePeriod(dateFilter: IDateFilter): void {
        // The logic to retrieve invoices from PrestaShop
    }
}
