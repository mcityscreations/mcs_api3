import { Controller, Get, Post } from '@nestjs/common';
import type { ICreateArtwork } from '../schemas/create-artwork.schema.js';
import { ArtworksService } from '../services/artworks/artworks.service.js';

@Controller('artworks')
export class ArtworksController {

    constructor(private readonly artworksService: ArtworksService) {}

    @Post()
    addArtwork(artworkPayload: ICreateArtwork) {

    }

    @Get(':artworkId')
    getArtwork(artworkId: string) {

    }

    @Get(':categoryName')
    getArtworksByCategory(categoryName: string) {

    }

    @Get(':categoryName/:techniqueName')
    getArtworksByTechnique(techniqueName: string) {

    }

    getArtworksBySubject(subjectId: string) {

    }

    getArtworksByKeyword(keywordId: string) {

    }
}
