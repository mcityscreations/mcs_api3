import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class TranslationsService implements OnModuleInit {

    constructor() {}

    onModuleInit() {
        // Loading translations from database and storing them in memory for quick access
    }

    // Loads all static translations from the database and stores them in memory
    loadStaticTranslations(): string {
        // Retrieve the translation for the given key and language from the in-memory store
        return '';
    }

    // Serves all static translations for a given language (used by the frontend to load all translations at once)
    getStaticTranslations(language: string): string {
        // Retrieve the translation for the given language from the in-memory store
        return '';
    }
}
