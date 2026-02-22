// src/modules/content/translations/schemas/static-translations.schemas.ts
import z from "zod";

/** Output example
 * {
  "static": {
    "nav": {
      "home": [
        { "lang": "fr", "value": "Accueil", "metadata": { "lastUpdated": "2024-01-01" } },
        { "lang": "en", "value": "Home", "metadata": { "lastUpdated": "2024-01-01" } }
      ],
      "aboutUs": [
        { "lang": "fr", "value": "À propos" },
        { "lang": "en", "value": "About Us" }
      ]
    },
    "button": {
      "submit": [
        { "lang": "fr", "value": "Envoyer" },
        { "lang": "en", "value": "Submit" }
      ]
    }
  },
}

*/


export const TranslationEntrySchema = z.object({
  lang: z.string().length(2), // "fr", "en", etc.
  value: z.string(), // The translation (ex: "Accueil")
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});
export type ITranslationEntry = z.infer<typeof TranslationEntrySchema>;


export const NavTranslationSchema = z.object({
    home: z.array(TranslationEntrySchema),
    aboutUs: z.array(TranslationEntrySchema),
    contact: z.array(TranslationEntrySchema),
    exhibitions: z.array(TranslationEntrySchema),
    blog: z.array(TranslationEntrySchema),
    termsAndConditions: z.array(TranslationEntrySchema),
    privacyPolicy: z.array(TranslationEntrySchema),
    legalNotice: z.array(TranslationEntrySchema),
    store: z.array(TranslationEntrySchema),
    artworks: z.array(TranslationEntrySchema),
});
export type INavTranslations = z.infer<typeof NavTranslationSchema>;


export const StaticTranslationsSchema = z.object({
  nav: NavTranslationSchema,
  button: z.record(z.string(), z.array(TranslationEntrySchema)), // Boutons dynamiques (ex: "submit", "cancel")
  label: z.record(z.string(), z.array(TranslationEntrySchema)), // Labels dynamiques
});
export type IStaticTranslations = z.infer<typeof StaticTranslationsSchema>;