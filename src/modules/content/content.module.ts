import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module.js';
import { PeopleModule } from './people/people.module.js';
import { CategoriesModule } from './taxonomy/categories/categories.module.js';
import { TechniquesModule } from './taxonomy/techniques/techniques.module.js';
import { KeywordsModule } from './taxonomy/keywords/keywords.module.js';
import { TranslationsModule } from './translations/translations.module.js';
import { WeatherModule } from './weather/weather.module.js';
import { ArtworksModule } from './artworks/artworks.module.js';
import { CountryModule } from './taxonomy/country/country.module.js';

/** Module wrapper for content */
@Module({
	imports: [
		ContactModule,
		PeopleModule,
		CategoriesModule,
		TechniquesModule,
		KeywordsModule,
		TranslationsModule,
		WeatherModule,
		ArtworksModule,
		CountryModule,
	],
})
export class ContentModule {}
