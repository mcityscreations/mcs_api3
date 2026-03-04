CREATE VIEW content.v_people AS
SELECT
    p.id_public AS id,
    CASE
    WHEN p.is_organization THEN 'organization'
    ELSE 'individual'
    END AS type,
    CASE 
        WHEN p.is_organization THEN
            jsonb_build_object(
                'legalName', po.legal_name,
                'category', jsonb_build_object(
                    'id', poc.id_public,
                    'name', poc.name
                ),
                'registrationCountry', jsonb_build_object(
                    'id', country.id_public,
                    'name', country.label
                ),
                'idRegistration', po.id_registration,
                'idVAT', po.id_vat
            )
        ELSE
            jsonb_build_object(
                'firstname', pid.firstname,
                'lastname', pid.lastname
            )
    END AS details
FROM content.people p
LEFT JOIN content.people_individual_detail pid ON pid.id_person = p.id_person
LEFT JOIN content.people_organization_detail po ON po.id_person = p.id_person
LEFT JOIN content.people_organization_category poc ON poc.id_organization_category = po.id_organization_category
LEFT JOIN content.country country ON country.id_country = po.registration_country;

--
-- TOC entry 285 (class 1259 OID 32971)
-- Name: v_artwork_full_detail; Type: MATERIALIZED VIEW; Schema: search; Owner: postgres
--

CREATE MATERIALIZED VIEW search.v_artwork_full_detail AS
 SELECT a.id_public AS id_artwork,
    a.reference,
    at.title,
    at.id_language,
    jsonb_build_object('id', art.id_public, 'name', (((pid.firstname)::text || ' '::text) || (pid.lastname)::text)) AS artist,
    a.release_date,
    jsonb_build_object('id', c.id_public, 'title', ct.title, 'relative_path', scm.relative_path) AS category,
    jsonb_build_object('id', t.id_public, 'title', tt.title, 'relative_path', stm.relative_path) AS technique,
    ( SELECT jsonb_build_object('width', d.width, 'height', d.height, 'depth', d.depth) AS jsonb_build_object
           FROM content.artwork_dimensions d
          WHERE (d.id_artwork = a.id_artwork)) AS dimensions,
    a.is_for_sale,
    at.description,
    ( SELECT jsonb_agg(jsonb_build_object('id_media', p.id_media_public, 'image_rank', p.rank, 'id_image_size', m.id_image_size, 'width', m.width, 'height', m.height, 'file_size', m.file_size, 'url', m.storage_key) ORDER BY p.rank) AS jsonb_agg
           FROM (content.artwork_media p
             JOIN media.image_variant m ON ((p.id_media = m.id_media)))
          WHERE (p.id_artwork = a.id_artwork)) AS images,
    ( SELECT jsonb_agg(artwork_colors.hexadecimal) AS jsonb_agg
           FROM content.artwork_colors
          WHERE (artwork_colors.id_artwork = a.id_artwork)) AS colors,
    ( SELECT jsonb_agg(jsonb_build_object('id', k.id_public, 'title', kt.title)) AS jsonb_agg
           FROM ((content.artwork_keywords akp
             JOIN taxonomy.keyword k ON ((akp.id_keyword = k.id_keyword)))
             JOIN taxonomy.keyword_i18n kt ON ((k.id_keyword = kt.id_keyword)))
          WHERE ((akp.id_artwork = a.id_artwork) AND (kt.id_language = at.id_language))) AS keywords
   FROM ((((((((((content.artwork a
     JOIN content.artwork_i18n at ON ((a.id_artwork = at.id_artwork)))
     JOIN content.artist art ON ((a.id_artist = art.id_artist)))
     JOIN content.people_individual_detail pid ON ((art.id_person = pid.id_person)))
     JOIN taxonomy.category c ON ((a.id_category = c.id_category)))
     JOIN taxonomy.category_i18n ct ON (((c.id_category = ct.id_category) AND (ct.id_language = at.id_language))))
     JOIN content.artwork_techniques atc ON ((a.id_artwork = atc.id_artwork)))
     JOIN taxonomy.technique t ON ((atc.id_technique = t.id_technique)))
     JOIN taxonomy.technique_i18n tt ON (((t.id_technique = tt.id_technique) AND (tt.id_language = at.id_language))))
     JOIN seo.category_metadata scm ON (((c.id_category = scm.id_category) AND (scm.id_language = at.id_language))))
     JOIN seo.technique_metadata stm ON (((t.id_technique = stm.id_technique) AND (stm.id_language = at.id_language))))
  WITH NO DATA;


ALTER MATERIALIZED VIEW search.v_artwork_full_detail OWNER TO postgres;