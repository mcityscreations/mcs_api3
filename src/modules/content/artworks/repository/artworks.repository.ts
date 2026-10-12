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
			VALUES (
				(SELECT id_artist FROM content.artist WHERE id_public = $1::uuid),
				$2,
				(SELECT id_category FROM taxonomy.category WHERE id_public = $3::uuid),
				(SELECT id_subject FROM taxonomy.subject WHERE id_public = $4::uuid),
				$5,
				$6
			)
			RETURNING id_artwork AS "idArtwork", reference
		),
		ins_dimensions AS (
			INSERT INTO content.artwork_dimensions (id_artwork, height, width, depth)
			SELECT "idArtwork", $7, $8, $9 FROM new_artwork
		),
		ins_techniques AS (
			INSERT INTO content.artwork_techniques (id_artwork, id_technique)
			SELECT new_artwork."idArtwork", tt.id_technique
			FROM new_artwork
			INNER JOIN taxonomy.technique tt ON tt.id_public = $10::uuid
		),
		ins_keywords AS (
			INSERT INTO content.artwork_keywords (id_artwork, id_keyword)
			SELECT new_artwork."idArtwork", tk.id_keyword
			FROM new_artwork
			CROSS JOIN jsonb_array_elements_text($11::jsonb) AS keywords(id_public)
			INNER JOIN taxonomy.keyword tk ON tk.id_public = keywords.id_public::uuid
		)
		SELECT "idArtwork", reference FROM new_artwork
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
			artwork.idTechnique,
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
