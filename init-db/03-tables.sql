CREATE TYPE taxonomy.element_type_enum AS ENUM (
    'art',
    'exhibition',
    'product',
    'project'
);


ALTER TYPE taxonomy.element_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 315 (class 1259 OID 26855)
-- Name: invoice; Type: TABLE; Schema: accounting; Owner: postgres
--

CREATE TABLE accounting.invoice (
    id_invoice bigint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    system_source character varying(50) CONSTRAINT invoice_id_store_not_null NOT NULL,
    reference character varying(50) NOT NULL,
    id_technical_erp character varying(255) CONSTRAINT invoice_id_payment_method_not_null NOT NULL,
    amount_wt bigint NOT NULL,
    amount_vat bigint NOT NULL,
    amount_at bigint NOT NULL,
    issue_date timestamp with time zone CONSTRAINT invoice_created_at_not_null NOT NULL,
    due_date timestamp with time zone DEFAULT now() CONSTRAINT invoice_updated_at_not_null NOT NULL,
    paid_at timestamp with time zone,
    emitter bigint NOT NULL,
    recipient bigint,
    currency character varying(25),
    payment_direction character varying(10)
);


ALTER TABLE accounting.invoice OWNER TO postgres;

--
-- TOC entry 4288 (class 0 OID 0)
-- Dependencies: 315
-- Name: COLUMN invoice.issue_date; Type: COMMENT; Schema: accounting; Owner: postgres
--

COMMENT ON COLUMN accounting.invoice.issue_date IS 'Creation date as provided by the store system.';


--
-- TOC entry 314 (class 1259 OID 26854)
-- Name: invoice_id_invoice_seq; Type: SEQUENCE; Schema: accounting; Owner: postgres
--

ALTER TABLE accounting.invoice ALTER COLUMN id_invoice ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME accounting.invoice_id_invoice_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 316 (class 1259 OID 26885)
-- Name: invoice_status; Type: TABLE; Schema: accounting; Owner: postgres
--

