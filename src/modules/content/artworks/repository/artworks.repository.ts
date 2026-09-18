import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import type { PoolClient } from 'pg';
import { ICreateArtwork } from '../schemas/create-artwork.schema.js';

@Injectable()
export class ArtworksRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	get transactionClientInstance(): Promise<PoolClient | null> {
		const client = this.dbService.beginTransaction('standard');
		return client;
	}

	addArtwork(artwork: ICreateArtwork): Promise<string | null> {
		const sqlRequest = `
        WITH new_artwork AS (
            INSERT INTO content.artwork (id_artist, release_date, id_category, id_subject, is_for_sale, id_status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id_artwork;
        )
        INSERT INTO content.artwork_dimensions (id_artwork, height, width, depth)
        VALUES ((SELECT id_artwork FROM new_artwork), $7, $8, $9);

        INSERT INTO content.artwork_keywords(id_artwork, id_keyword)
        SELECT
            new_artwork.id_artwork,
            keywords.id_keyword
        FROM new_artwork
        CROSS JOIN jsonb_array_elements_text($10::jsonb) AS keywords(id_keyword INT);

        INSERT INTO content.artwork_i18n
        (id_artwork, id_language, title, description, slug)
		SELECT 
			new_artwork.id_artwork,
			items.id_language,
			items.title,
			items.description,
			items.slug
		FROM new_artwork
		CROSS JOIN jsonb_to_recordset($11::jsonb) AS items(
			id_language VARCHAR(255),
			title VARCHAR(255),
			description TEXT,
			slug VARCHAR(255)
        );
        `;

		return this.dbService.execute(sqlRequest, [
			artwork.idArtist,
			artwork.releaseDate,
			artwork.idCategory,
			artwork.idSubject,
			(artwork?.price?.price ?? 0) > 0,
			2, // draft status
			artwork.dimensions.height,
			artwork.dimensions.width,
			artwork.dimensions.depth,
			JSON.stringify(artwork.keywords),
			JSON.stringify(artwork.i18n),
		]);
	}
}
