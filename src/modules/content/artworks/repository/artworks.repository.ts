import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../../system/database/postgresql/postgresql.service.js';
import type { PoolClient } from 'pg';
import { ICreateArtwork } from '../schemas/create-artwork.schema.js';
import { ICreateArtworkI18n } from '../schemas/create-i18n.schema.js';

@Injectable()
export class ArtworksRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	get transactionClientInstance(): Promise<PoolClient | null> {
		const client = this.dbService.beginTransaction('standard');
		return client;
	}

	public async addArtwork(artwork: ICreateArtwork): Promise<{
		idArtwork: string;
		reference: string;
	} | null> {
		const sqlRequest = `
        WITH new_artwork AS (
			INSERT INTO content.artwork (id_artist, release_date, id_category, id_subject, is_for_sale, id_status)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id_artwork AS "idArtwork", reference
		),
		ins_dimensions AS (
			INSERT INTO content.artwork_dimensions (id_artwork, height, width, depth)
			SELECT id_artwork, $7, $8, $9 FROM new_artwork
		),
		ins_keywords AS (
			INSERT INTO content.artwork_keywords (id_artwork, id_keyword)
			SELECT new_artwork.id_artwork, keywords.id_keyword
			FROM new_artwork
			CROSS JOIN jsonb_array_elements_text($10::jsonb) AS keywords(id_keyword INT)
		)
        `;

		const result = await this.dbService.execute<{
			idArtwork: string;
			reference: string;
		}>(sqlRequest, [
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
		]);
		return result[0] ?? null;
	}

	public async addArtworkI18n(
		i18nPayload: ICreateArtworkI18n[],
	): Promise<boolean> {
		const sqlRequest = `
		INSERT INTO content.artwork_i18n (id_artwork, id_language, title, description, slug)
		SELECT 
			items."idArtwork",
			items."idLanguage",
			items.title,
			items.description,
			items.slug
		FROM jsonb_to_recordset($1::jsonb) AS items(
			"idArtwork" INT,
			"idLanguage" VARCHAR(255),
			title VARCHAR(255),
			description TEXT,
			slug VARCHAR(255)
		);`;

		await this.dbService.execute(sqlRequest, [JSON.stringify(i18nPayload)]);

		return true;
	}
}
