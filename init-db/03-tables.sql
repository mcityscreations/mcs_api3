CREATE TABLE content.artist (
    id_artist smallint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    pseudo character varying(15) NOT NULL,
    id_person bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE content.artist OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 17123)
-- Name: artist_id_artist_seq; Type: SEQUENCE; Schema: content; Owner: postgres
--

ALTER TABLE content.artist ALTER COLUMN id_artist ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME content.artist_id_artist_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 16397)
-- Name: artwork; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.artwork (
    id_artwork bigint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    reference character varying(25) NOT NULL,
    id_artist smallint NOT NULL,
    release_date timestamp with time zone NOT NULL,
    id_category bigint NOT NULL,
    id_subject bigint NOT NULL,
    is_for_sale boolean NOT NULL,
    id_status bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE content.artwork OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16709)
-- Name: artwork_colors; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.artwork_colors (
    id_colour bigint CONSTRAINT artwork_colours_id_colour_not_null NOT NULL,
    id_public uuid DEFAULT uuidv7() CONSTRAINT artwork_colours_id_public_not_null NOT NULL,
    id_artwork bigint CONSTRAINT artwork_colours_id_artwork_not_null NOT NULL,
    red integer CONSTRAINT artwork_colours_red_not_null NOT NULL,
    green integer CONSTRAINT artwork_colours_green_not_null NOT NULL,
    blue integer CONSTRAINT artwork_colours_blue_not_null NOT NULL,
    "position" integer CONSTRAINT artwork_colours_position_not_null NOT NULL,
    weight real CONSTRAINT artwork_colours_weight_not_null NOT NULL,
    hexadecimal character varying(6) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE content.artwork_colors OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16708)
-- Name: artwork_colours_id_colour_seq; Type: SEQUENCE; Schema: content; Owner: postgres
--

ALTER TABLE content.artwork_colors ALTER COLUMN id_colour ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME content.artwork_colours_id_colour_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 284 (class 1259 OID 32941)
-- Name: artwork_dimensions; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.artwork_dimensions (
    id_artwork bigint NOT NULL,
    width real NOT NULL,
    height real NOT NULL,
    depth real NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE content.artwork_dimensions OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 16873)
-- Name: artwork_i18n; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.artwork_i18n (
    id_public uuid DEFAULT uuidv7() NOT NULL,
    id_artwork bigint NOT NULL,
    id_language smallint NOT NULL,
    title character varying(150) NOT NULL,
    description text NOT NULL,
    slug character varying(150) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE content.artwork_i18n OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16692)
-- Name: artwork_id_artwork_seq; Type: SEQUENCE; Schema: content; Owner: postgres
--

ALTER TABLE content.artwork ALTER COLUMN id_artwork ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME content.artwork_id_artwork_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 251 (class 1259 OID 16820)
-- Name: artwork_keywords; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.artwork_keywords (
    id_artwork bigint NOT NULL,
    id_keyword bigint NOT NULL
);


ALTER TABLE content.artwork_keywords OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 16913)
-- Name: artwork_media; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.artwork_media (
    id_artwork bigint NOT NULL,
    id_media bigint NOT NULL,
    id_media_public uuid NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    rank real NOT NULL,
    is_cover_image boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE content.artwork_media OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 32795)
-- Name: artwork_reference_seq; Type: SEQUENCE; Schema: content; Owner: postgres
--

CREATE SEQUENCE content.artwork_reference_seq
    START WITH 1279
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE content.artwork_reference_seq OWNER TO postgres;

--
-- TOC entry 5515 (class 0 OID 0)
-- Dependencies: 280
-- Name: artwork_reference_seq; Type: SEQUENCE OWNED BY; Schema: content; Owner: postgres
--

ALTER SEQUENCE content.artwork_reference_seq OWNED BY content.artwork.reference;


--
-- TOC entry 252 (class 1259 OID 16849)
-- Name: artwork_techniques; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.artwork_techniques (
    id_artwork bigint NOT NULL,
    id_technique bigint NOT NULL
);


ALTER TABLE content.artwork_techniques OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 32996)
-- Name: contact; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.contact (
    id_contact bigint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    id_contact_category smallint NOT NULL,
    is_primary boolean NOT NULL,
    is_professional boolean CONSTRAINT contact_is_professionnal_not_null NOT NULL,
    title character varying(50) NOT NULL,
    value character varying(80) NOT NULL,
    is_verified boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id_person bigint NOT NULL
);


