// src/modules/content/translations/controller/translations.controller.ts
import { Controller, Get, Query } from '@nestjs/common';

@Controller('translations')
export class TranslationsController {
	@Get('common')
	getCommonTranslations(@Query('lang') lang: string) {
		return { message: 'Translations endpoint' };
	}

	/** Lazy loaded translations */
	@Get('artworks')
	getArtworkTranslations(@Query('lang') lang: string) {
		return { message: 'Artwork translations endpoint' };
	}

	@Get('blog')
	getBlogTranslations(@Query('lang') lang: string) {
		return { message: 'Blog translations endpoint' };
	}

	@Get('exhibitions')
	getExhibitionTranslations(@Query('lang') lang: string) {
		return { message: 'Exhibition translations endpoint' };
	}

	@Get('juris')
	getJurisTranslations(@Query('lang') lang: string) {
		return { message: 'Juris translations endpoint' };
	}
}
