import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';

@Injectable()
export class PaymentRepository {
	constructor(private readonly dbService: PostgreSQLService) {}
}