ALTER TABLE content.contact OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 33014)
-- Name: contact_category; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.contact_category (
    id_contact_category smallint NOT NULL,
    name character varying(50) CONSTRAINT contact_category_value_not_null NOT NULL
);


ALTER TABLE content.contact_category OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 33021)
-- Name: contact_category_id_contact_category_seq; Type: SEQUENCE; Schema: content; Owner: postgres
--

ALTER TABLE content.contact_category ALTER COLUMN id_contact_category ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME content.contact_category_id_contact_category_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 289 (class 1259 OID 33022)
-- Name: contact_id_contact_seq; Type: SEQUENCE; Schema: content; Owner: postgres
--

ALTER TABLE content.contact ALTER COLUMN id_contact ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME content.contact_id_contact_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 273 (class 1259 OID 17108)
-- Name: country; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.country (
    id_country bigint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    reference character varying(5) NOT NULL,
    is_eu_country boolean NOT NULL,
    label character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE content.country OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 17107)
-- Name: country_id_country_seq; Type: SEQUENCE; Schema: content; Owner: postgres
--

ALTER TABLE content.country ALTER COLUMN id_country ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME content.country_id_country_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 266 (class 1259 OID 17019)
-- Name: people; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.people (
    id_person bigint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    reference character varying(50) NOT NULL,
    is_organization boolean CONSTRAINT people_is_company_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE content.people OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 17034)
-- Name: people_organization_category; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.people_organization_category (
    id_organization_category smallint CONSTRAINT people_category_id_people_category_not_null NOT NULL,
    id_public uuid DEFAULT uuidv7() CONSTRAINT people_category_id_public_not_null NOT NULL,
    name character varying(25) CONSTRAINT people_category_title_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT people_category_created_at_not_null NOT NULL
);


ALTER TABLE content.people_organization_category OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 17033)
-- Name: people_category_id_people_category_seq; Type: SEQUENCE; Schema: content; Owner: postgres
--

ALTER TABLE content.people_organization_category ALTER COLUMN id_organization_category ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME content.people_category_id_people_category_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 265 (class 1259 OID 17018)
-- Name: people_id_person_seq; Type: SEQUENCE; Schema: content; Owner: postgres
--

ALTER TABLE content.people ALTER COLUMN id_person ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME content.people_id_person_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 270 (class 1259 OID 17081)
-- Name: people_individual_detail; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.people_individual_detail (
    id_person bigint CONSTRAINT people_individual_detail_id_people_not_null NOT NULL,
    firstname character varying(50) NOT NULL,
    lastname character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE content.people_individual_detail OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 17093)
-- Name: people_organization_detail; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.people_organization_detail (
    id_person bigint CONSTRAINT people_company_detail_id_people_not_null NOT NULL,
    legal_name character varying(100) CONSTRAINT people_company_detail_legal_name_not_null NOT NULL,
    registration_country bigint CONSTRAINT people_company_detail_registration_country_not_null NOT NULL,
    id_registration character varying(50) CONSTRAINT people_company_detail_id_company_not_null NOT NULL,
    id_vat character varying(50) CONSTRAINT people_company_detail_vat_number_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT people_company_detail_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT people_company_detail_updated_at_not_null NOT NULL,
    id_organization_category smallint NOT NULL
);


ALTER TABLE content.people_organization_detail OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 40986)
-- Name: v_people; Type: VIEW; Schema: content; Owner: postgres
--

CREATE VIEW content.v_people AS
 SELECT p.id_public AS id,
        CASE
            WHEN p.is_organization THEN 'organization'::text
            ELSE 'individual'::text
        END AS type,
        CASE
            WHEN p.is_organization THEN jsonb_build_object('legalName', po.legal_name, 'category', jsonb_build_object('id', poc.id_public, 'name', poc.name), 'registrationCountry', jsonb_build_object('id', country.id_public, 'name', country.label), 'idRegistration', po.id_registration, 'idVAT', po.id_vat)
            ELSE jsonb_build_object('firstname', pid.firstname, 'lastname', pid.lastname)
        END AS details
   FROM ((((content.people p
     LEFT JOIN content.people_individual_detail pid ON ((pid.id_person = p.id_person)))
     LEFT JOIN content.people_organization_detail po ON ((po.id_person = p.id_person)))
     LEFT JOIN content.people_organization_category poc ON ((poc.id_organization_category = po.id_organization_category)))
     LEFT JOIN content.country country ON ((country.id_country = po.registration_country)));