CREATE TABLE accounting.invoice_status (
    id_invoice_status smallint CONSTRAINT invoice_status_list_id_invoice_status_list_not_null NOT NULL,
    id_public uuid DEFAULT uuidv7() CONSTRAINT invoice_status_list_id_public_not_null NOT NULL,
    status_name character varying(50) CONSTRAINT invoice_status_list_status_name_not_null NOT NULL,
    label character varying(50),
    is_final boolean,
    qonto_mapping character varying(25),
    gov_mapping character varying(25),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE accounting.invoice_status OWNER TO postgres;

--
-- TOC entry 321 (class 1259 OID 26929)
-- Name: invoice_status_history; Type: TABLE; Schema: accounting; Owner: postgres
--

CREATE TABLE accounting.invoice_status_history (
    id_invoice_status_history bigint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    id_invoice bigint NOT NULL,
    id_invoice_status smallint NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE accounting.invoice_status_history OWNER TO postgres;

--
-- TOC entry 320 (class 1259 OID 26928)
-- Name: invoice_status_history_id_invoice_status_history_seq; Type: SEQUENCE; Schema: accounting; Owner: postgres
--

ALTER TABLE accounting.invoice_status_history ALTER COLUMN id_invoice_status_history ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME accounting.invoice_status_history_id_invoice_status_history_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 317 (class 1259 OID 26898)
-- Name: invoice_status_id_invoice_status_seq; Type: SEQUENCE; Schema: accounting; Owner: postgres
--

ALTER TABLE accounting.invoice_status ALTER COLUMN id_invoice_status ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME accounting.invoice_status_id_invoice_status_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 324 (class 1259 OID 27044)
-- Name: invoice_sync_history; Type: TABLE; Schema: accounting; Owner: postgres
--

CREATE TABLE accounting.invoice_sync_history (
    id_invoice_sync bigint CONSTRAINT invoice_sync_id_invoice_sync_not_null NOT NULL,
    id_invoice bigint CONSTRAINT invoice_sync_id_invoice_not_null NOT NULL,
    id_sync_status smallint CONSTRAINT invoice_sync_id_sync_status_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT invoice_sync_created_at_not_null NOT NULL
);


ALTER TABLE accounting.invoice_sync_history OWNER TO postgres;

--
-- TOC entry 325 (class 1259 OID 27054)
-- Name: invoice_sync_status; Type: TABLE; Schema: accounting; Owner: postgres
--

CREATE TABLE accounting.invoice_sync_status (
    id_sync_status smallint NOT NULL,
    label character varying(50) NOT NULL
);


ALTER TABLE accounting.invoice_sync_status OWNER TO postgres;

--
-- TOC entry 326 (class 1259 OID 27061)
-- Name: invoice_sync_status_id_sync_status_seq; Type: SEQUENCE; Schema: accounting; Owner: postgres
--

ALTER TABLE accounting.invoice_sync_status ALTER COLUMN id_sync_status ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME accounting.invoice_sync_status_id_sync_status_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 323 (class 1259 OID 26996)
-- Name: invoice_type; Type: TABLE; Schema: accounting; Owner: postgres
--

CREATE TABLE accounting.invoice_type (
    value character varying(25) NOT NULL
);


ALTER TABLE accounting.invoice_type OWNER TO postgres;

--
-- TOC entry 318 (class 1259 OID 26909)
-- Name: payment; Type: TABLE; Schema: accounting; Owner: postgres
--

CREATE TABLE accounting.payment (
    id_payment bigint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    id_payment_method smallint NOT NULL,
    id_invoice bigint NOT NULL,
    amount bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE accounting.payment OWNER TO postgres;

--
-- TOC entry 4289 (class 0 OID 0)
-- Dependencies: 318
-- Name: COLUMN payment.amount; Type: COMMENT; Schema: accounting; Owner: postgres
--

COMMENT ON COLUMN accounting.payment.amount IS 'Amount in Euro cents';


--
-- TOC entry 227 (class 1259 OID 25723)
-- Name: artist; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.artist (
    id_artist smallint NOT NULL,
    id_public uuid DEFAULT uuidv7() NOT NULL,
    pseudo character varying(15) NOT NULL,
    id_person bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE content.artist OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 25733)
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
-- TOC entry 229 (class 1259 OID 25734)
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
-- TOC entry 230 (class 1259 OID 25751)
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
-- TOC entry 231 (class 1259 OID 25768)
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
-- TOC entry 232 (class 1259 OID 25769)
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
-- TOC entry 233 (class 1259 OID 25778)
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
-- TOC entry 234 (class 1259 OID 25794)
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
-- TOC entry 235 (class 1259 OID 25795)
-- Name: artwork_keywords; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.artwork_keywords (
    id_artwork bigint NOT NULL,
    id_keyword bigint NOT NULL
);


ALTER TABLE content.artwork_keywords OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 25800)
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
-- TOC entry 237 (class 1259 OID 25812)
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
-- TOC entry 4290 (class 0 OID 0)
-- Dependencies: 237
-- Name: artwork_reference_seq; Type: SEQUENCE OWNED BY; Schema: content; Owner: postgres
--

ALTER SEQUENCE content.artwork_reference_seq OWNED BY content.artwork.reference;


--
-- TOC entry 238 (class 1259 OID 25813)
-- Name: artwork_techniques; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.artwork_techniques (
    id_artwork bigint NOT NULL,
    id_technique bigint NOT NULL
);


ALTER TABLE content.artwork_techniques OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 25818)
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
-- TOC entry 240 (class 1259 OID 25835)
-- Name: contact_category; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.contact_category (
    id_contact_category smallint NOT NULL,
    name character varying(50) CONSTRAINT contact_category_value_not_null NOT NULL
);


ALTER TABLE content.contact_category OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 25840)
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
-- TOC entry 242 (class 1259 OID 25841)
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
-- TOC entry 243 (class 1259 OID 25842)
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
-- TOC entry 244 (class 1259 OID 25853)
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
-- TOC entry 327 (class 1259 OID 27093)
-- Name: people_mapper; Type: TABLE; Schema: content; Owner: postgres
--

CREATE TABLE content.people_mapper (
    id_person_mapper bigint CONSTRAINT customer_id_customer_not_null NOT NULL,
    id_person bigint CONSTRAINT customer_id_person_not_null NOT NULL,
    id_public uuid DEFAULT uuidv7() CONSTRAINT customer_id_public_not_null NOT NULL,
    system_source character varying(50) CONSTRAINT customer_system_source_not_null NOT NULL,
    id_customer_source character varying(255) CONSTRAINT customer_id_customer_source_not_null NOT NULL,
    is_professional boolean CONSTRAINT customer_is_professional_not_null NOT NULL,
    is_abroad boolean CONSTRAINT customer_is_abroad_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT customer_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT customer_updated_at_not_null NOT NULL,
    source_data jsonb,
    is_verified boolean NOT NULL
);


ALTER TABLE content.people_mapper OWNER TO postgres;

--
-- TOC entry 4291 (class 0 OID 0)
-- Dependencies: 327
-- Name: COLUMN people_mapper.source_data; Type: COMMENT; Schema: content; Owner: postgres
--

COMMENT ON COLUMN content.people_mapper.source_data IS 'includes name, firstname, lastname, email and siret if required';


--
-- TOC entry 328 (class 1259 OID 27111)
-- Name: customer_id_customer_seq; Type: SEQUENCE; Schema: content; Owner: postgres
--

ALTER TABLE content.people_mapper ALTER COLUMN id_person_mapper ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME content.customer_id_customer_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 245 (class 1259 OID 25854)
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
-- TOC entry 246 (class 1259 OID 25866)
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
-- TOC entry 247 (class 1259 OID 25875)
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
-- TOC entry 248 (class 1259 OID 25876)
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
-- TOC entry 249 (class 1259 OID 25877)
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
-- TOC entry 250 (class 1259 OID 25885)
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
