import { Injectable } from '@nestjs/common';
import { ICreateArtwork } from '../../schemas/create-artwork.schema.js';

@Injectable()
export class ArtworksService {

    addArtwork(artworkPayload: ICreateArtwork) {

    }

    getArtwork(artworkId: string) {

    }

    getArtworksByCategory(categoryId: string) {

    }

    getArtworksByTechnique(techniqueId: string) {

    }

    getArtworksBySubject(subjectId: string) {

    }

    getArtworksByKeyword(keywordId: string) {

    }
}