ALTER VIEW content.v_people OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16513)
-- Name: weather; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.weather (
    id uuid DEFAULT uuidv7() NOT NULL,
    date timestamp with time zone NOT NULL,
    pressure real,
    temperature real NOT NULL,
    humidity real NOT NULL,
    id_provider uuid
);


ALTER TABLE content.weather OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16523)
-- Name: weather_providers; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.weather_providers (
    id uuid DEFAULT uuidv7() CONSTRAINT providers_id_not_null NOT NULL,
    reference integer,
    name character varying(25)
);


ALTER TABLE content.weather_providers OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16749)
-- Name: asset; Type: TABLE; Schema: media; Owner: postgres
--

CREATE TABLE media.asset (
    id_media bigint CONSTRAINT media_id_not_null NOT NULL,
    id_public uuid DEFAULT uuidv7() CONSTRAINT media_id_public_not_null NOT NULL,
    id_media_type smallint CONSTRAINT media_id_media_type_not_null NOT NULL,
    mime_type text CONSTRAINT media_mime_type_not_null NOT NULL,
    owner_type text CONSTRAINT media_owner_type_not_null NOT NULL,
    reference character varying(25),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE media.asset OWNER TO postgres;

--
-- TOC entry 5517 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN asset.owner_type; Type: COMMENT; Schema: media; Owner: postgres
--

COMMENT ON COLUMN media.asset.owner_type IS 'Artwork, Article, Product, Exhibition...';


--
-- TOC entry 257 (class 1259 OID 16926)
-- Name: asset_caption; Type: TABLE; Schema: media; Owner: postgres
--

CREATE TABLE media.asset_caption (
    id_media bigint NOT NULL,
    id_language character varying(2) NOT NULL,
    caption text NOT NULL
);


ALTER TABLE media.asset_caption OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16728)
-- Name: image_size; Type: TABLE; Schema: media; Owner: postgres
--

CREATE TABLE media.image_size (
    id smallint CONSTRAINT media_image_size_id_not_null NOT NULL,
    code text CONSTRAINT media_image_size_code_not_null NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT media_image_size_created_at_not_null NOT NULL
);


ALTER TABLE media.image_size OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16774)
-- Name: image_variant; Type: TABLE; Schema: media; Owner: postgres
--

CREATE TABLE media.image_variant (
    id_image_variant bigint CONSTRAINT media_image_variant_id_image_variant_not_null NOT NULL,
    id_media bigint,
    id_image_size smallint CONSTRAINT media_image_variant_id_image_size_not_null NOT NULL,
    width integer CONSTRAINT media_image_variant_width_not_null NOT NULL,
    height integer CONSTRAINT media_image_variant_height_not_null NOT NULL,
    file_size bigint CONSTRAINT media_image_variant_file_size_not_null NOT NULL,
    storage_key text CONSTRAINT media_image_variant_storage_key_not_null NOT NULL
);


ALTER TABLE media.image_variant OWNER TO postgres;

--
-- TOC entry 5518 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN image_variant.file_size; Type: COMMENT; Schema: media; Owner: postgres
--

COMMENT ON COLUMN media.image_variant.file_size IS 'Size in octets';


--
-- TOC entry 245 (class 1259 OID 16748)
-- Name: media_id_seq; Type: SEQUENCE; Schema: media; Owner: postgres
--

ALTER TABLE media.asset ALTER COLUMN id_media ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME media.media_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 247 (class 1259 OID 16773)
-- Name: media_image_variant_id_image_variant_seq; Type: SEQUENCE; Schema: media; Owner: postgres
--

ALTER TABLE media.image_variant ALTER COLUMN id_image_variant ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME media.media_image_variant_id_image_variant_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 250 (class 1259 OID 16800)
-- Name: video_variant; Type: TABLE; Schema: media; Owner: postgres
--

CREATE TABLE media.video_variant (
    id_video_variant bigint CONSTRAINT media_video_variant_id_video_variant_not_null NOT NULL,
    id_media bigint,
    resolution text CONSTRAINT media_video_variant_resolution_not_null NOT NULL,
    bitrate integer CONSTRAINT media_video_variant_bitrate_not_null NOT NULL,
    codec text CONSTRAINT media_video_variant_codec_not_null NOT NULL,
    storage_key text CONSTRAINT media_video_variant_storage_key_not_null NOT NULL,
    file_size bigint CONSTRAINT media_video_variant_file_size_not_null NOT NULL
);


