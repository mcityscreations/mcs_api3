import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import { IPrestashopInvoice } from '../schemas/prestashop/invoices.schema.js';

@Injectable()
export class StoresRepository {
    constructor(
        private readonly postgreSQLService: PostgreSQLService
    ) {}

    saveInvoice(invoiceData: IPrestashopInvoice): void {
        // The logic to save the invoice data into the database
    }
}
