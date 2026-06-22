import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import type { PoolClient } from 'pg';
import type { IMcitysInvoice } from '../schemas/mcitys/invoice.schema.js';

@Injectable()
export class AccountingRepository {
    constructor(
        private readonly dbService: PostgreSQLService,
    ){}

    public async saveMainInvoiceData(data: IMcitysInvoice, transactionClient: PoolClient): Promise<number | null> {
        const sqlRequest = `INSERT INTO accounting.invoice (source_system) VALUES ($1) RETURNING id_invoice`;
        const result = await this.dbService.execute<{id_invoice: number}>(sqlRequest, [data.source_system], 'standard', false, transactionClient);
         return result.length > 0 ? result[0].id_invoice : null;
    }
}