ALTER TABLE media.video_variant OWNER TO postgres;

--
-- TOC entry 5519 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN video_variant.resolution; Type: COMMENT; Schema: media; Owner: postgres
--

COMMENT ON COLUMN media.video_variant.resolution IS '720p, 1080p...';


--
-- TOC entry 5520 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN video_variant.bitrate; Type: COMMENT; Schema: media; Owner: postgres
--

COMMENT ON COLUMN media.video_variant.bitrate IS '--- kpbs';


--
-- TOC entry 5521 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN video_variant.codec; Type: COMMENT; Schema: media; Owner: postgres
--

COMMENT ON COLUMN media.video_variant.codec IS 'h264 etc.';


--
-- TOC entry 249 (class 1259 OID 16799)
-- Name: media_video_variant_id_video_variant_seq; Type: SEQUENCE; Schema: media; Owner: postgres
--

ALTER TABLE media.video_variant ALTER COLUMN id_video_variant ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME media.media_video_variant_id_video_variant_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 244 (class 1259 OID 16741)
-- Name: type; Type: TABLE; Schema: media; Owner: postgres
--

CREATE TABLE media.type (
    id_media smallint CONSTRAINT media_type_id_media_not_null NOT NULL,
    title character varying(15) CONSTRAINT media_type_title_not_null NOT NULL
);


ALTER TABLE media.type OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 32886)
-- Name: category_metadata; Type: TABLE; Schema: seo; Owner: postgres
--

CREATE TABLE seo.category_metadata (
    id_category bigint NOT NULL,
    id_language smallint NOT NULL,
    slug character varying(150) NOT NULL,
    relative_path character varying(250) NOT NULL,
    meta_title character varying(150),
    meta_description character varying(250),
    is_canonical boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL
);


ALTER TABLE seo.category_metadata OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 32800)
-- Name: technique_metadata; Type: TABLE; Schema: seo; Owner: postgres
--

CREATE TABLE seo.technique_metadata (
    id_public uuid DEFAULT uuidv7() NOT NULL,
    id_technique bigint NOT NULL,
    id_language smallint NOT NULL,
    slug character varying(150) NOT NULL,
    relative_path character varying(250) NOT NULL,
    meta_title character varying(150) NOT NULL,
    meta_description character varying(250),
    is_canonical boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE seo.technique_metadata OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16573)
-- Name: category; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.category (
    id_category bigint CONSTRAINT "categories-new_id_not_null" NOT NULL,
    id_public uuid DEFAULT uuidv7() CONSTRAINT "categories-new_id_public_not_null" NOT NULL,
    reference character varying(10) CONSTRAINT "categories-new_reference_not_null" NOT NULL,
    title character varying(150) CONSTRAINT "categories-new_title_not_null" NOT NULL,
    id_entity bigint CONSTRAINT "categories-new_id_entity_not_null" NOT NULL,
    is_public boolean CONSTRAINT "categories-new_is_public_not_null" NOT NULL,
    has_dimensions boolean CONSTRAINT "categories-new_has_dimensions_not_null" NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT "categories-new_created_at_not_null" NOT NULL,
    updated_at time with time zone DEFAULT now() CONSTRAINT "categories-new_updated_at_not_null" NOT NULL
);


ALTER TABLE taxonomy.category OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 24583)
-- Name: category_i18n; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.category_i18n (
    id_category bigint NOT NULL,
    id_language smallint NOT NULL,
    title character varying(50) NOT NULL,
    slug character varying(150) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE taxonomy.category_i18n OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16641)
-- Name: keyword; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.keyword (
    id_keyword bigint CONSTRAINT keywords_id_not_null NOT NULL,
    id_public uuid DEFAULT uuidv7() CONSTRAINT keywords_id_public_not_null NOT NULL,
    reference character varying(10) CONSTRAINT keywords_reference_not_null NOT NULL,
    title character varying(50) CONSTRAINT keywords_title_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT keywords_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT keywords_updated_at_not_null NOT NULL
);


ALTER TABLE taxonomy.keyword OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 24633)
-- Name: keyword_i18n; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.keyword_i18n (
    id_keyword bigint NOT NULL,
    id_language smallint NOT NULL,
    title character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE taxonomy.keyword_i18n OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16619)
