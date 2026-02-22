import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../../system/database/redis/redis.service.js';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';

@Injectable()
export class RepositoryService {
    constructor(
        private readonly redisService: RedisService,
        private readonly postgreSQLService: PostgreSQLService,
    ) {}

    async getStaticTranslations() {
        // Call static_translations view in PostgreSQL to get all translations
        return await this.postgreSQLService.execute('SELECT * FROM taxonomy.static_translations', [], 'standard', false);
    }
}
