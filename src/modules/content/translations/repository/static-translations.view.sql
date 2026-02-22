CREATE VIEW taxonomy.static_translations AS
SELECT
    tuk.key_code AS uiKey,
    tuk.description AS uiDescription,
    jsonb_build_object(
        'moduleName', tum.name,
        'moduleDescription', tum.description,
        'translations', trans_data.content
    ) AS translations
FROM taxonomy.ui_key tuk
INNER JOIN taxonomy.ui_module tum ON tuk.id_ui_module = tum.id_ui_module
LEFT JOIN LATERAL (
    SELECT jsonb_object_agg(
        l.slug, 
        jsonb_strip_nulls(jsonb_build_object(
            'value', tui.translation,
            'metadata', json_build_object(
                'createdAt', tui.created_at,
                'updatedAt', tui.updated_at
            ),
            'seo', (
                SELECT jsonb_agg(jsonb_build_object(
                    'slug', s.slug, 
                    'lang', ls.slug,
                    'relativePath', s.relative_path,
                    'metaTitle', s.meta_title,
                    'metaDescription', s.meta_description,
                    'lastUpdate', s.updated_at,
                    'isCanonical', s.is_canonical
                ))
                FROM seo.ui_metadata s
                JOIN taxonomy.language ls ON s.id_language = ls.id_language
                WHERE s.id_ui_key = tuk.id_ui_key
            )
        ))
    ) as content
    FROM taxonomy.ui_i18n tui
    JOIN taxonomy.language l ON tui.id_language = l.id_language
    WHERE tui.id_ui_key = tuk.id_ui_key
) trans_data ON true;