-- Name: technique; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.technique (
    id_technique bigint CONSTRAINT "techniques-new_id_not_null" NOT NULL,
    id_public uuid DEFAULT uuidv7() CONSTRAINT "techniques-new_id_public_not_null" NOT NULL,
    id_category bigint CONSTRAINT "techniques-new_id_category_not_null" NOT NULL,
    reference character varying(10) CONSTRAINT "techniques-new_reference_not_null" NOT NULL,
    name character varying(150) CONSTRAINT "techniques-new_name_not_null" NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT "techniques-new_created_at_not_null" NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT "techniques-new_updated_at_not_null" NOT NULL
);


ALTER TABLE taxonomy.technique OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 24687)
-- Name: technique_i18n; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.technique_i18n (
    id_technique bigint NOT NULL,
    id_language smallint NOT NULL,
    title character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE taxonomy.technique_i18n OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 16963)
-- Name: role; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.role (
    id_role smallint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    title character varying(25) NOT NULL
);


ALTER TABLE security.role OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 16962)
-- Name: role_id_role_seq; Type: SEQUENCE; Schema: security; Owner: postgres
--

ALTER TABLE security.role ALTER COLUMN id_role ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME security.role_id_role_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 264 (class 1259 OID 16995)
-- Name: role_scope; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.role_scope (
    id_role smallint NOT NULL,
    id_scope smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE security.role_scope OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 16984)
-- Name: scope; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.scope (
    id_scope smallint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    title character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE security.scope OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 16983)
-- Name: scope_id_scope_seq; Type: SEQUENCE; Schema: security; Owner: postgres
--

ALTER TABLE security.scope ALTER COLUMN id_scope ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME security.scope_id_scope_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 258 (class 1259 OID 16942)
-- Name: user; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security."user" (
    id_user bigint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    username character varying(25) NOT NULL,
    id_person uuid NOT NULL,
    id_role smallint NOT NULL,
    password text NOT NULL,
    pass_salt text NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE security."user" OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 16969)
-- Name: user_id_user_seq; Type: SEQUENCE; Schema: security; Owner: postgres
--

ALTER TABLE security."user" ALTER COLUMN id_user ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME security.user_id_user_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 281 (class 1259 OID 32797)
-- Name: artwork_metadata; Type: TABLE; Schema: seo; Owner: postgres
--

CREATE TABLE seo.artwork_metadata (
    id_public uuid DEFAULT uuidv7() NOT NULL,
    id_artwork bigint NOT NULL,
    id_language smallint NOT NULL,
    slug character varying(150) NOT NULL,
    relative_path character varying(250) NOT NULL,
    meta_title character varying(150) NOT NULL,
    meta_description character varying(250) NOT NULL,
    is_canonical boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE seo.artwork_metadata OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 41045)
-- Name: ui_metadata; Type: TABLE; Schema: seo; Owner: postgres
--

CREATE TABLE seo.ui_metadata (
    id_ui_key bigint CONSTRAINT ui_metadata_id_ui_metadata_not_null NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    id_language smallint NOT NULL,
    slug character varying(150) NOT NULL,
    relative_path character varying(250) NOT NULL,
    meta_title character varying(150) NOT NULL,
    meta_description character varying(250) NOT NULL,
    is_canonical boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE seo.ui_metadata OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16617)
-- Name: categories-new_id_seq; Type: SEQUENCE; Schema: taxonomy; Owner: postgres
--

ALTER TABLE taxonomy.category ALTER COLUMN id_category ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME taxonomy."categories-new_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 16590)
-- Name: entity; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.entity (
    id_entity bigint CONSTRAINT content_entities_new_id_not_null NOT NULL,
    id_public uuid DEFAULT uuidv7() CONSTRAINT content_entities_new_id_public_not_null NOT NULL,
    reference character varying(10) CONSTRAINT content_entities_new_reference_not_null NOT NULL,
    title character varying(25) CONSTRAINT content_entities_new_title_not_null NOT NULL,
    is_public boolean CONSTRAINT content_entities_new_is_public_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT content_entities_new_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT content_entities_new_updated_at_not_null NOT NULL
);


ALTER TABLE taxonomy.entity OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16610)
-- Name: content_entities_new_id_seq; Type: SEQUENCE; Schema: taxonomy; Owner: postgres
--

ALTER TABLE taxonomy.entity ALTER COLUMN id_entity ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME taxonomy.content_entities_new_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 276 (class 1259 OID 24608)
-- Name: entity_i18n; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.entity_i18n (
    id_entity bigint NOT NULL,
    id_language smallint NOT NULL,
    title character varying(50) NOT NULL,
    slug character varying(150) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE taxonomy.entity_i18n OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16640)
-- Name: keywords_id_seq; Type: SEQUENCE; Schema: taxonomy; Owner: postgres
--

ALTER TABLE taxonomy.keyword ALTER COLUMN id_keyword ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME taxonomy.keywords_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 255 (class 1259 OID 16895)
-- Name: language; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.language (
    id_language smallint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    reference character varying(2) NOT NULL,
    name character varying(25) NOT NULL,
    slug character varying(10) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE taxonomy.language OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 16894)
-- Name: language_id_language_seq; Type: SEQUENCE; Schema: taxonomy; Owner: postgres
--

ALTER TABLE taxonomy.language ALTER COLUMN id_language ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME taxonomy.language_id_language_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 240 (class 1259 OID 16694)
-- Name: status; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.status (
    id_status bigint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    reference bigint NOT NULL,
    title character varying(50) NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE taxonomy.status OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16693)
-- Name: status_id_status_seq; Type: SEQUENCE; Schema: taxonomy; Owner: postgres
--

ALTER TABLE taxonomy.status ALTER COLUMN id_status ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME taxonomy.status_id_status_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 237 (class 1259 OID 16674)
-- Name: subject; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.subject (
    id_subject bigint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    reference character varying(25) NOT NULL,
    title character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE taxonomy.subject OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 24664)
-- Name: subject_i18n; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.subject_i18n (
    id_subject bigint NOT NULL,
    id_language smallint NOT NULL,
    title character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE taxonomy.subject_i18n OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16673)
-- Name: subject_id_subject_seq; Type: SEQUENCE; Schema: taxonomy; Owner: postgres
--

ALTER TABLE taxonomy.subject ALTER COLUMN id_subject ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME taxonomy.subject_id_subject_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 16618)
-- Name: techniques-new_id_seq; Type: SEQUENCE; Schema: taxonomy; Owner: postgres
--

ALTER TABLE taxonomy.technique ALTER COLUMN id_technique ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME taxonomy."techniques-new_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 292 (class 1259 OID 41000)
-- Name: ui_i18n; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.ui_i18n (
    id_uikey smallint NOT NULL,
    id_language smallint NOT NULL,
    translation text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE taxonomy.ui_i18n OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 40991)
-- Name: ui_key; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.ui_key (
    id_uikey smallint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    key_code character varying(50) CONSTRAINT ui_key_label_not_null NOT NULL,
    description character varying(250) NOT NULL,
    id_ui_module smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    has_seo boolean NOT NULL,
    id_page_element smallint
);


ALTER TABLE taxonomy.ui_key OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 41028)
-- Name: ui_key_id_uikey_seq; Type: SEQUENCE; Schema: taxonomy; Owner: postgres
--

ALTER TABLE taxonomy.ui_key ALTER COLUMN id_uikey ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME taxonomy.ui_key_id_uikey_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 294 (class 1259 OID 41016)
-- Name: ui_module; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.ui_module (
    id_ui_module smallint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(250) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE taxonomy.ui_module OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 41015)
-- Name: ui_module_id_ui_module_seq; Type: SEQUENCE; Schema: taxonomy; Owner: postgres
--

ALTER TABLE taxonomy.ui_module ALTER COLUMN id_ui_module ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME taxonomy.ui_module_id_ui_module_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 298 (class 1259 OID 41085)
-- Name: ui_page_element; Type: TABLE; Schema: taxonomy; Owner: postgres
--

CREATE TABLE taxonomy.ui_page_element (
    id_page_element smallint NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE taxonomy.ui_page_element OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 41084)
-- Name: ui_page_element_id_page_element_seq; Type: SEQUENCE; Schema: taxonomy; Owner: postgres
--

ALTER TABLE taxonomy.ui_page_element ALTER COLUMN id_page_element ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME taxonomy.ui_page_element_id_page_element_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4983 (class 2604 OID 32796)
-- Name: artwork reference; Type: DEFAULT; Schema: content; Owner: postgres
--

ALTER TABLE ONLY content.artwork ALTER COLUMN reference SET DEFAULT ('A'::text || nextval('content.artwork_reference_seq'::regclass));

