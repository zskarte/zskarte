--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.4

-- Started on 2025-01-23 15:13:22 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 40850)
-- Name: accesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accesses (
    id integer NOT NULL,
    access_token character varying(255),
    type character varying(255),
    name character varying(255),
    active boolean,
    expires_on timestamp(6) without time zone,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.accesses OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 40855)
-- Name: accesses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accesses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accesses_id_seq OWNER TO postgres;

--
-- TOC entry 4318 (class 0 OID 0)
-- Dependencies: 216
-- Name: accesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accesses_id_seq OWNED BY public.accesses.id;


--
-- TOC entry 217 (class 1259 OID 40856)
-- Name: accesses_operation_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accesses_operation_lnk (
    id integer NOT NULL,
    access_id integer,
    operation_id integer
);


ALTER TABLE public.accesses_operation_lnk OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 40859)
-- Name: accesses_operation_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accesses_operation_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accesses_operation_links_id_seq OWNER TO postgres;

--
-- TOC entry 4319 (class 0 OID 0)
-- Dependencies: 218
-- Name: accesses_operation_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accesses_operation_links_id_seq OWNED BY public.accesses_operation_lnk.id;


--
-- TOC entry 219 (class 1259 OID 40860)
-- Name: admin_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_permissions (
    id integer NOT NULL,
    action character varying(255),
    action_parameters jsonb,
    subject character varying(255),
    properties jsonb,
    conditions jsonb,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.admin_permissions OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 40865)
-- Name: admin_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_permissions_id_seq OWNER TO postgres;

--
-- TOC entry 4320 (class 0 OID 0)
-- Dependencies: 220
-- Name: admin_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_permissions_id_seq OWNED BY public.admin_permissions.id;


--
-- TOC entry 221 (class 1259 OID 40866)
-- Name: admin_permissions_role_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_permissions_role_lnk (
    id integer NOT NULL,
    permission_id integer,
    role_id integer,
    permission_ord double precision
);


ALTER TABLE public.admin_permissions_role_lnk OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 40869)
-- Name: admin_permissions_role_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_permissions_role_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_permissions_role_links_id_seq OWNER TO postgres;

--
-- TOC entry 4321 (class 0 OID 0)
-- Dependencies: 222
-- Name: admin_permissions_role_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_permissions_role_links_id_seq OWNED BY public.admin_permissions_role_lnk.id;


--
-- TOC entry 223 (class 1259 OID 40870)
-- Name: admin_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_roles (
    id integer NOT NULL,
    name character varying(255),
    code character varying(255),
    description character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.admin_roles OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 40875)
-- Name: admin_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_roles_id_seq OWNER TO postgres;

--
-- TOC entry 4322 (class 0 OID 0)
-- Dependencies: 224
-- Name: admin_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_roles_id_seq OWNED BY public.admin_roles.id;


--
-- TOC entry 225 (class 1259 OID 40876)
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    firstname character varying(255),
    lastname character varying(255),
    username character varying(255),
    email character varying(255),
    password character varying(255),
    reset_password_token character varying(255),
    registration_token character varying(255),
    is_active boolean,
    blocked boolean,
    prefered_language character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 40881)
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_users_id_seq OWNER TO postgres;

--
-- TOC entry 4323 (class 0 OID 0)
-- Dependencies: 226
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- TOC entry 227 (class 1259 OID 40882)
-- Name: admin_users_roles_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users_roles_lnk (
    id integer NOT NULL,
    user_id integer,
    role_id integer,
    role_ord double precision,
    user_ord double precision
);


ALTER TABLE public.admin_users_roles_lnk OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 40885)
-- Name: admin_users_roles_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_users_roles_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_users_roles_links_id_seq OWNER TO postgres;

--
-- TOC entry 4324 (class 0 OID 0)
-- Dependencies: 228
-- Name: admin_users_roles_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_users_roles_links_id_seq OWNED BY public.admin_users_roles_lnk.id;


--
-- TOC entry 229 (class 1259 OID 40886)
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files (
    id integer NOT NULL,
    name character varying(255),
    alternative_text character varying(255),
    caption character varying(255),
    width integer,
    height integer,
    formats jsonb,
    hash character varying(255),
    ext character varying(255),
    mime character varying(255),
    size numeric(10,2),
    url character varying(255),
    preview_url character varying(255),
    provider character varying(255),
    provider_metadata jsonb,
    folder_path character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.files OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 40891)
-- Name: files_folder_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files_folder_lnk (
    id integer NOT NULL,
    file_id integer,
    folder_id integer,
    file_ord double precision
);


ALTER TABLE public.files_folder_lnk OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 40894)
-- Name: files_folder_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.files_folder_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.files_folder_links_id_seq OWNER TO postgres;

--
-- TOC entry 4325 (class 0 OID 0)
-- Dependencies: 231
-- Name: files_folder_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.files_folder_links_id_seq OWNED BY public.files_folder_lnk.id;


--
-- TOC entry 232 (class 1259 OID 40895)
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.files_id_seq OWNER TO postgres;

--
-- TOC entry 4326 (class 0 OID 0)
-- Dependencies: 232
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- TOC entry 233 (class 1259 OID 40896)
-- Name: files_related_mph; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files_related_mph (
    id integer NOT NULL,
    file_id integer,
    related_id integer,
    related_type character varying(255),
    field character varying(255),
    "order" double precision
);


ALTER TABLE public.files_related_mph OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 40901)
-- Name: files_related_morphs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.files_related_morphs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.files_related_morphs_id_seq OWNER TO postgres;

--
-- TOC entry 4327 (class 0 OID 0)
-- Dependencies: 234
-- Name: files_related_morphs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.files_related_morphs_id_seq OWNED BY public.files_related_mph.id;


--
-- TOC entry 235 (class 1259 OID 40902)
-- Name: i18n_locale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.i18n_locale (
    id integer NOT NULL,
    name character varying(255),
    code character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.i18n_locale OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 40907)
-- Name: i18n_locale_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.i18n_locale_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.i18n_locale_id_seq OWNER TO postgres;

--
-- TOC entry 4328 (class 0 OID 0)
-- Dependencies: 236
-- Name: i18n_locale_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.i18n_locale_id_seq OWNED BY public.i18n_locale.id;


--
-- TOC entry 237 (class 1259 OID 40908)
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entries (
    id integer NOT NULL,
    sender character varying(255),
    creator character varying(255),
    message_number integer,
    communication_type character varying(255),
    communication_details character varying(255),
    message_subject character varying(255),
    message_content text,
    visum_message character varying(255),
    is_key_message boolean,
    department character varying(255),
    visum_triage character varying(255),
    decision text,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    published_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    entry_status character varying(255),
    date_message timestamp(6) without time zone,
    date_triage timestamp(6) without time zone,
    date_decision timestamp(6) without time zone,
    date_decision_delivered timestamp(6) without time zone,
    visum_decider character varying(255),
    decision_receiver character varying(255),
    decision_sender character varying(255),
    is_drawn_on_map boolean
);


ALTER TABLE public.journal_entries OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 40913)
-- Name: journal_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journal_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_entries_id_seq OWNER TO postgres;

--
-- TOC entry 4329 (class 0 OID 0)
-- Dependencies: 238
-- Name: journal_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journal_entries_id_seq OWNED BY public.journal_entries.id;


--
-- TOC entry 239 (class 1259 OID 40914)
-- Name: journal_entries_operation_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entries_operation_lnk (
    id integer NOT NULL,
    journal_entry_id integer,
    operation_id integer
);


ALTER TABLE public.journal_entries_operation_lnk OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 40917)
-- Name: journal_entries_operation_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journal_entries_operation_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_entries_operation_links_id_seq OWNER TO postgres;

--
-- TOC entry 4330 (class 0 OID 0)
-- Dependencies: 240
-- Name: journal_entries_operation_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journal_entries_operation_links_id_seq OWNED BY public.journal_entries_operation_lnk.id;


--
-- TOC entry 241 (class 1259 OID 40918)
-- Name: journal_entries_organization_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entries_organization_lnk (
    id integer NOT NULL,
    journal_entry_id integer,
    organization_id integer
);


ALTER TABLE public.journal_entries_organization_lnk OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 40921)
-- Name: journal_entries_organization_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journal_entries_organization_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_entries_organization_links_id_seq OWNER TO postgres;

--
-- TOC entry 4331 (class 0 OID 0)
-- Dependencies: 242
-- Name: journal_entries_organization_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journal_entries_organization_links_id_seq OWNED BY public.journal_entries_organization_lnk.id;


--
-- TOC entry 243 (class 1259 OID 40922)
-- Name: map_layers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.map_layers (
    id integer NOT NULL,
    label character varying(255),
    server_layer_name text,
    type character varying(255),
    custom_source character varying(255),
    options jsonb,
    public boolean,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.map_layers OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 40927)
-- Name: map_layers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.map_layers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.map_layers_id_seq OWNER TO postgres;

--
-- TOC entry 4332 (class 0 OID 0)
-- Dependencies: 244
-- Name: map_layers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.map_layers_id_seq OWNED BY public.map_layers.id;


--
-- TOC entry 245 (class 1259 OID 40928)
-- Name: map_layers_organization_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.map_layers_organization_lnk (
    id integer NOT NULL,
    map_layer_id integer,
    organization_id integer
);


ALTER TABLE public.map_layers_organization_lnk OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 40931)
-- Name: map_layers_organization_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.map_layers_organization_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.map_layers_organization_links_id_seq OWNER TO postgres;

--
-- TOC entry 4333 (class 0 OID 0)
-- Dependencies: 246
-- Name: map_layers_organization_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.map_layers_organization_links_id_seq OWNED BY public.map_layers_organization_lnk.id;


--
-- TOC entry 247 (class 1259 OID 40932)
-- Name: map_layers_wms_source_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.map_layers_wms_source_lnk (
    id integer NOT NULL,
    map_layer_id integer,
    wms_source_id integer,
    map_layer_ord double precision
);


ALTER TABLE public.map_layers_wms_source_lnk OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 40935)
-- Name: map_layers_wms_source_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.map_layers_wms_source_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.map_layers_wms_source_links_id_seq OWNER TO postgres;

--
-- TOC entry 4334 (class 0 OID 0)
-- Dependencies: 248
-- Name: map_layers_wms_source_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.map_layers_wms_source_links_id_seq OWNED BY public.map_layers_wms_source_lnk.id;


--
-- TOC entry 249 (class 1259 OID 40936)
-- Name: map_snapshots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.map_snapshots (
    id integer NOT NULL,
    map_state jsonb,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    published_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255)
);


ALTER TABLE public.map_snapshots OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 40941)
-- Name: map_snapshots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.map_snapshots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.map_snapshots_id_seq OWNER TO postgres;

--
-- TOC entry 4335 (class 0 OID 0)
-- Dependencies: 250
-- Name: map_snapshots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.map_snapshots_id_seq OWNED BY public.map_snapshots.id;


--
-- TOC entry 251 (class 1259 OID 40942)
-- Name: map_snapshots_operation_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.map_snapshots_operation_lnk (
    id integer NOT NULL,
    map_snapshot_id integer,
    operation_id integer,
    map_snapshot_ord double precision
);


ALTER TABLE public.map_snapshots_operation_lnk OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 40945)
-- Name: map_snapshots_operation_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.map_snapshots_operation_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.map_snapshots_operation_links_id_seq OWNER TO postgres;

--
-- TOC entry 4336 (class 0 OID 0)
-- Dependencies: 252
-- Name: map_snapshots_operation_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.map_snapshots_operation_links_id_seq OWNED BY public.map_snapshots_operation_lnk.id;


--
-- TOC entry 253 (class 1259 OID 40946)
-- Name: operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operations (
    id integer NOT NULL,
    name character varying(255),
    description text,
    status character varying(255),
    map_state jsonb,
    event_states jsonb,
    map_layers jsonb,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone,
    phase character varying(255)
);


ALTER TABLE public.operations OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 40951)
-- Name: operations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.operations_id_seq OWNER TO postgres;

--
-- TOC entry 4337 (class 0 OID 0)
-- Dependencies: 254
-- Name: operations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operations_id_seq OWNED BY public.operations.id;


--
-- TOC entry 255 (class 1259 OID 40952)
-- Name: operations_organization_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operations_organization_lnk (
    id integer NOT NULL,
    operation_id integer,
    organization_id integer,
    operation_ord double precision
);


ALTER TABLE public.operations_organization_lnk OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 40955)
-- Name: operations_organization_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operations_organization_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.operations_organization_links_id_seq OWNER TO postgres;

--
-- TOC entry 4338 (class 0 OID 0)
-- Dependencies: 256
-- Name: operations_organization_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operations_organization_links_id_seq OWNED BY public.operations_organization_lnk.id;


--
-- TOC entry 257 (class 1259 OID 40956)
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying(255),
    map_longitude double precision,
    map_latitude double precision,
    map_zoom_level numeric(10,2),
    default_locale character varying(255),
    url character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 40961)
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizations_id_seq OWNER TO postgres;

--
-- TOC entry 4339 (class 0 OID 0)
-- Dependencies: 258
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- TOC entry 259 (class 1259 OID 40962)
-- Name: organizations_map_layer_favorites_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations_map_layer_favorites_lnk (
    id integer NOT NULL,
    organization_id integer,
    map_layer_id integer,
    map_layer_ord double precision
);


ALTER TABLE public.organizations_map_layer_favorites_lnk OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 40965)
-- Name: organizations_map_layer_favorites_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizations_map_layer_favorites_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizations_map_layer_favorites_links_id_seq OWNER TO postgres;

--
-- TOC entry 4340 (class 0 OID 0)
-- Dependencies: 260
-- Name: organizations_map_layer_favorites_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizations_map_layer_favorites_links_id_seq OWNED BY public.organizations_map_layer_favorites_lnk.id;


--
-- TOC entry 261 (class 1259 OID 40966)
-- Name: organizations_wms_sources_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations_wms_sources_lnk (
    id integer NOT NULL,
    organization_id integer,
    wms_source_id integer,
    wms_source_ord double precision
);


ALTER TABLE public.organizations_wms_sources_lnk OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 40969)
-- Name: organizations_wms_sources_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizations_wms_sources_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizations_wms_sources_links_id_seq OWNER TO postgres;

--
-- TOC entry 4341 (class 0 OID 0)
-- Dependencies: 262
-- Name: organizations_wms_sources_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizations_wms_sources_links_id_seq OWNED BY public.organizations_wms_sources_lnk.id;


--
-- TOC entry 263 (class 1259 OID 40970)
-- Name: strapi_api_token_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_api_token_permissions (
    id integer NOT NULL,
    action character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.strapi_api_token_permissions OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 40975)
-- Name: strapi_api_token_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_api_token_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_api_token_permissions_id_seq OWNER TO postgres;

--
-- TOC entry 4342 (class 0 OID 0)
-- Dependencies: 264
-- Name: strapi_api_token_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_api_token_permissions_id_seq OWNED BY public.strapi_api_token_permissions.id;


--
-- TOC entry 265 (class 1259 OID 40976)
-- Name: strapi_api_token_permissions_token_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_api_token_permissions_token_lnk (
    id integer NOT NULL,
    api_token_permission_id integer,
    api_token_id integer,
    api_token_permission_ord double precision
);


ALTER TABLE public.strapi_api_token_permissions_token_lnk OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 40979)
-- Name: strapi_api_token_permissions_token_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_api_token_permissions_token_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_api_token_permissions_token_links_id_seq OWNER TO postgres;

--
-- TOC entry 4343 (class 0 OID 0)
-- Dependencies: 266
-- Name: strapi_api_token_permissions_token_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_api_token_permissions_token_links_id_seq OWNED BY public.strapi_api_token_permissions_token_lnk.id;


--
-- TOC entry 267 (class 1259 OID 40980)
-- Name: strapi_api_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_api_tokens (
    id integer NOT NULL,
    name character varying(255),
    description character varying(255),
    type character varying(255),
    access_key character varying(255),
    last_used_at timestamp(6) without time zone,
    expires_at timestamp(6) without time zone,
    lifespan bigint,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.strapi_api_tokens OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 40985)
-- Name: strapi_api_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_api_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_api_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 4344 (class 0 OID 0)
-- Dependencies: 268
-- Name: strapi_api_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_api_tokens_id_seq OWNED BY public.strapi_api_tokens.id;


--
-- TOC entry 269 (class 1259 OID 40986)
-- Name: strapi_core_store_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_core_store_settings (
    id integer NOT NULL,
    key character varying(255),
    value text,
    type character varying(255),
    environment character varying(255),
    tag character varying(255)
);


ALTER TABLE public.strapi_core_store_settings OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 40991)
-- Name: strapi_core_store_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_core_store_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_core_store_settings_id_seq OWNER TO postgres;

--
-- TOC entry 4345 (class 0 OID 0)
-- Dependencies: 270
-- Name: strapi_core_store_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_core_store_settings_id_seq OWNED BY public.strapi_core_store_settings.id;


--
-- TOC entry 271 (class 1259 OID 40992)
-- Name: strapi_database_schema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_database_schema (
    id integer NOT NULL,
    schema json,
    "time" timestamp without time zone,
    hash character varying(255)
);


ALTER TABLE public.strapi_database_schema OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 40997)
-- Name: strapi_database_schema_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_database_schema_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_database_schema_id_seq OWNER TO postgres;

--
-- TOC entry 4346 (class 0 OID 0)
-- Dependencies: 272
-- Name: strapi_database_schema_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_database_schema_id_seq OWNED BY public.strapi_database_schema.id;


--
-- TOC entry 273 (class 1259 OID 40998)
-- Name: strapi_history_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_history_versions (
    id integer NOT NULL,
    content_type character varying(255) NOT NULL,
    related_document_id character varying(255),
    locale character varying(255),
    status character varying(255),
    data jsonb,
    schema jsonb,
    created_at timestamp(6) without time zone,
    created_by_id integer
);


ALTER TABLE public.strapi_history_versions OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 41003)
-- Name: strapi_history_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_history_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_history_versions_id_seq OWNER TO postgres;

--
-- TOC entry 4347 (class 0 OID 0)
-- Dependencies: 274
-- Name: strapi_history_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_history_versions_id_seq OWNED BY public.strapi_history_versions.id;


--
-- TOC entry 275 (class 1259 OID 41004)
-- Name: strapi_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_migrations (
    id integer NOT NULL,
    name character varying(255),
    "time" timestamp without time zone
);


ALTER TABLE public.strapi_migrations OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 41007)
-- Name: strapi_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_migrations_id_seq OWNER TO postgres;

--
-- TOC entry 4348 (class 0 OID 0)
-- Dependencies: 276
-- Name: strapi_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_migrations_id_seq OWNED BY public.strapi_migrations.id;


--
-- TOC entry 277 (class 1259 OID 41008)
-- Name: strapi_migrations_internal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_migrations_internal (
    id integer NOT NULL,
    name character varying(255),
    "time" timestamp without time zone
);


ALTER TABLE public.strapi_migrations_internal OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 41011)
-- Name: strapi_migrations_internal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_migrations_internal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_migrations_internal_id_seq OWNER TO postgres;

--
-- TOC entry 4349 (class 0 OID 0)
-- Dependencies: 278
-- Name: strapi_migrations_internal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_migrations_internal_id_seq OWNED BY public.strapi_migrations_internal.id;


--
-- TOC entry 279 (class 1259 OID 41012)
-- Name: strapi_release_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_release_actions (
    id integer NOT NULL,
    type character varying(255),
    content_type character varying(255),
    locale character varying(255),
    is_entry_valid boolean,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    published_at timestamp(6) without time zone,
    entry_document_id character varying(255)
);


ALTER TABLE public.strapi_release_actions OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 41017)
-- Name: strapi_release_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_release_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_release_actions_id_seq OWNER TO postgres;

--
-- TOC entry 4350 (class 0 OID 0)
-- Dependencies: 280
-- Name: strapi_release_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_release_actions_id_seq OWNED BY public.strapi_release_actions.id;


--
-- TOC entry 281 (class 1259 OID 41018)
-- Name: strapi_release_actions_release_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_release_actions_release_lnk (
    id integer NOT NULL,
    release_action_id integer,
    release_id integer,
    release_action_ord double precision
);


ALTER TABLE public.strapi_release_actions_release_lnk OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 41021)
-- Name: strapi_release_actions_release_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_release_actions_release_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_release_actions_release_links_id_seq OWNER TO postgres;

--
-- TOC entry 4351 (class 0 OID 0)
-- Dependencies: 282
-- Name: strapi_release_actions_release_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_release_actions_release_links_id_seq OWNED BY public.strapi_release_actions_release_lnk.id;


--
-- TOC entry 283 (class 1259 OID 41022)
-- Name: strapi_releases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_releases (
    id integer NOT NULL,
    name character varying(255),
    released_at timestamp(6) without time zone,
    scheduled_at timestamp(6) without time zone,
    timezone character varying(255),
    status character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.strapi_releases OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 41027)
-- Name: strapi_releases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_releases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_releases_id_seq OWNER TO postgres;

--
-- TOC entry 4352 (class 0 OID 0)
-- Dependencies: 284
-- Name: strapi_releases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_releases_id_seq OWNED BY public.strapi_releases.id;


--
-- TOC entry 285 (class 1259 OID 41028)
-- Name: strapi_transfer_token_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_transfer_token_permissions (
    id integer NOT NULL,
    action character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.strapi_transfer_token_permissions OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 41033)
-- Name: strapi_transfer_token_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_transfer_token_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_transfer_token_permissions_id_seq OWNER TO postgres;

--
-- TOC entry 4353 (class 0 OID 0)
-- Dependencies: 286
-- Name: strapi_transfer_token_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_transfer_token_permissions_id_seq OWNED BY public.strapi_transfer_token_permissions.id;


--
-- TOC entry 287 (class 1259 OID 41034)
-- Name: strapi_transfer_token_permissions_token_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_transfer_token_permissions_token_lnk (
    id integer NOT NULL,
    transfer_token_permission_id integer,
    transfer_token_id integer,
    transfer_token_permission_ord double precision
);


ALTER TABLE public.strapi_transfer_token_permissions_token_lnk OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 41037)
-- Name: strapi_transfer_token_permissions_token_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_transfer_token_permissions_token_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_transfer_token_permissions_token_links_id_seq OWNER TO postgres;

--
-- TOC entry 4354 (class 0 OID 0)
-- Dependencies: 288
-- Name: strapi_transfer_token_permissions_token_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_transfer_token_permissions_token_links_id_seq OWNED BY public.strapi_transfer_token_permissions_token_lnk.id;


--
-- TOC entry 289 (class 1259 OID 41038)
-- Name: strapi_transfer_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_transfer_tokens (
    id integer NOT NULL,
    name character varying(255),
    description character varying(255),
    access_key character varying(255),
    last_used_at timestamp(6) without time zone,
    expires_at timestamp(6) without time zone,
    lifespan bigint,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.strapi_transfer_tokens OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 41043)
-- Name: strapi_transfer_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_transfer_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_transfer_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 4355 (class 0 OID 0)
-- Dependencies: 290
-- Name: strapi_transfer_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_transfer_tokens_id_seq OWNED BY public.strapi_transfer_tokens.id;


--
-- TOC entry 291 (class 1259 OID 41044)
-- Name: strapi_webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_webhooks (
    id integer NOT NULL,
    name character varying(255),
    url text,
    headers jsonb,
    events jsonb,
    enabled boolean
);


ALTER TABLE public.strapi_webhooks OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 41049)
-- Name: strapi_webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_webhooks_id_seq OWNER TO postgres;

--
-- TOC entry 4356 (class 0 OID 0)
-- Dependencies: 292
-- Name: strapi_webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_webhooks_id_seq OWNED BY public.strapi_webhooks.id;


--
-- TOC entry 293 (class 1259 OID 41050)
-- Name: strapi_workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_workflows (
    id integer NOT NULL,
    document_id character varying(255),
    name character varying(255),
    content_types jsonb,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    published_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    locale character varying(255)
);


ALTER TABLE public.strapi_workflows OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 41055)
-- Name: strapi_workflows_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_workflows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_workflows_id_seq OWNER TO postgres;

--
-- TOC entry 4357 (class 0 OID 0)
-- Dependencies: 294
-- Name: strapi_workflows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_workflows_id_seq OWNED BY public.strapi_workflows.id;


--
-- TOC entry 295 (class 1259 OID 41056)
-- Name: strapi_workflows_stage_required_to_publish_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_workflows_stage_required_to_publish_lnk (
    id integer NOT NULL,
    workflow_id integer,
    workflow_stage_id integer
);


ALTER TABLE public.strapi_workflows_stage_required_to_publish_lnk OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 41059)
-- Name: strapi_workflows_stage_required_to_publish_lnk_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_workflows_stage_required_to_publish_lnk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_workflows_stage_required_to_publish_lnk_id_seq OWNER TO postgres;

--
-- TOC entry 4358 (class 0 OID 0)
-- Dependencies: 296
-- Name: strapi_workflows_stage_required_to_publish_lnk_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_workflows_stage_required_to_publish_lnk_id_seq OWNED BY public.strapi_workflows_stage_required_to_publish_lnk.id;


--
-- TOC entry 297 (class 1259 OID 41060)
-- Name: strapi_workflows_stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_workflows_stages (
    id integer NOT NULL,
    document_id character varying(255),
    name character varying(255),
    color character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    published_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    locale character varying(255)
);


ALTER TABLE public.strapi_workflows_stages OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 41065)
-- Name: strapi_workflows_stages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_workflows_stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_workflows_stages_id_seq OWNER TO postgres;

--
-- TOC entry 4359 (class 0 OID 0)
-- Dependencies: 298
-- Name: strapi_workflows_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_workflows_stages_id_seq OWNED BY public.strapi_workflows_stages.id;


--
-- TOC entry 299 (class 1259 OID 41066)
-- Name: strapi_workflows_stages_permissions_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_workflows_stages_permissions_lnk (
    id integer NOT NULL,
    workflow_stage_id integer,
    permission_id integer,
    permission_ord double precision
);


ALTER TABLE public.strapi_workflows_stages_permissions_lnk OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 41069)
-- Name: strapi_workflows_stages_permissions_lnk_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_workflows_stages_permissions_lnk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_workflows_stages_permissions_lnk_id_seq OWNER TO postgres;

--
-- TOC entry 4360 (class 0 OID 0)
-- Dependencies: 300
-- Name: strapi_workflows_stages_permissions_lnk_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_workflows_stages_permissions_lnk_id_seq OWNED BY public.strapi_workflows_stages_permissions_lnk.id;


--
-- TOC entry 301 (class 1259 OID 41070)
-- Name: strapi_workflows_stages_workflow_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strapi_workflows_stages_workflow_lnk (
    id integer NOT NULL,
    workflow_stage_id integer,
    workflow_id integer,
    workflow_stage_ord double precision
);


ALTER TABLE public.strapi_workflows_stages_workflow_lnk OWNER TO postgres;

--
-- TOC entry 302 (class 1259 OID 41073)
-- Name: strapi_workflows_stages_workflow_lnk_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.strapi_workflows_stages_workflow_lnk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.strapi_workflows_stages_workflow_lnk_id_seq OWNER TO postgres;

--
-- TOC entry 4361 (class 0 OID 0)
-- Dependencies: 302
-- Name: strapi_workflows_stages_workflow_lnk_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.strapi_workflows_stages_workflow_lnk_id_seq OWNED BY public.strapi_workflows_stages_workflow_lnk.id;


--
-- TOC entry 303 (class 1259 OID 41074)
-- Name: up_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.up_permissions (
    id integer NOT NULL,
    action character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.up_permissions OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 41079)
-- Name: up_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.up_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.up_permissions_id_seq OWNER TO postgres;

--
-- TOC entry 4362 (class 0 OID 0)
-- Dependencies: 304
-- Name: up_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.up_permissions_id_seq OWNED BY public.up_permissions.id;


--
-- TOC entry 305 (class 1259 OID 41080)
-- Name: up_permissions_role_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.up_permissions_role_lnk (
    id integer NOT NULL,
    permission_id integer,
    role_id integer,
    permission_ord double precision
);


ALTER TABLE public.up_permissions_role_lnk OWNER TO postgres;

--
-- TOC entry 306 (class 1259 OID 41083)
-- Name: up_permissions_role_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.up_permissions_role_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.up_permissions_role_links_id_seq OWNER TO postgres;

--
-- TOC entry 4363 (class 0 OID 0)
-- Dependencies: 306
-- Name: up_permissions_role_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.up_permissions_role_links_id_seq OWNED BY public.up_permissions_role_lnk.id;


--
-- TOC entry 307 (class 1259 OID 41084)
-- Name: up_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.up_roles (
    id integer NOT NULL,
    name character varying(255),
    description character varying(255),
    type character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.up_roles OWNER TO postgres;

--
-- TOC entry 308 (class 1259 OID 41089)
-- Name: up_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.up_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.up_roles_id_seq OWNER TO postgres;

--
-- TOC entry 4364 (class 0 OID 0)
-- Dependencies: 308
-- Name: up_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.up_roles_id_seq OWNED BY public.up_roles.id;


--
-- TOC entry 309 (class 1259 OID 41090)
-- Name: up_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.up_users (
    id integer NOT NULL,
    username character varying(255),
    email character varying(255),
    provider character varying(255),
    password character varying(255),
    reset_password_token character varying(255),
    confirmation_token character varying(255),
    confirmed boolean,
    blocked boolean,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.up_users OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 41095)
-- Name: up_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.up_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.up_users_id_seq OWNER TO postgres;

--
-- TOC entry 4365 (class 0 OID 0)
-- Dependencies: 310
-- Name: up_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.up_users_id_seq OWNED BY public.up_users.id;


--
-- TOC entry 311 (class 1259 OID 41096)
-- Name: up_users_organization_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.up_users_organization_lnk (
    id integer NOT NULL,
    user_id integer,
    organization_id integer,
    user_ord double precision
);


ALTER TABLE public.up_users_organization_lnk OWNER TO postgres;

--
-- TOC entry 312 (class 1259 OID 41099)
-- Name: up_users_organization_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.up_users_organization_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.up_users_organization_links_id_seq OWNER TO postgres;

--
-- TOC entry 4366 (class 0 OID 0)
-- Dependencies: 312
-- Name: up_users_organization_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.up_users_organization_links_id_seq OWNED BY public.up_users_organization_lnk.id;


--
-- TOC entry 313 (class 1259 OID 41100)
-- Name: up_users_role_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.up_users_role_lnk (
    id integer NOT NULL,
    user_id integer,
    role_id integer,
    user_ord double precision
);


ALTER TABLE public.up_users_role_lnk OWNER TO postgres;

--
-- TOC entry 314 (class 1259 OID 41103)
-- Name: up_users_role_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.up_users_role_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.up_users_role_links_id_seq OWNER TO postgres;

--
-- TOC entry 4367 (class 0 OID 0)
-- Dependencies: 314
-- Name: up_users_role_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.up_users_role_links_id_seq OWNED BY public.up_users_role_lnk.id;


--
-- TOC entry 315 (class 1259 OID 41104)
-- Name: upload_folders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upload_folders (
    id integer NOT NULL,
    name character varying(255),
    path_id integer,
    path character varying(255),
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.upload_folders OWNER TO postgres;

--
-- TOC entry 316 (class 1259 OID 41109)
-- Name: upload_folders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.upload_folders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upload_folders_id_seq OWNER TO postgres;

--
-- TOC entry 4368 (class 0 OID 0)
-- Dependencies: 316
-- Name: upload_folders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.upload_folders_id_seq OWNED BY public.upload_folders.id;


--
-- TOC entry 317 (class 1259 OID 41110)
-- Name: upload_folders_parent_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upload_folders_parent_lnk (
    id integer NOT NULL,
    folder_id integer,
    inv_folder_id integer,
    folder_ord double precision
);


ALTER TABLE public.upload_folders_parent_lnk OWNER TO postgres;

--
-- TOC entry 318 (class 1259 OID 41113)
-- Name: upload_folders_parent_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.upload_folders_parent_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upload_folders_parent_links_id_seq OWNER TO postgres;

--
-- TOC entry 4369 (class 0 OID 0)
-- Dependencies: 318
-- Name: upload_folders_parent_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.upload_folders_parent_links_id_seq OWNED BY public.upload_folders_parent_lnk.id;


--
-- TOC entry 319 (class 1259 OID 41114)
-- Name: wms_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wms_sources (
    id integer NOT NULL,
    label character varying(255),
    type character varying(255),
    url character varying(255),
    attribution jsonb,
    public boolean,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    created_by_id integer,
    updated_by_id integer,
    document_id character varying(255),
    locale character varying(255),
    published_at timestamp(6) without time zone
);


ALTER TABLE public.wms_sources OWNER TO postgres;

--
-- TOC entry 320 (class 1259 OID 41119)
-- Name: wms_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wms_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wms_sources_id_seq OWNER TO postgres;

--
-- TOC entry 4370 (class 0 OID 0)
-- Dependencies: 320
-- Name: wms_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wms_sources_id_seq OWNED BY public.wms_sources.id;


--
-- TOC entry 321 (class 1259 OID 41120)
-- Name: wms_sources_organization_lnk; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wms_sources_organization_lnk (
    id integer NOT NULL,
    wms_source_id integer,
    organization_id integer
);


ALTER TABLE public.wms_sources_organization_lnk OWNER TO postgres;

--
-- TOC entry 322 (class 1259 OID 41123)
-- Name: wms_sources_organization_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wms_sources_organization_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wms_sources_organization_links_id_seq OWNER TO postgres;

--
-- TOC entry 4371 (class 0 OID 0)
-- Dependencies: 322
-- Name: wms_sources_organization_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wms_sources_organization_links_id_seq OWNED BY public.wms_sources_organization_lnk.id;


--
-- TOC entry 3468 (class 2604 OID 41124)
-- Name: accesses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses ALTER COLUMN id SET DEFAULT nextval('public.accesses_id_seq'::regclass);


--
-- TOC entry 3469 (class 2604 OID 41125)
-- Name: accesses_operation_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses_operation_lnk ALTER COLUMN id SET DEFAULT nextval('public.accesses_operation_links_id_seq'::regclass);


--
-- TOC entry 3470 (class 2604 OID 41126)
-- Name: admin_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions ALTER COLUMN id SET DEFAULT nextval('public.admin_permissions_id_seq'::regclass);


--
-- TOC entry 3471 (class 2604 OID 41127)
-- Name: admin_permissions_role_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions_role_lnk ALTER COLUMN id SET DEFAULT nextval('public.admin_permissions_role_links_id_seq'::regclass);


--
-- TOC entry 3472 (class 2604 OID 41128)
-- Name: admin_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_roles ALTER COLUMN id SET DEFAULT nextval('public.admin_roles_id_seq'::regclass);


--
-- TOC entry 3473 (class 2604 OID 41129)
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- TOC entry 3474 (class 2604 OID 41130)
-- Name: admin_users_roles_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users_roles_lnk ALTER COLUMN id SET DEFAULT nextval('public.admin_users_roles_links_id_seq'::regclass);


--
-- TOC entry 3475 (class 2604 OID 41131)
-- Name: files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- TOC entry 3476 (class 2604 OID 41132)
-- Name: files_folder_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_folder_lnk ALTER COLUMN id SET DEFAULT nextval('public.files_folder_links_id_seq'::regclass);


--
-- TOC entry 3477 (class 2604 OID 41133)
-- Name: files_related_mph id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_related_mph ALTER COLUMN id SET DEFAULT nextval('public.files_related_morphs_id_seq'::regclass);


--
-- TOC entry 3478 (class 2604 OID 41134)
-- Name: i18n_locale id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.i18n_locale ALTER COLUMN id SET DEFAULT nextval('public.i18n_locale_id_seq'::regclass);


--
-- TOC entry 3479 (class 2604 OID 41135)
-- Name: journal_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries ALTER COLUMN id SET DEFAULT nextval('public.journal_entries_id_seq'::regclass);


--
-- TOC entry 3480 (class 2604 OID 41136)
-- Name: journal_entries_operation_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_operation_lnk ALTER COLUMN id SET DEFAULT nextval('public.journal_entries_operation_links_id_seq'::regclass);


--
-- TOC entry 3481 (class 2604 OID 41137)
-- Name: journal_entries_organization_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_organization_lnk ALTER COLUMN id SET DEFAULT nextval('public.journal_entries_organization_links_id_seq'::regclass);


--
-- TOC entry 3482 (class 2604 OID 41138)
-- Name: map_layers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers ALTER COLUMN id SET DEFAULT nextval('public.map_layers_id_seq'::regclass);


--
-- TOC entry 3483 (class 2604 OID 41139)
-- Name: map_layers_organization_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_organization_lnk ALTER COLUMN id SET DEFAULT nextval('public.map_layers_organization_links_id_seq'::regclass);


--
-- TOC entry 3484 (class 2604 OID 41140)
-- Name: map_layers_wms_source_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_wms_source_lnk ALTER COLUMN id SET DEFAULT nextval('public.map_layers_wms_source_links_id_seq'::regclass);


--
-- TOC entry 3485 (class 2604 OID 41141)
-- Name: map_snapshots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots ALTER COLUMN id SET DEFAULT nextval('public.map_snapshots_id_seq'::regclass);


--
-- TOC entry 3486 (class 2604 OID 41142)
-- Name: map_snapshots_operation_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots_operation_lnk ALTER COLUMN id SET DEFAULT nextval('public.map_snapshots_operation_links_id_seq'::regclass);


--
-- TOC entry 3487 (class 2604 OID 41143)
-- Name: operations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations ALTER COLUMN id SET DEFAULT nextval('public.operations_id_seq'::regclass);


--
-- TOC entry 3488 (class 2604 OID 41144)
-- Name: operations_organization_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations_organization_lnk ALTER COLUMN id SET DEFAULT nextval('public.operations_organization_links_id_seq'::regclass);


--
-- TOC entry 3489 (class 2604 OID 41145)
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- TOC entry 3490 (class 2604 OID 41146)
-- Name: organizations_map_layer_favorites_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_map_layer_favorites_lnk ALTER COLUMN id SET DEFAULT nextval('public.organizations_map_layer_favorites_links_id_seq'::regclass);


--
-- TOC entry 3491 (class 2604 OID 41147)
-- Name: organizations_wms_sources_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_wms_sources_lnk ALTER COLUMN id SET DEFAULT nextval('public.organizations_wms_sources_links_id_seq'::regclass);


--
-- TOC entry 3492 (class 2604 OID 41148)
-- Name: strapi_api_token_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions ALTER COLUMN id SET DEFAULT nextval('public.strapi_api_token_permissions_id_seq'::regclass);


--
-- TOC entry 3493 (class 2604 OID 41149)
-- Name: strapi_api_token_permissions_token_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions_token_lnk ALTER COLUMN id SET DEFAULT nextval('public.strapi_api_token_permissions_token_links_id_seq'::regclass);


--
-- TOC entry 3494 (class 2604 OID 41150)
-- Name: strapi_api_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_tokens ALTER COLUMN id SET DEFAULT nextval('public.strapi_api_tokens_id_seq'::regclass);


--
-- TOC entry 3495 (class 2604 OID 41151)
-- Name: strapi_core_store_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_core_store_settings ALTER COLUMN id SET DEFAULT nextval('public.strapi_core_store_settings_id_seq'::regclass);


--
-- TOC entry 3496 (class 2604 OID 41152)
-- Name: strapi_database_schema id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_database_schema ALTER COLUMN id SET DEFAULT nextval('public.strapi_database_schema_id_seq'::regclass);


--
-- TOC entry 3497 (class 2604 OID 41153)
-- Name: strapi_history_versions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_history_versions ALTER COLUMN id SET DEFAULT nextval('public.strapi_history_versions_id_seq'::regclass);


--
-- TOC entry 3498 (class 2604 OID 41154)
-- Name: strapi_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_migrations ALTER COLUMN id SET DEFAULT nextval('public.strapi_migrations_id_seq'::regclass);


--
-- TOC entry 3499 (class 2604 OID 41155)
-- Name: strapi_migrations_internal id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_migrations_internal ALTER COLUMN id SET DEFAULT nextval('public.strapi_migrations_internal_id_seq'::regclass);


--
-- TOC entry 3500 (class 2604 OID 41156)
-- Name: strapi_release_actions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions ALTER COLUMN id SET DEFAULT nextval('public.strapi_release_actions_id_seq'::regclass);


--
-- TOC entry 3501 (class 2604 OID 41157)
-- Name: strapi_release_actions_release_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions_release_lnk ALTER COLUMN id SET DEFAULT nextval('public.strapi_release_actions_release_links_id_seq'::regclass);


--
-- TOC entry 3502 (class 2604 OID 41158)
-- Name: strapi_releases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_releases ALTER COLUMN id SET DEFAULT nextval('public.strapi_releases_id_seq'::regclass);


--
-- TOC entry 3503 (class 2604 OID 41159)
-- Name: strapi_transfer_token_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions ALTER COLUMN id SET DEFAULT nextval('public.strapi_transfer_token_permissions_id_seq'::regclass);


--
-- TOC entry 3504 (class 2604 OID 41160)
-- Name: strapi_transfer_token_permissions_token_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions_token_lnk ALTER COLUMN id SET DEFAULT nextval('public.strapi_transfer_token_permissions_token_links_id_seq'::regclass);


--
-- TOC entry 3505 (class 2604 OID 41161)
-- Name: strapi_transfer_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_tokens ALTER COLUMN id SET DEFAULT nextval('public.strapi_transfer_tokens_id_seq'::regclass);


--
-- TOC entry 3506 (class 2604 OID 41162)
-- Name: strapi_webhooks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_webhooks ALTER COLUMN id SET DEFAULT nextval('public.strapi_webhooks_id_seq'::regclass);


--
-- TOC entry 3507 (class 2604 OID 41163)
-- Name: strapi_workflows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows ALTER COLUMN id SET DEFAULT nextval('public.strapi_workflows_id_seq'::regclass);


--
-- TOC entry 3508 (class 2604 OID 41164)
-- Name: strapi_workflows_stage_required_to_publish_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stage_required_to_publish_lnk ALTER COLUMN id SET DEFAULT nextval('public.strapi_workflows_stage_required_to_publish_lnk_id_seq'::regclass);


--
-- TOC entry 3509 (class 2604 OID 41165)
-- Name: strapi_workflows_stages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages ALTER COLUMN id SET DEFAULT nextval('public.strapi_workflows_stages_id_seq'::regclass);


--
-- TOC entry 3510 (class 2604 OID 41166)
-- Name: strapi_workflows_stages_permissions_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages_permissions_lnk ALTER COLUMN id SET DEFAULT nextval('public.strapi_workflows_stages_permissions_lnk_id_seq'::regclass);


--
-- TOC entry 3511 (class 2604 OID 41167)
-- Name: strapi_workflows_stages_workflow_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages_workflow_lnk ALTER COLUMN id SET DEFAULT nextval('public.strapi_workflows_stages_workflow_lnk_id_seq'::regclass);


--
-- TOC entry 3512 (class 2604 OID 41168)
-- Name: up_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions ALTER COLUMN id SET DEFAULT nextval('public.up_permissions_id_seq'::regclass);


--
-- TOC entry 3513 (class 2604 OID 41169)
-- Name: up_permissions_role_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions_role_lnk ALTER COLUMN id SET DEFAULT nextval('public.up_permissions_role_links_id_seq'::regclass);


--
-- TOC entry 3514 (class 2604 OID 41170)
-- Name: up_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_roles ALTER COLUMN id SET DEFAULT nextval('public.up_roles_id_seq'::regclass);


--
-- TOC entry 3515 (class 2604 OID 41171)
-- Name: up_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users ALTER COLUMN id SET DEFAULT nextval('public.up_users_id_seq'::regclass);


--
-- TOC entry 3516 (class 2604 OID 41172)
-- Name: up_users_organization_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_organization_lnk ALTER COLUMN id SET DEFAULT nextval('public.up_users_organization_links_id_seq'::regclass);


--
-- TOC entry 3517 (class 2604 OID 41173)
-- Name: up_users_role_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_role_lnk ALTER COLUMN id SET DEFAULT nextval('public.up_users_role_links_id_seq'::regclass);


--
-- TOC entry 3518 (class 2604 OID 41174)
-- Name: upload_folders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders ALTER COLUMN id SET DEFAULT nextval('public.upload_folders_id_seq'::regclass);


--
-- TOC entry 3519 (class 2604 OID 41175)
-- Name: upload_folders_parent_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders_parent_lnk ALTER COLUMN id SET DEFAULT nextval('public.upload_folders_parent_links_id_seq'::regclass);


--
-- TOC entry 3520 (class 2604 OID 41176)
-- Name: wms_sources id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources ALTER COLUMN id SET DEFAULT nextval('public.wms_sources_id_seq'::regclass);


--
-- TOC entry 3521 (class 2604 OID 41177)
-- Name: wms_sources_organization_lnk id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources_organization_lnk ALTER COLUMN id SET DEFAULT nextval('public.wms_sources_organization_links_id_seq'::regclass);


--
-- TOC entry 4205 (class 0 OID 40850)
-- Dependencies: 215
-- Data for Name: accesses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accesses (id, access_token, type, name, active, expires_on, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
8	d0dc2ddb2326fbb3e4b75c8bbb6ca972	write	\N	t	\N	2025-01-22 08:07:52.667	2025-01-22 08:07:52.667	\N	\N	jd8txhk1dfwmqq16503s38jt	\N	2025-01-22 13:42:13.658
9	sadsadsadsa	read	\N	t	\N	2025-01-22 15:32:17.606	2025-01-22 15:32:17.606	1	1	ezpvt389uh61tsd35atitohw	\N	2025-01-22 15:32:17.601
\.


--
-- TOC entry 4207 (class 0 OID 40856)
-- Dependencies: 217
-- Data for Name: accesses_operation_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accesses_operation_lnk (id, access_id, operation_id) FROM stdin;
8	8	5
\.


--
-- TOC entry 4209 (class 0 OID 40860)
-- Dependencies: 219
-- Data for Name: admin_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_permissions (id, action, action_parameters, subject, properties, conditions, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
1	plugin::content-manager.explorer.create	{}	api::access.access	{"fields": ["accessToken", "operation", "type", "name", "active", "expiresOn"]}	[]	2025-01-14 17:38:53.108	2025-01-14 17:38:53.108	\N	\N	dfdipxutnbh01tkcriqqq8s1	\N	2025-01-22 13:42:13.677
2	plugin::content-manager.explorer.create	{}	api::map-layer.map-layer	{"fields": ["label", "serverLayerName", "type", "wms_source", "custom_source", "options", "public", "organization"]}	[]	2025-01-14 17:38:53.113	2025-01-14 17:38:53.113	\N	\N	rmeemlu4rspog4k627tm11yx	\N	2025-01-22 13:42:13.677
3	plugin::content-manager.explorer.create	{}	api::map-snapshot.map-snapshot	{"fields": ["mapState", "operation"]}	[]	2025-01-14 17:38:53.115	2025-01-14 17:38:53.115	\N	\N	w098zkj1ha74li64tj9f5nz2	\N	2025-01-22 13:42:13.677
5	plugin::content-manager.explorer.create	{}	api::organization.organization	{"fields": ["name", "mapLongitude", "mapLatitude", "mapZoomLevel", "defaultLocale", "url", "logo", "operations", "users", "wms_sources", "map_layer_favorites"]}	[]	2025-01-14 17:38:53.12	2025-01-14 17:38:53.12	\N	\N	ttkbcisve794ic88yakwsjxi	\N	2025-01-22 13:42:13.677
6	plugin::content-manager.explorer.create	{}	api::wms-source.wms-source	{"fields": ["label", "type", "url", "attribution", "public", "organization", "map_layers"]}	[]	2025-01-14 17:38:53.122	2025-01-14 17:38:53.122	\N	\N	f92cj468552mshy9mm8tc4pi	\N	2025-01-22 13:42:13.677
7	plugin::content-manager.explorer.read	{}	api::access.access	{"fields": ["accessToken", "operation", "type", "name", "active", "expiresOn"]}	[]	2025-01-14 17:38:53.125	2025-01-14 17:38:53.125	\N	\N	dyw3wtfjmjz6esg9yvaenm2o	\N	2025-01-22 13:42:13.677
8	plugin::content-manager.explorer.read	{}	api::map-layer.map-layer	{"fields": ["label", "serverLayerName", "type", "wms_source", "custom_source", "options", "public", "organization"]}	[]	2025-01-14 17:38:53.127	2025-01-14 17:38:53.127	\N	\N	iz39q4hgxh3hxz3crqm088v3	\N	2025-01-22 13:42:13.677
9	plugin::content-manager.explorer.read	{}	api::map-snapshot.map-snapshot	{"fields": ["mapState", "operation"]}	[]	2025-01-14 17:38:53.129	2025-01-14 17:38:53.129	\N	\N	at8tb1fipt1qji7h34cvqeqa	\N	2025-01-22 13:42:13.677
19	plugin::content-manager.explorer.delete	{}	api::access.access	{}	[]	2025-01-14 17:38:53.149	2025-01-14 17:38:53.149	\N	\N	xuqy2tbbw38gf4ai0evfgk6s	\N	2025-01-22 13:42:13.677
94	plugin::content-type-builder.read	{}	\N	{}	[]	2025-01-14 17:38:53.322	2025-01-14 17:38:53.322	\N	\N	vn6nrvxhmfx69x5mhjq8lfz9	\N	2025-01-22 13:42:13.677
11	plugin::content-manager.explorer.read	{}	api::organization.organization	{"fields": ["name", "mapLongitude", "mapLatitude", "mapZoomLevel", "defaultLocale", "url", "logo", "operations", "users", "wms_sources", "map_layer_favorites"]}	[]	2025-01-14 17:38:53.133	2025-01-14 17:38:53.133	\N	\N	syzz7mmfoai4cx6xvhfcdhkt	\N	2025-01-22 13:42:13.677
12	plugin::content-manager.explorer.read	{}	api::wms-source.wms-source	{"fields": ["label", "type", "url", "attribution", "public", "organization", "map_layers"]}	[]	2025-01-14 17:38:53.135	2025-01-14 17:38:53.135	\N	\N	bef9j1a1c7xsl27uni01o74b	\N	2025-01-22 13:42:13.677
13	plugin::content-manager.explorer.update	{}	api::access.access	{"fields": ["accessToken", "operation", "type", "name", "active", "expiresOn"]}	[]	2025-01-14 17:38:53.137	2025-01-14 17:38:53.137	\N	\N	fj2rwm3yh8az7j9j4jswe1kz	\N	2025-01-22 13:42:13.677
14	plugin::content-manager.explorer.update	{}	api::map-layer.map-layer	{"fields": ["label", "serverLayerName", "type", "wms_source", "custom_source", "options", "public", "organization"]}	[]	2025-01-14 17:38:53.139	2025-01-14 17:38:53.139	\N	\N	xbt19cled4wsym766nd1xoa7	\N	2025-01-22 13:42:13.677
15	plugin::content-manager.explorer.update	{}	api::map-snapshot.map-snapshot	{"fields": ["mapState", "operation"]}	[]	2025-01-14 17:38:53.141	2025-01-14 17:38:53.141	\N	\N	any8yenry0c2bqi3pqs6p5yw	\N	2025-01-22 13:42:13.677
17	plugin::content-manager.explorer.update	{}	api::organization.organization	{"fields": ["name", "mapLongitude", "mapLatitude", "mapZoomLevel", "defaultLocale", "url", "logo", "operations", "users", "wms_sources", "map_layer_favorites"]}	[]	2025-01-14 17:38:53.145	2025-01-14 17:38:53.145	\N	\N	esppz6i7imffqqt5rhyop16b	\N	2025-01-22 13:42:13.677
18	plugin::content-manager.explorer.update	{}	api::wms-source.wms-source	{"fields": ["label", "type", "url", "attribution", "public", "organization", "map_layers"]}	[]	2025-01-14 17:38:53.147	2025-01-14 17:38:53.147	\N	\N	kxtxr9qjsjpliqa0sdndk1rh	\N	2025-01-22 13:42:13.677
20	plugin::content-manager.explorer.delete	{}	api::map-layer.map-layer	{}	[]	2025-01-14 17:38:53.151	2025-01-14 17:38:53.151	\N	\N	fygcvk9lill9bq8hdmrwasr0	\N	2025-01-22 13:42:13.677
21	plugin::content-manager.explorer.delete	{}	api::map-snapshot.map-snapshot	{}	[]	2025-01-14 17:38:53.154	2025-01-14 17:38:53.154	\N	\N	uq8ctexxc4iktp4tazdrkel1	\N	2025-01-22 13:42:13.677
22	plugin::content-manager.explorer.delete	{}	api::operation.operation	{}	[]	2025-01-14 17:38:53.156	2025-01-14 17:38:53.156	\N	\N	lvcbj3nim378p2c5iwebk2h0	\N	2025-01-22 13:42:13.677
23	plugin::content-manager.explorer.delete	{}	api::organization.organization	{}	[]	2025-01-14 17:38:53.158	2025-01-14 17:38:53.158	\N	\N	jn6o5t8n1euhqkrs5ec7h0gm	\N	2025-01-22 13:42:13.677
24	plugin::content-manager.explorer.delete	{}	api::wms-source.wms-source	{}	[]	2025-01-14 17:38:53.16	2025-01-14 17:38:53.16	\N	\N	t0tz517i6toiebj4s7aavwru	\N	2025-01-22 13:42:13.677
25	plugin::content-manager.explorer.publish	{}	api::map-snapshot.map-snapshot	{}	[]	2025-01-14 17:38:53.162	2025-01-14 17:38:53.162	\N	\N	lueyuesepik2rgctzpbyiomh	\N	2025-01-22 13:42:13.677
26	plugin::upload.read	{}	\N	{}	[]	2025-01-14 17:38:53.164	2025-01-14 17:38:53.164	\N	\N	fayhmz98hwnaqu29y2sliuc4	\N	2025-01-22 13:42:13.677
27	plugin::upload.configure-view	{}	\N	{}	[]	2025-01-14 17:38:53.166	2025-01-14 17:38:53.166	\N	\N	bn1yiu0drkzys9mawpol53yt	\N	2025-01-22 13:42:13.677
28	plugin::upload.assets.create	{}	\N	{}	[]	2025-01-14 17:38:53.168	2025-01-14 17:38:53.168	\N	\N	oql0hok1yeyy5bxxe50elzyh	\N	2025-01-22 13:42:13.677
29	plugin::upload.assets.update	{}	\N	{}	[]	2025-01-14 17:38:53.17	2025-01-14 17:38:53.17	\N	\N	w9q3nn1droirl0sfgz4o5hg4	\N	2025-01-22 13:42:13.677
30	plugin::upload.assets.download	{}	\N	{}	[]	2025-01-14 17:38:53.172	2025-01-14 17:38:53.172	\N	\N	g7tu0drkz9g93978iroc3pm1	\N	2025-01-22 13:42:13.677
31	plugin::upload.assets.copy-link	{}	\N	{}	[]	2025-01-14 17:38:53.174	2025-01-14 17:38:53.174	\N	\N	r57j2vw6n0tn2yny84t4dkio	\N	2025-01-22 13:42:13.677
32	plugin::content-manager.explorer.create	{}	api::access.access	{"fields": ["accessToken", "operation", "type", "name", "active", "expiresOn"]}	["admin::is-creator"]	2025-01-14 17:38:53.177	2025-01-14 17:38:53.177	\N	\N	stcquqgt4es7km0s4ohse6x6	\N	2025-01-22 13:42:13.677
90	plugin::content-manager.explorer.publish	{}	api::map-snapshot.map-snapshot	{}	[]	2025-01-14 17:38:53.315	2025-01-14 17:38:53.315	\N	\N	s1gtldj2hm568le2msqahh60	\N	2025-01-22 13:42:13.677
10	plugin::content-manager.explorer.read	{}	api::operation.operation	{"fields": ["name", "description", "status", "organization", "mapState", "mapSnapshots", "eventStates", "mapLayers", "phase"]}	[]	2025-01-14 17:38:53.131	2025-01-22 15:07:42.648	\N	\N	i3hdqrqr8egwbyidlvb18la6	\N	2025-01-22 13:42:13.677
33	plugin::content-manager.explorer.create	{}	api::map-layer.map-layer	{"fields": ["label", "serverLayerName", "type", "wms_source", "custom_source", "options", "public", "organization"]}	["admin::is-creator"]	2025-01-14 17:38:53.18	2025-01-14 17:38:53.18	\N	\N	h6trmplf2dbklpxau8r7nhee	\N	2025-01-22 13:42:13.677
34	plugin::content-manager.explorer.create	{}	api::map-snapshot.map-snapshot	{"fields": ["mapState", "operation"]}	["admin::is-creator"]	2025-01-14 17:38:53.183	2025-01-14 17:38:53.183	\N	\N	dhotbys1svg7pnfmgyli47yz	\N	2025-01-22 13:42:13.677
36	plugin::content-manager.explorer.create	{}	api::organization.organization	{"fields": ["name", "mapLongitude", "mapLatitude", "mapZoomLevel", "defaultLocale", "url", "logo", "operations", "users", "wms_sources", "map_layer_favorites"]}	["admin::is-creator"]	2025-01-14 17:38:53.188	2025-01-14 17:38:53.188	\N	\N	gmguirvp6ys8e9endj2kk93z	\N	2025-01-22 13:42:13.677
37	plugin::content-manager.explorer.create	{}	api::wms-source.wms-source	{"fields": ["label", "type", "url", "attribution", "public", "organization", "map_layers"]}	["admin::is-creator"]	2025-01-14 17:38:53.19	2025-01-14 17:38:53.19	\N	\N	p6aj3rl6rrao3gee0oehtr6s	\N	2025-01-22 13:42:13.677
38	plugin::content-manager.explorer.read	{}	api::access.access	{"fields": ["accessToken", "operation", "type", "name", "active", "expiresOn"]}	["admin::is-creator"]	2025-01-14 17:38:53.193	2025-01-14 17:38:53.193	\N	\N	b4lwo1zoslxzg7aqkjdta57e	\N	2025-01-22 13:42:13.677
138	admin::transfer.tokens.access	{}	\N	{}	[]	2025-01-14 17:38:53.406	2025-01-14 17:38:53.406	\N	\N	fxcpit86l3ihyfdb91u8wrbs	\N	2025-01-22 13:42:13.677
39	plugin::content-manager.explorer.read	{}	api::map-layer.map-layer	{"fields": ["label", "serverLayerName", "type", "wms_source", "custom_source", "options", "public", "organization"]}	["admin::is-creator"]	2025-01-14 17:38:53.196	2025-01-14 17:38:53.196	\N	\N	otytapmo5q6xcbl9ge7x204e	\N	2025-01-22 13:42:13.677
40	plugin::content-manager.explorer.read	{}	api::map-snapshot.map-snapshot	{"fields": ["mapState", "operation"]}	["admin::is-creator"]	2025-01-14 17:38:53.198	2025-01-14 17:38:53.198	\N	\N	x9jv32fil88xic5kdwn6tps7	\N	2025-01-22 13:42:13.677
42	plugin::content-manager.explorer.read	{}	api::organization.organization	{"fields": ["name", "mapLongitude", "mapLatitude", "mapZoomLevel", "defaultLocale", "url", "logo", "operations", "users", "wms_sources", "map_layer_favorites"]}	["admin::is-creator"]	2025-01-14 17:38:53.202	2025-01-14 17:38:53.202	\N	\N	y477ynwsl8stinh6boygjiry	\N	2025-01-22 13:42:13.677
43	plugin::content-manager.explorer.read	{}	api::wms-source.wms-source	{"fields": ["label", "type", "url", "attribution", "public", "organization", "map_layers"]}	["admin::is-creator"]	2025-01-14 17:38:53.204	2025-01-14 17:38:53.204	\N	\N	pmncn1fb42uhj46b8oboau5g	\N	2025-01-22 13:42:13.677
44	plugin::content-manager.explorer.update	{}	api::access.access	{"fields": ["accessToken", "operation", "type", "name", "active", "expiresOn"]}	["admin::is-creator"]	2025-01-14 17:38:53.207	2025-01-14 17:38:53.207	\N	\N	htx4t4r5oepxta35f1oz5nto	\N	2025-01-22 13:42:13.677
45	plugin::content-manager.explorer.update	{}	api::map-layer.map-layer	{"fields": ["label", "serverLayerName", "type", "wms_source", "custom_source", "options", "public", "organization"]}	["admin::is-creator"]	2025-01-14 17:38:53.209	2025-01-14 17:38:53.209	\N	\N	i2tnwxnzht12cnm25nyjtqdp	\N	2025-01-22 13:42:13.677
46	plugin::content-manager.explorer.update	{}	api::map-snapshot.map-snapshot	{"fields": ["mapState", "operation"]}	["admin::is-creator"]	2025-01-14 17:38:53.211	2025-01-14 17:38:53.211	\N	\N	qcwn8jlxsv30zy1g5acsy47u	\N	2025-01-22 13:42:13.677
48	plugin::content-manager.explorer.update	{}	api::organization.organization	{"fields": ["name", "mapLongitude", "mapLatitude", "mapZoomLevel", "defaultLocale", "url", "logo", "operations", "users", "wms_sources", "map_layer_favorites"]}	["admin::is-creator"]	2025-01-14 17:38:53.216	2025-01-14 17:38:53.216	\N	\N	siql70tz4un9xwvsals54ez7	\N	2025-01-22 13:42:13.677
49	plugin::content-manager.explorer.update	{}	api::wms-source.wms-source	{"fields": ["label", "type", "url", "attribution", "public", "organization", "map_layers"]}	["admin::is-creator"]	2025-01-14 17:38:53.218	2025-01-14 17:38:53.218	\N	\N	chlf32o3vqzj5thrzkooaz5j	\N	2025-01-22 13:42:13.677
50	plugin::content-manager.explorer.delete	{}	api::access.access	{}	["admin::is-creator"]	2025-01-14 17:38:53.22	2025-01-14 17:38:53.22	\N	\N	ip3cnvadmsg3vvaqtsfh21it	\N	2025-01-22 13:42:13.677
51	plugin::content-manager.explorer.delete	{}	api::map-layer.map-layer	{}	["admin::is-creator"]	2025-01-14 17:38:53.221	2025-01-14 17:38:53.221	\N	\N	oi79v06kyy0o2pzrawts0gn5	\N	2025-01-22 13:42:13.677
52	plugin::content-manager.explorer.delete	{}	api::map-snapshot.map-snapshot	{}	["admin::is-creator"]	2025-01-14 17:38:53.223	2025-01-14 17:38:53.223	\N	\N	tegsnw8tqntrze5txcis4mm4	\N	2025-01-22 13:42:13.677
53	plugin::content-manager.explorer.delete	{}	api::operation.operation	{}	["admin::is-creator"]	2025-01-14 17:38:53.227	2025-01-14 17:38:53.227	\N	\N	ccpuc7je4e4w1dknkydwf9jv	\N	2025-01-22 13:42:13.677
54	plugin::content-manager.explorer.delete	{}	api::organization.organization	{}	["admin::is-creator"]	2025-01-14 17:38:53.229	2025-01-14 17:38:53.229	\N	\N	pdghl19r0sxj0o7tuf41cmuy	\N	2025-01-22 13:42:13.677
55	plugin::content-manager.explorer.delete	{}	api::wms-source.wms-source	{}	["admin::is-creator"]	2025-01-14 17:38:53.231	2025-01-14 17:38:53.231	\N	\N	m7mnkv28051u8iafw36ud5z5	\N	2025-01-22 13:42:13.677
56	plugin::upload.read	{}	\N	{}	["admin::is-creator"]	2025-01-14 17:38:53.233	2025-01-14 17:38:53.233	\N	\N	di7vwsonw9fybbqfo0hk7lfs	\N	2025-01-22 13:42:13.677
57	plugin::upload.configure-view	{}	\N	{}	[]	2025-01-14 17:38:53.235	2025-01-14 17:38:53.235	\N	\N	nvmjlb1ofvmmahhjaquatcoo	\N	2025-01-22 13:42:13.677
58	plugin::upload.assets.create	{}	\N	{}	[]	2025-01-14 17:38:53.237	2025-01-14 17:38:53.237	\N	\N	m3e1tq3j73jrtwejy9qx0zea	\N	2025-01-22 13:42:13.677
59	plugin::upload.assets.update	{}	\N	{}	["admin::is-creator"]	2025-01-14 17:38:53.239	2025-01-14 17:38:53.239	\N	\N	mne9sp4wh7s9e6we8piyrx3u	\N	2025-01-22 13:42:13.677
60	plugin::upload.assets.download	{}	\N	{}	[]	2025-01-14 17:38:53.24	2025-01-14 17:38:53.24	\N	\N	nca2bj9rxevkhfxy64g6o7ku	\N	2025-01-22 13:42:13.677
61	plugin::upload.assets.copy-link	{}	\N	{}	[]	2025-01-14 17:38:53.242	2025-01-14 17:38:53.242	\N	\N	rp779ssqx905z800lhik4w0n	\N	2025-01-22 13:42:13.677
62	plugin::content-manager.explorer.create	{}	plugin::users-permissions.user	{"fields": ["username", "email", "provider", "password", "resetPasswordToken", "confirmationToken", "confirmed", "blocked", "role", "organization"]}	[]	2025-01-14 17:38:53.256	2025-01-14 17:38:53.256	\N	\N	pcxmlkd5a0eadp42if87ssju	\N	2025-01-22 13:42:13.677
63	plugin::content-manager.explorer.create	{}	api::access.access	{"fields": ["accessToken", "operation", "type", "name", "active", "expiresOn"]}	[]	2025-01-14 17:38:53.258	2025-01-14 17:38:53.258	\N	\N	sbgfcn7ggu5njl7yzl54f6kd	\N	2025-01-22 13:42:13.677
64	plugin::content-manager.explorer.create	{}	api::map-layer.map-layer	{"fields": ["label", "serverLayerName", "type", "wms_source", "custom_source", "options", "public", "organization"]}	[]	2025-01-14 17:38:53.26	2025-01-14 17:38:53.26	\N	\N	u2f7j5xfdzfwcr907ykge0aj	\N	2025-01-22 13:42:13.677
65	plugin::content-manager.explorer.create	{}	api::map-snapshot.map-snapshot	{"fields": ["mapState", "operation"]}	[]	2025-01-14 17:38:53.262	2025-01-14 17:38:53.262	\N	\N	e7r8ld08jr0z8i2ekh4lw4ey	\N	2025-01-22 13:42:13.677
67	plugin::content-manager.explorer.create	{}	api::organization.organization	{"fields": ["name", "mapLongitude", "mapLatitude", "mapZoomLevel", "defaultLocale", "url", "logo", "operations", "users", "wms_sources", "map_layer_favorites"]}	[]	2025-01-14 17:38:53.266	2025-01-14 17:38:53.266	\N	\N	jvsfm13kmdfvuhptyxdfr5sw	\N	2025-01-22 13:42:13.677
68	plugin::content-manager.explorer.create	{}	api::wms-source.wms-source	{"fields": ["label", "type", "url", "attribution", "public", "organization", "map_layers"]}	[]	2025-01-14 17:38:53.268	2025-01-14 17:38:53.268	\N	\N	c0ohvjdzkiqzmx724zbdi2by	\N	2025-01-22 13:42:13.677
69	plugin::content-manager.explorer.read	{}	plugin::users-permissions.user	{"fields": ["username", "email", "provider", "password", "resetPasswordToken", "confirmationToken", "confirmed", "blocked", "role", "organization"]}	[]	2025-01-14 17:38:53.27	2025-01-14 17:38:53.27	\N	\N	vmj9bttwngxdz6vlgwcdkj7q	\N	2025-01-22 13:42:13.677
70	plugin::content-manager.explorer.read	{}	api::access.access	{"fields": ["accessToken", "operation", "type", "name", "active", "expiresOn"]}	[]	2025-01-14 17:38:53.272	2025-01-14 17:38:53.272	\N	\N	c4k0sfebj3ufraok9zsznvj3	\N	2025-01-22 13:42:13.677
71	plugin::content-manager.explorer.read	{}	api::map-layer.map-layer	{"fields": ["label", "serverLayerName", "type", "wms_source", "custom_source", "options", "public", "organization"]}	[]	2025-01-14 17:38:53.274	2025-01-14 17:38:53.274	\N	\N	pef4veayjgdusxj59eux5md2	\N	2025-01-22 13:42:13.677
72	plugin::content-manager.explorer.read	{}	api::map-snapshot.map-snapshot	{"fields": ["mapState", "operation"]}	[]	2025-01-14 17:38:53.276	2025-01-14 17:38:53.276	\N	\N	vckotz88d09wqgpj5s4ioeqx	\N	2025-01-22 13:42:13.677
74	plugin::content-manager.explorer.read	{}	api::organization.organization	{"fields": ["name", "mapLongitude", "mapLatitude", "mapZoomLevel", "defaultLocale", "url", "logo", "operations", "users", "wms_sources", "map_layer_favorites"]}	[]	2025-01-14 17:38:53.28	2025-01-14 17:38:53.28	\N	\N	o3wb5nucsc8xzt8eksmz37gk	\N	2025-01-22 13:42:13.677
75	plugin::content-manager.explorer.read	{}	api::wms-source.wms-source	{"fields": ["label", "type", "url", "attribution", "public", "organization", "map_layers"]}	[]	2025-01-14 17:38:53.282	2025-01-14 17:38:53.282	\N	\N	n7y71c1ahl0pad802fuin7p5	\N	2025-01-22 13:42:13.677
76	plugin::content-manager.explorer.update	{}	plugin::users-permissions.user	{"fields": ["username", "email", "provider", "password", "resetPasswordToken", "confirmationToken", "confirmed", "blocked", "role", "organization"]}	[]	2025-01-14 17:38:53.285	2025-01-14 17:38:53.285	\N	\N	ffysm7ss6zedkcw8dl7kz1md	\N	2025-01-22 13:42:13.677
77	plugin::content-manager.explorer.update	{}	api::access.access	{"fields": ["accessToken", "operation", "type", "name", "active", "expiresOn"]}	[]	2025-01-14 17:38:53.287	2025-01-14 17:38:53.287	\N	\N	to5avggetixx757o2cn2kcjg	\N	2025-01-22 13:42:13.677
78	plugin::content-manager.explorer.update	{}	api::map-layer.map-layer	{"fields": ["label", "serverLayerName", "type", "wms_source", "custom_source", "options", "public", "organization"]}	[]	2025-01-14 17:38:53.289	2025-01-14 17:38:53.289	\N	\N	ib0p7zt0zojtif6on06i7ska	\N	2025-01-22 13:42:13.677
79	plugin::content-manager.explorer.update	{}	api::map-snapshot.map-snapshot	{"fields": ["mapState", "operation"]}	[]	2025-01-14 17:38:53.291	2025-01-14 17:38:53.291	\N	\N	zod1283x7oj3ok36b35bwkub	\N	2025-01-22 13:42:13.677
81	plugin::content-manager.explorer.update	{}	api::organization.organization	{"fields": ["name", "mapLongitude", "mapLatitude", "mapZoomLevel", "defaultLocale", "url", "logo", "operations", "users", "wms_sources", "map_layer_favorites"]}	[]	2025-01-14 17:38:53.295	2025-01-14 17:38:53.295	\N	\N	xpt22zjvvhji7g6c8zl9r3om	\N	2025-01-22 13:42:13.677
82	plugin::content-manager.explorer.update	{}	api::wms-source.wms-source	{"fields": ["label", "type", "url", "attribution", "public", "organization", "map_layers"]}	[]	2025-01-14 17:38:53.297	2025-01-14 17:38:53.297	\N	\N	dcmzqoipd5vo4g6212lih3fx	\N	2025-01-22 13:42:13.677
83	plugin::content-manager.explorer.delete	{}	plugin::users-permissions.user	{}	[]	2025-01-14 17:38:53.299	2025-01-14 17:38:53.299	\N	\N	smmeeam4q0od4k65vak23esk	\N	2025-01-22 13:42:13.677
84	plugin::content-manager.explorer.delete	{}	api::access.access	{}	[]	2025-01-14 17:38:53.301	2025-01-14 17:38:53.301	\N	\N	kri34vlxcyvqa8p4m9kngprt	\N	2025-01-22 13:42:13.677
85	plugin::content-manager.explorer.delete	{}	api::map-layer.map-layer	{}	[]	2025-01-14 17:38:53.303	2025-01-14 17:38:53.303	\N	\N	czvronlx7v91g4ya3fq2tsq9	\N	2025-01-22 13:42:13.677
86	plugin::content-manager.explorer.delete	{}	api::map-snapshot.map-snapshot	{}	[]	2025-01-14 17:38:53.306	2025-01-14 17:38:53.306	\N	\N	vf86p9a0r9c2rirlyqdcx5t1	\N	2025-01-22 13:42:13.677
87	plugin::content-manager.explorer.delete	{}	api::operation.operation	{}	[]	2025-01-14 17:38:53.308	2025-01-14 17:38:53.308	\N	\N	ws9jgor477qpljk88ygvtgza	\N	2025-01-22 13:42:13.677
88	plugin::content-manager.explorer.delete	{}	api::organization.organization	{}	[]	2025-01-14 17:38:53.31	2025-01-14 17:38:53.31	\N	\N	au0x6d0p4v7odetc9rhnqa5g	\N	2025-01-22 13:42:13.677
89	plugin::content-manager.explorer.delete	{}	api::wms-source.wms-source	{}	[]	2025-01-14 17:38:53.313	2025-01-14 17:38:53.313	\N	\N	l4q1mqsy2hqedcoira2kycsi	\N	2025-01-22 13:42:13.677
143	admin::transfer.tokens.delete	{}	\N	{}	[]	2025-01-14 17:38:53.416	2025-01-14 17:38:53.416	\N	\N	hpc133cq82j4n4nbcymhzlec	\N	2025-01-22 13:42:13.677
91	plugin::content-manager.single-types.configure-view	{}	\N	{}	[]	2025-01-14 17:38:53.316	2025-01-14 17:38:53.316	\N	\N	knouy7n7we5n3hsxrt3ekuj9	\N	2025-01-22 13:42:13.677
92	plugin::content-manager.collection-types.configure-view	{}	\N	{}	[]	2025-01-14 17:38:53.318	2025-01-14 17:38:53.318	\N	\N	zownjyr8xw9naupg0fbconn8	\N	2025-01-22 13:42:13.677
93	plugin::content-manager.components.configure-layout	{}	\N	{}	[]	2025-01-14 17:38:53.32	2025-01-14 17:38:53.32	\N	\N	wmcfz0kpuh56qo8zt3d2815x	\N	2025-01-22 13:42:13.677
95	plugin::email.settings.read	{}	\N	{}	[]	2025-01-14 17:38:53.324	2025-01-14 17:38:53.324	\N	\N	srjz02p2palq1xnqqgaavvw6	\N	2025-01-22 13:42:13.677
96	plugin::upload.read	{}	\N	{}	[]	2025-01-14 17:38:53.326	2025-01-14 17:38:53.326	\N	\N	oxiptw3l319iiivs2a0hn9oo	\N	2025-01-22 13:42:13.677
97	plugin::upload.assets.create	{}	\N	{}	[]	2025-01-14 17:38:53.328	2025-01-14 17:38:53.328	\N	\N	pguf3n8c2kknfknl37fuai5t	\N	2025-01-22 13:42:13.677
98	plugin::upload.assets.update	{}	\N	{}	[]	2025-01-14 17:38:53.33	2025-01-14 17:38:53.33	\N	\N	rgz5uef3u85yussj0p7ol8wh	\N	2025-01-22 13:42:13.677
99	plugin::upload.assets.download	{}	\N	{}	[]	2025-01-14 17:38:53.332	2025-01-14 17:38:53.332	\N	\N	gjl5ng0vp7kfvcb66cbgyyil	\N	2025-01-22 13:42:13.677
100	plugin::upload.assets.copy-link	{}	\N	{}	[]	2025-01-14 17:38:53.334	2025-01-14 17:38:53.334	\N	\N	elnq52eceshkhhpu46k5kgu8	\N	2025-01-22 13:42:13.677
101	plugin::upload.configure-view	{}	\N	{}	[]	2025-01-14 17:38:53.336	2025-01-14 17:38:53.336	\N	\N	z754zbnjr1r9dg9en7u1rtgo	\N	2025-01-22 13:42:13.677
102	plugin::upload.settings.read	{}	\N	{}	[]	2025-01-14 17:38:53.338	2025-01-14 17:38:53.338	\N	\N	gh1hmip0ea3qzrxkotsxaxk9	\N	2025-01-22 13:42:13.677
103	plugin::i18n.locale.create	{}	\N	{}	[]	2025-01-14 17:38:53.34	2025-01-14 17:38:53.34	\N	\N	ns1mer2d0qvsrszvf55jdajd	\N	2025-01-22 13:42:13.677
104	plugin::i18n.locale.read	{}	\N	{}	[]	2025-01-14 17:38:53.342	2025-01-14 17:38:53.342	\N	\N	p04at8an12iaw0vwlfkec7mg	\N	2025-01-22 13:42:13.677
105	plugin::i18n.locale.update	{}	\N	{}	[]	2025-01-14 17:38:53.344	2025-01-14 17:38:53.344	\N	\N	alvue9obc0ht4b8k6vrzq7m9	\N	2025-01-22 13:42:13.677
106	plugin::i18n.locale.delete	{}	\N	{}	[]	2025-01-14 17:38:53.345	2025-01-14 17:38:53.345	\N	\N	qd82bz9b4g308fxp0ji7qn3n	\N	2025-01-22 13:42:13.677
107	plugin::users-permissions.roles.create	{}	\N	{}	[]	2025-01-14 17:38:53.347	2025-01-14 17:38:53.347	\N	\N	x4t7poq6k46dj9ld2s1c7loz	\N	2025-01-22 13:42:13.677
108	plugin::users-permissions.roles.read	{}	\N	{}	[]	2025-01-14 17:38:53.349	2025-01-14 17:38:53.349	\N	\N	jlhbk9fv0yh2nou91k1dck3b	\N	2025-01-22 13:42:13.677
109	plugin::users-permissions.roles.update	{}	\N	{}	[]	2025-01-14 17:38:53.351	2025-01-14 17:38:53.351	\N	\N	nwjd0949x3dam9xr9ak36tui	\N	2025-01-22 13:42:13.677
110	plugin::users-permissions.roles.delete	{}	\N	{}	[]	2025-01-14 17:38:53.353	2025-01-14 17:38:53.353	\N	\N	fmn9t1jhptvcfag7smfk510o	\N	2025-01-22 13:42:13.677
111	plugin::users-permissions.providers.read	{}	\N	{}	[]	2025-01-14 17:38:53.354	2025-01-14 17:38:53.354	\N	\N	p7zj3ouco5efrj3wm4hxepu9	\N	2025-01-22 13:42:13.677
112	plugin::users-permissions.providers.update	{}	\N	{}	[]	2025-01-14 17:38:53.356	2025-01-14 17:38:53.356	\N	\N	ln705zj5z1gd7a1d268h2842	\N	2025-01-22 13:42:13.677
113	plugin::users-permissions.email-templates.read	{}	\N	{}	[]	2025-01-14 17:38:53.359	2025-01-14 17:38:53.359	\N	\N	fk5ar15xrb4di765j88zfqv5	\N	2025-01-22 13:42:13.677
114	plugin::users-permissions.email-templates.update	{}	\N	{}	[]	2025-01-14 17:38:53.361	2025-01-14 17:38:53.361	\N	\N	nfdz5q1k6jikjm7t4bbto1jl	\N	2025-01-22 13:42:13.677
115	plugin::users-permissions.advanced-settings.read	{}	\N	{}	[]	2025-01-14 17:38:53.362	2025-01-14 17:38:53.362	\N	\N	ysaa40aeax5oseolo2qjc2w2	\N	2025-01-22 13:42:13.677
116	plugin::users-permissions.advanced-settings.update	{}	\N	{}	[]	2025-01-14 17:38:53.364	2025-01-14 17:38:53.364	\N	\N	alelvi0qvkm4iklt7mq9nzaf	\N	2025-01-22 13:42:13.677
117	admin::marketplace.read	{}	\N	{}	[]	2025-01-14 17:38:53.367	2025-01-14 17:38:53.367	\N	\N	d3a73plc9c264yeyo6qhqbd4	\N	2025-01-22 13:42:13.677
118	admin::webhooks.create	{}	\N	{}	[]	2025-01-14 17:38:53.368	2025-01-14 17:38:53.368	\N	\N	yav705a5xdkhh2i9qxmem0f2	\N	2025-01-22 13:42:13.677
119	admin::webhooks.read	{}	\N	{}	[]	2025-01-14 17:38:53.37	2025-01-14 17:38:53.37	\N	\N	p9kfbd70grii4094tesd95hk	\N	2025-01-22 13:42:13.677
120	admin::webhooks.update	{}	\N	{}	[]	2025-01-14 17:38:53.372	2025-01-14 17:38:53.372	\N	\N	nxgc46e4rhjuaopjwol1hc78	\N	2025-01-22 13:42:13.677
121	admin::webhooks.delete	{}	\N	{}	[]	2025-01-14 17:38:53.373	2025-01-14 17:38:53.373	\N	\N	rb1injzhwb0fo71cwy51cyxr	\N	2025-01-22 13:42:13.677
122	admin::users.create	{}	\N	{}	[]	2025-01-14 17:38:53.376	2025-01-14 17:38:53.376	\N	\N	f9oo0yal5n2lt7n0qbjnrsm7	\N	2025-01-22 13:42:13.677
123	admin::users.read	{}	\N	{}	[]	2025-01-14 17:38:53.378	2025-01-14 17:38:53.378	\N	\N	wu8grdqlopurx9e3mzzj0ptc	\N	2025-01-22 13:42:13.677
124	admin::users.update	{}	\N	{}	[]	2025-01-14 17:38:53.38	2025-01-14 17:38:53.38	\N	\N	e8w0px5h4mdb7uxu590yfjpg	\N	2025-01-22 13:42:13.677
125	admin::users.delete	{}	\N	{}	[]	2025-01-14 17:38:53.382	2025-01-14 17:38:53.382	\N	\N	c087i8g8tpok8vhpwt62ccbk	\N	2025-01-22 13:42:13.677
126	admin::roles.create	{}	\N	{}	[]	2025-01-14 17:38:53.384	2025-01-14 17:38:53.384	\N	\N	s1m8uitzwqg0stsnvpa77ojk	\N	2025-01-22 13:42:13.677
127	admin::roles.read	{}	\N	{}	[]	2025-01-14 17:38:53.385	2025-01-14 17:38:53.385	\N	\N	nqioh4kjl406gwddqkfi3i25	\N	2025-01-22 13:42:13.677
128	admin::roles.update	{}	\N	{}	[]	2025-01-14 17:38:53.388	2025-01-14 17:38:53.388	\N	\N	s4zcne9977z3m17u4i9wq1zb	\N	2025-01-22 13:42:13.677
129	admin::roles.delete	{}	\N	{}	[]	2025-01-14 17:38:53.39	2025-01-14 17:38:53.39	\N	\N	h2neqylvu2xx7h3u1rfiao2z	\N	2025-01-22 13:42:13.677
130	admin::api-tokens.access	{}	\N	{}	[]	2025-01-14 17:38:53.392	2025-01-14 17:38:53.392	\N	\N	wk35owvegd8dheodflno7onq	\N	2025-01-22 13:42:13.677
131	admin::api-tokens.create	{}	\N	{}	[]	2025-01-14 17:38:53.393	2025-01-14 17:38:53.393	\N	\N	r31m3e8txr0tw0b5r979qiu8	\N	2025-01-22 13:42:13.677
132	admin::api-tokens.read	{}	\N	{}	[]	2025-01-14 17:38:53.395	2025-01-14 17:38:53.395	\N	\N	b30m4ov1pd90b0timgeo5bbw	\N	2025-01-22 13:42:13.677
133	admin::api-tokens.update	{}	\N	{}	[]	2025-01-14 17:38:53.397	2025-01-14 17:38:53.397	\N	\N	evsgprx687qrx2mryaycngch	\N	2025-01-22 13:42:13.677
134	admin::api-tokens.regenerate	{}	\N	{}	[]	2025-01-14 17:38:53.399	2025-01-14 17:38:53.399	\N	\N	l5b2s47go00ndmvple72156y	\N	2025-01-22 13:42:13.677
135	admin::api-tokens.delete	{}	\N	{}	[]	2025-01-14 17:38:53.4	2025-01-14 17:38:53.4	\N	\N	ttxwex1gqz18gw105e6vaksg	\N	2025-01-22 13:42:13.677
136	admin::project-settings.update	{}	\N	{}	[]	2025-01-14 17:38:53.402	2025-01-14 17:38:53.402	\N	\N	zsy9ttf94jhfwkyi8c61d21n	\N	2025-01-22 13:42:13.677
137	admin::project-settings.read	{}	\N	{}	[]	2025-01-14 17:38:53.404	2025-01-14 17:38:53.404	\N	\N	dgeskfb4hoptx3wy8u7hdo4u	\N	2025-01-22 13:42:13.677
139	admin::transfer.tokens.create	{}	\N	{}	[]	2025-01-14 17:38:53.407	2025-01-14 17:38:53.407	\N	\N	w10xwhl7fcs3intoy0w8szvb	\N	2025-01-22 13:42:13.677
140	admin::transfer.tokens.read	{}	\N	{}	[]	2025-01-14 17:38:53.409	2025-01-14 17:38:53.409	\N	\N	f4o36eyqnb4bfw493058rgir	\N	2025-01-22 13:42:13.677
141	admin::transfer.tokens.update	{}	\N	{}	[]	2025-01-14 17:38:53.411	2025-01-14 17:38:53.411	\N	\N	arwe1muk23kn8h2advndjyif	\N	2025-01-22 13:42:13.677
142	admin::transfer.tokens.regenerate	{}	\N	{}	[]	2025-01-14 17:38:53.413	2025-01-14 17:38:53.413	\N	\N	t58aq8slg141fgxchq8iqjba	\N	2025-01-22 13:42:13.677
47	plugin::content-manager.explorer.update	{}	api::operation.operation	{"fields": ["name", "description", "status", "organization", "mapState", "mapSnapshots", "eventStates", "mapLayers", "phase"]}	["admin::is-creator"]	2025-01-14 17:38:53.213	2025-01-22 15:07:42.648	\N	\N	kzsoynyekbe8floaqpu6curn	\N	2025-01-22 13:42:13.677
149	plugin::content-manager.explorer.delete	{}	api::journal-entry.journal-entry	{}	[]	2025-01-21 08:14:41.747	2025-01-21 08:14:41.747	\N	\N	gaa2suyca3e0w7y17lbskev3	\N	2025-01-22 13:42:13.677
150	plugin::content-manager.explorer.publish	{}	api::journal-entry.journal-entry	{}	[]	2025-01-21 08:14:41.75	2025-01-21 08:14:41.75	\N	\N	dh68ahokpkuv7m6sh36lhfx2	\N	2025-01-22 13:42:13.677
151	plugin::config-sync.settings.read	{}	\N	{}	[]	2025-01-21 08:26:05.009	2025-01-21 08:26:05.009	\N	\N	tes39nq0o0biva0219eo2dnb	\N	2025-01-22 13:42:13.677
152	plugin::config-sync.menu-link	{}	\N	{}	[]	2025-01-21 08:26:05.018	2025-01-21 08:26:05.018	\N	\N	ovuez8h31ymcq7r7tmtut8zd	\N	2025-01-22 13:42:13.677
165	plugin::content-manager.explorer.create	{}	api::operation.operation	{"fields": ["name", "description", "status", "organization", "mapState", "mapSnapshots", "eventStates", "mapLayers", "phase"]}	[]	2025-01-22 15:07:42.618	2025-01-22 15:07:42.618	\N	\N	aeekzxc5eolohax5l9f4fuy9	\N	2025-01-22 15:07:42.618
167	plugin::content-manager.explorer.read	{}	api::operation.operation	{"fields": ["name", "description", "status", "organization", "mapState", "mapSnapshots", "eventStates", "mapLayers", "phase"]}	[]	2025-01-22 15:07:42.623	2025-01-22 15:07:42.623	\N	\N	ghu22gbcfdue4od1it0tsuf5	\N	2025-01-22 15:07:42.623
169	plugin::content-manager.explorer.update	{}	api::operation.operation	{"fields": ["name", "description", "status", "organization", "mapState", "mapSnapshots", "eventStates", "mapLayers", "phase"]}	[]	2025-01-22 15:07:42.628	2025-01-22 15:07:42.628	\N	\N	qg7doipaf2hdp5u6djb3467z	\N	2025-01-22 15:07:42.628
4	plugin::content-manager.explorer.create	{}	api::operation.operation	{"fields": ["name", "description", "status", "organization", "mapState", "mapSnapshots", "eventStates", "mapLayers", "phase"]}	[]	2025-01-14 17:38:53.118	2025-01-22 15:07:42.648	\N	\N	qjc5mqsyghmydf37vabswbsh	\N	2025-01-22 13:42:13.677
16	plugin::content-manager.explorer.update	{}	api::operation.operation	{"fields": ["name", "description", "status", "organization", "mapState", "mapSnapshots", "eventStates", "mapLayers", "phase"]}	[]	2025-01-14 17:38:53.143	2025-01-22 15:07:42.648	\N	\N	cuxhgmrarz5omoqmrbfhdp6y	\N	2025-01-22 13:42:13.677
175	plugin::content-manager.explorer.create	{}	api::journal-entry.journal-entry	{"fields": ["sender", "creator", "message_number", "communication_type", "communication_details", "message_subject", "message_content", "visum_message", "is_key_message", "department", "date_message", "visum_triage", "date_triage", "decision", "date_decision", "operation", "organization", "date_decision_delivered", "visum_decider", "decision_receiver", "entry_status", "decision_sender", "is_drawn_on_map"]}	[]	2025-01-23 13:49:10.01	2025-01-23 13:49:10.01	\N	\N	wtk99jct3y2y52ugzf7dxafq	\N	2025-01-23 13:49:10.011
176	plugin::content-manager.explorer.read	{}	api::journal-entry.journal-entry	{"fields": ["sender", "creator", "message_number", "communication_type", "communication_details", "message_subject", "message_content", "visum_message", "is_key_message", "department", "date_message", "visum_triage", "date_triage", "decision", "date_decision", "operation", "organization", "date_decision_delivered", "visum_decider", "decision_receiver", "entry_status", "decision_sender", "is_drawn_on_map"]}	[]	2025-01-23 13:49:10.014	2025-01-23 13:49:10.014	\N	\N	ue6sxm4axiis58uybctbo44e	\N	2025-01-23 13:49:10.015
177	plugin::content-manager.explorer.update	{}	api::journal-entry.journal-entry	{"fields": ["sender", "creator", "message_number", "communication_type", "communication_details", "message_subject", "message_content", "visum_message", "is_key_message", "department", "date_message", "visum_triage", "date_triage", "decision", "date_decision", "operation", "organization", "date_decision_delivered", "visum_decider", "decision_receiver", "entry_status", "decision_sender", "is_drawn_on_map"]}	[]	2025-01-23 13:49:10.017	2025-01-23 13:49:10.017	\N	\N	z090o708yxvkd7z1ad3il2l2	\N	2025-01-23 13:49:10.017
35	plugin::content-manager.explorer.create	{}	api::operation.operation	{"fields": ["name", "description", "status", "organization", "mapState", "mapSnapshots", "eventStates", "mapLayers", "phase"]}	["admin::is-creator"]	2025-01-14 17:38:53.186	2025-01-22 15:07:42.648	\N	\N	ctn7tfm52kofiiypojxewzzp	\N	2025-01-22 13:42:13.677
158	plugin::content-manager.explorer.publish	{}	plugin::users-permissions.user	{}	[]	2025-01-22 13:42:14.706	2025-01-22 13:42:14.706	\N	\N	azksb81m68xheajm5a902cnn	\N	2025-01-22 13:42:14.707
159	plugin::content-manager.explorer.publish	{}	api::access.access	{}	[]	2025-01-22 13:42:14.712	2025-01-22 13:42:14.712	\N	\N	tkyilhl5alz3qr7gd696eer9	\N	2025-01-22 13:42:14.712
160	plugin::content-manager.explorer.publish	{}	api::map-layer.map-layer	{}	[]	2025-01-22 13:42:14.715	2025-01-22 13:42:14.715	\N	\N	wbjburcnhtw6aj11prr49uz7	\N	2025-01-22 13:42:14.715
161	plugin::content-manager.explorer.publish	{}	api::operation.operation	{}	[]	2025-01-22 13:42:14.718	2025-01-22 13:42:14.718	\N	\N	fatpzj7zq3c9v2tllt5jhoze	\N	2025-01-22 13:42:14.718
162	plugin::content-manager.explorer.publish	{}	api::organization.organization	{}	[]	2025-01-22 13:42:14.721	2025-01-22 13:42:14.721	\N	\N	djw53q61wrvas20217igrnso	\N	2025-01-22 13:42:14.721
163	plugin::content-manager.explorer.publish	{}	api::wms-source.wms-source	{}	[]	2025-01-22 13:42:14.725	2025-01-22 13:42:14.725	\N	\N	d3choatcwpe6lfardi7ykglk	\N	2025-01-22 13:42:14.725
41	plugin::content-manager.explorer.read	{}	api::operation.operation	{"fields": ["name", "description", "status", "organization", "mapState", "mapSnapshots", "eventStates", "mapLayers", "phase"]}	["admin::is-creator"]	2025-01-14 17:38:53.2	2025-01-22 15:07:42.648	\N	\N	dy5ntbqd5fa3eguquh2l47be	\N	2025-01-22 13:42:13.677
\.


--
-- TOC entry 4211 (class 0 OID 40866)
-- Dependencies: 221
-- Data for Name: admin_permissions_role_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_permissions_role_lnk (id, permission_id, role_id, permission_ord) FROM stdin;
1	1	2	1
2	2	2	2
3	3	2	3
4	4	2	4
5	5	2	5
6	6	2	6
7	7	2	7
8	8	2	8
9	9	2	9
10	10	2	10
11	11	2	11
12	12	2	12
13	13	2	13
14	14	2	14
15	15	2	15
16	16	2	16
17	17	2	17
18	18	2	18
19	19	2	19
20	20	2	20
21	21	2	21
22	22	2	22
23	23	2	23
24	24	2	24
25	25	2	25
26	26	2	26
27	27	2	27
28	28	2	28
29	29	2	29
30	30	2	30
31	31	2	31
32	32	3	1
33	33	3	2
34	34	3	3
35	35	3	4
36	36	3	5
37	37	3	6
38	38	3	7
39	39	3	8
40	40	3	9
41	41	3	10
42	42	3	11
43	43	3	12
44	44	3	13
45	45	3	14
46	46	3	15
47	47	3	16
48	48	3	17
49	49	3	18
50	50	3	19
51	51	3	20
52	52	3	21
53	53	3	22
54	54	3	23
55	55	3	24
56	56	3	25
57	57	3	26
58	58	3	27
59	59	3	28
60	60	3	29
61	61	3	30
62	62	1	1
63	63	1	2
64	64	1	3
65	65	1	4
67	67	1	6
68	68	1	7
69	69	1	8
70	70	1	9
71	71	1	10
72	72	1	11
74	74	1	13
75	75	1	14
76	76	1	15
77	77	1	16
78	78	1	17
79	79	1	18
81	81	1	20
82	82	1	21
83	83	1	22
84	84	1	23
85	85	1	24
86	86	1	25
87	87	1	26
88	88	1	27
89	89	1	28
90	90	1	29
91	91	1	30
92	92	1	31
93	93	1	32
94	94	1	33
95	95	1	34
96	96	1	35
97	97	1	36
98	98	1	37
99	99	1	38
100	100	1	39
101	101	1	40
102	102	1	41
103	103	1	42
104	104	1	43
105	105	1	44
106	106	1	45
107	107	1	46
108	108	1	47
109	109	1	48
110	110	1	49
111	111	1	50
112	112	1	51
113	113	1	52
114	114	1	53
115	115	1	54
116	116	1	55
117	117	1	56
118	118	1	57
119	119	1	58
120	120	1	59
121	121	1	60
122	122	1	61
123	123	1	62
124	124	1	63
125	125	1	64
126	126	1	65
127	127	1	66
128	128	1	67
129	129	1	68
130	130	1	69
131	131	1	70
132	132	1	71
133	133	1	72
134	134	1	73
135	135	1	74
136	136	1	75
137	137	1	76
138	138	1	77
139	139	1	78
140	140	1	79
141	141	1	80
142	142	1	81
143	143	1	82
149	149	1	86
150	150	1	87
151	151	1	88
152	152	1	89
158	158	1	90
159	159	1	91
160	160	1	92
161	161	1	93
162	162	1	94
163	163	1	95
165	165	1	97
167	167	1	99
169	169	1	101
175	175	1	102
176	176	1	103
177	177	1	104
\.


--
-- TOC entry 4213 (class 0 OID 40870)
-- Dependencies: 223
-- Data for Name: admin_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_roles (id, name, code, description, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
1	Super Admin	strapi-super-admin	Super Admins can access and manage all features and settings.	2025-01-14 17:38:53.097	2025-01-14 17:38:53.097	\N	\N	sa3g2w2av1npllggsu660p76	\N	2025-01-22 13:42:13.684
2	Editor	strapi-editor	Editors can manage and publish contents including those of other users.	2025-01-14 17:38:53.102	2025-01-14 17:38:53.102	\N	\N	rbipg8y7qailegwfoqfnfoo9	\N	2025-01-22 13:42:13.684
3	Author	strapi-author	Authors can manage the content they have created.	2025-01-14 17:38:53.104	2025-01-14 17:38:53.104	\N	\N	xjuz1tipv2a9z4oh92tg6tm9	\N	2025-01-22 13:42:13.684
\.


--
-- TOC entry 4215 (class 0 OID 40876)
-- Dependencies: 225
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, firstname, lastname, username, email, password, reset_password_token, registration_token, is_active, blocked, prefered_language, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
1	ZZKarte	Admin	\N	info@zskarte.ch	$2a$10$GZwYQnk9Jw2fKyKD1QHKReGuCGTKCYGf4NOZ/TdMQ9SsiaEGCksMK	\N	\N	t	f	\N	2025-01-14 17:40:44.88	2025-01-14 17:40:44.88	\N	\N	v6b931svgspbc1tbmdbxgv6k	\N	2025-01-22 13:42:13.681
\.


--
-- TOC entry 4217 (class 0 OID 40882)
-- Dependencies: 227
-- Data for Name: admin_users_roles_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users_roles_lnk (id, user_id, role_id, role_ord, user_ord) FROM stdin;
1	1	1	1	1
\.


--
-- TOC entry 4219 (class 0 OID 40886)
-- Dependencies: 229
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, name, alternative_text, caption, width, height, formats, hash, ext, mime, size, url, preview_url, provider, provider_metadata, folder_path, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
\.


--
-- TOC entry 4220 (class 0 OID 40891)
-- Dependencies: 230
-- Data for Name: files_folder_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files_folder_lnk (id, file_id, folder_id, file_ord) FROM stdin;
\.


--
-- TOC entry 4223 (class 0 OID 40896)
-- Dependencies: 233
-- Data for Name: files_related_mph; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files_related_mph (id, file_id, related_id, related_type, field, "order") FROM stdin;
\.


--
-- TOC entry 4225 (class 0 OID 40902)
-- Dependencies: 235
-- Data for Name: i18n_locale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.i18n_locale (id, name, code, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
2	English (en)	en	2025-01-14 17:38:53.059	2025-01-14 17:38:53.059	\N	\N	gaq0izgyr962jvcrbppkvxf6	\N	2025-01-22 13:42:13.64
\.


--
-- TOC entry 4227 (class 0 OID 40908)
-- Dependencies: 237
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entries (id, sender, creator, message_number, communication_type, communication_details, message_subject, message_content, visum_message, is_key_message, department, visum_triage, decision, created_at, updated_at, published_at, created_by_id, updated_by_id, document_id, locale, entry_status, date_message, date_triage, date_decision, date_decision_delivered, visum_decider, decision_receiver, decision_sender, is_drawn_on_map) FROM stdin;
\.


--
-- TOC entry 4229 (class 0 OID 40914)
-- Dependencies: 239
-- Data for Name: journal_entries_operation_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entries_operation_lnk (id, journal_entry_id, operation_id) FROM stdin;
\.


--
-- TOC entry 4231 (class 0 OID 40918)
-- Dependencies: 241
-- Data for Name: journal_entries_organization_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entries_organization_lnk (id, journal_entry_id, organization_id) FROM stdin;
\.


--
-- TOC entry 4233 (class 0 OID 40922)
-- Dependencies: 243
-- Data for Name: map_layers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.map_layers (id, label, server_layer_name, type, custom_source, options, public, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
1	112 Alarmzentralen	ch.bakom.notruf-112_zentral	wmts	\N	{"format": "png", "topics": "api,ech,inspire,notruf,service-wms", "opacity": 1, "tooltip": true, "hasLegend": true, "wmsLayers": "ch.bakom.notruf-112_zentral", "background": false, "chargeable": false, "searchable": false, "timestamps": ["current"], "attribution": "BAKOM", "resolutions": [4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1], "timeEnabled": false, "highlightable": true, "attributionUrl": "https://www.bakom.admin.ch/bakom/de/home.html"}	\N	2025-01-21 10:43:33.43	2025-01-21 10:43:33.43	\N	\N	b774pk7qyq91u6mqxz5gg80x	\N	2025-01-22 13:42:13.663
2	112 Mobilnetz	ch.bakom.notruf-112_mobilnetz	wmts	\N	{"format": "png", "topics": "api,ech,inspire,notruf,service-wms", "opacity": 1, "tooltip": true, "hasLegend": true, "background": false, "chargeable": false, "searchable": true, "timestamps": ["current"], "attribution": "BAKOM", "resolutions": [4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25], "timeEnabled": false, "highlightable": true, "attributionUrl": "https://www.bakom.admin.ch/bakom/de/home.html"}	\N	2025-01-21 10:43:33.455	2025-01-21 10:43:33.455	\N	\N	k5xtjl2l360yun6rnxwxncbn	\N	2025-01-22 13:42:13.663
3	117 Alarmzentralen	ch.bakom.notruf-117_zentral	wmts	\N	{"format": "png", "topics": "api,ech,inspire,notruf,service-wms", "opacity": 1, "tooltip": true, "hasLegend": true, "wmsLayers": "ch.bakom.notruf-117_zentral", "background": false, "chargeable": false, "searchable": false, "timestamps": ["current"], "attribution": "BAKOM", "resolutions": [4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1], "timeEnabled": false, "highlightable": true, "attributionUrl": "https://www.bakom.admin.ch/bakom/de/home.html"}	\N	2025-01-21 10:43:33.47	2025-01-21 10:43:33.47	\N	\N	pu4ekmhy07j5a5mo3bl4fjq5	\N	2025-01-22 13:42:13.663
4	112 Mobilnetz	ch.bakom.notruf-112_mobilnetz	wmts	\N	{"format": "png", "topics": "api,ech,inspire,notruf,service-wms", "opacity": 1, "tooltip": true, "hasLegend": true, "background": false, "chargeable": false, "searchable": true, "timestamps": ["current"], "attribution": "BAKOM", "resolutions": [4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25], "timeEnabled": false, "highlightable": true, "attributionUrl": "https://www.bakom.admin.ch/bakom/de/home.html"}	\N	2025-01-23 09:13:58.103	2025-01-23 09:13:58.103	\N	\N	mxkmcwq3dseg45fo92t46yii	\N	2025-01-23 09:13:58.1
5	112 Alarmzentralen	ch.bakom.notruf-112_zentral	wmts	\N	{"format": "png", "topics": "api,ech,inspire,notruf,service-wms", "opacity": 1, "tooltip": true, "hasLegend": true, "wmsLayers": "ch.bakom.notruf-112_zentral", "background": false, "chargeable": false, "searchable": false, "timestamps": ["current"], "attribution": "BAKOM", "resolutions": [4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1], "timeEnabled": false, "highlightable": true, "attributionUrl": "https://www.bakom.admin.ch/bakom/de/home.html"}	\N	2025-01-23 09:13:58.135	2025-01-23 09:13:58.135	\N	\N	lljhqmyubguxstpyat2tfbui	\N	2025-01-23 09:13:58.132
\.


--
-- TOC entry 4235 (class 0 OID 40928)
-- Dependencies: 245
-- Data for Name: map_layers_organization_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.map_layers_organization_lnk (id, map_layer_id, organization_id) FROM stdin;
1	1	3
2	2	3
3	3	3
4	4	3
5	5	3
\.


--
-- TOC entry 4237 (class 0 OID 40932)
-- Dependencies: 247
-- Data for Name: map_layers_wms_source_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.map_layers_wms_source_lnk (id, map_layer_id, wms_source_id, map_layer_ord) FROM stdin;
\.


--
-- TOC entry 4239 (class 0 OID 40936)
-- Dependencies: 249
-- Data for Name: map_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.map_snapshots (id, map_state, created_at, updated_at, published_at, created_by_id, updated_by_id, document_id, locale) FROM stdin;
75	{"id": "de1b8f0c-6386-42cd-8ea0-54df99ebda21", "name": "", "center": [7.44297, 46.94635], "layers": {"7b5e4a76-5f27-4ac0-b7a5-c1826331c111": {"id": "188e33f4-7033-40fa-934c-c606f4d8414d", "name": "Layer 1", "type": "draw"}}, "version": 2, "drawElements": {"e9b64fbb-c8bb-4939-a415-5cce61add17c": {"id": "e9b64fbb-c8bb-4939-a415-5cce61add17c", "type": "symbol", "arrow": "none", "color": "#FF0000", "layer": "7b5e4a76-5f27-4ac0-b7a5-c1826331c111", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": 10, "symbolId": 149, "createdAt": 1737449667953, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[[827716.939708197, 5933470.053374994], [828315.3307251703, 5933472.368281886], [828622.2479329704, 5933687.471689974], [828281.9763414399, 5933899.953205141], [827798.561980856, 5933893.738945966], [827716.939708197, 5933470.053374994]]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}}}	2025-01-22 08:05:00.015	2025-01-22 08:05:00.015	2025-01-22 08:05:00.013	\N	\N	pjtmiohvdf0qjqngggyrb1yy	\N
76	{"id": "08bcf71d-c7d0-45b8-89b0-edf394e2e8ca", "name": "", "center": [7.44297, 46.94635], "layers": {"5ff3d4b5-16f8-4122-b0de-3e72f14ddb5f": {"id": "5ff3d4b5-16f8-4122-b0de-3e72f14ddb5f", "name": "Layer 1", "type": "draw"}}, "version": 2, "drawElements": {"8a60cb42-8f73-4d8e-a769-cab4c6e17b49": {"id": "8a60cb42-8f73-4d8e-a769-cab4c6e17b49", "name": "Test2", "type": "symbol", "arrow": "none", "color": "#0000FF", "layer": "5ff3d4b5-16f8-4122-b0de-3e72f14ddb5f", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 2, "createdAt": 1736875313622, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[[828287.7912416547, 5933274.954141099], [829043.1461152112, 5932614.255504261], [828872.9729558037, 5933490.295508123], [828565.7039398786, 5933725.6528813485], [828260.9728721582, 5933801.614044346], [828191.9487115074, 5933515.980681095], [828287.7912416547, 5933274.954141099]]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}}}	2025-01-22 08:05:00.032	2025-01-22 08:05:00.032	2025-01-22 08:05:00.029	\N	\N	b58p3f5b9ljknqeba7umc38f	\N
77	{"id": "08bcf71d-c7d0-45b8-89b0-edf394e2e8ca", "name": "", "center": [7.44297, 46.94635], "layers": {"5ff3d4b5-16f8-4122-b0de-3e72f14ddb5f": {"id": "5ff3d4b5-16f8-4122-b0de-3e72f14ddb5f", "name": "Layer 1", "type": "draw"}}, "version": 2, "drawElements": {"8a60cb42-8f73-4d8e-a769-cab4c6e17b49": {"id": "8a60cb42-8f73-4d8e-a769-cab4c6e17b49", "name": "Test2", "type": "symbol", "arrow": "none", "color": "#0000FF", "layer": "5ff3d4b5-16f8-4122-b0de-3e72f14ddb5f", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 2, "createdAt": 1736875313622, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[[828287.7912416547, 5933274.954141099], [829043.1461152112, 5932614.255504261], [828872.9729558037, 5933490.295508123], [828565.7039398786, 5933725.6528813485], [828260.9728721582, 5933801.614044346], [828191.9487115074, 5933515.980681095], [828287.7912416547, 5933274.954141099]]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}}}	2025-01-22 08:10:00.019	2025-01-22 08:10:00.019	2025-01-22 08:10:00.014	\N	\N	x213xdh60tcpuvnosst8muif	\N
78	{"id": "de1b8f0c-6386-42cd-8ea0-54df99ebda21", "name": "", "center": [7.44297, 46.94635], "layers": {"7b5e4a76-5f27-4ac0-b7a5-c1826331c111": {"id": "188e33f4-7033-40fa-934c-c606f4d8414d", "name": "Layer 1", "type": "draw"}}, "version": 2, "drawElements": {"e9b64fbb-c8bb-4939-a415-5cce61add17c": {"id": "e9b64fbb-c8bb-4939-a415-5cce61add17c", "type": "symbol", "arrow": "none", "color": "#FF0000", "layer": "7b5e4a76-5f27-4ac0-b7a5-c1826331c111", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": 10, "symbolId": 149, "createdAt": 1737449667953, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[[827999.7249884997, 5933248.384126828], [828598.116005473, 5933250.69903372], [828675.796773953, 5933456.891631016], [828564.7616217425, 5933678.283956976], [828081.3472611586, 5933672.0696978], [827999.7249884997, 5933248.384126828]]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}}}	2025-01-22 08:10:00.034	2025-01-22 08:10:00.034	2025-01-22 08:10:00.033	\N	\N	inip8hzgf6vaexs8tsyz9kjf	\N
106	{"id": "33e9c037-5bc7-409c-a0fa-d6cff4536d92", "name": "", "center": [7.44297, 46.94635], "layers": {"e2da2911-4ec0-4263-8b2d-7b63fac6fec9": {"id": "dd9d2e8b-d8f2-49d2-a8a6-d2241f10ddf2", "name": "Layer 1", "type": "draw"}}, "version": 2, "drawElements": {"0196068e-39cb-4d31-adfb-1f7127417de0": {"id": "0196068e-39cb-4d31-adfb-1f7127417de0", "name": "UnbefahrBAR🍺", "type": "symbol", "arrow": "none", "color": "#FF0000", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 103, "createdAt": 1737625531155, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[827962.6934873783, 5933460.324996402], [828222.2527158498, 5933535.020759338], [828211.8974259195, 5933648.47306964], [828301.094697668, 5933680.142979015], [828272.7911294287, 5933796.075850429]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}, "1a30bcdf-2416-4d7a-9490-75ed233a39fc": {"id": "1a30bcdf-2416-4d7a-9490-75ed233a39fc", "name": "☢️Rädio Äktivvvv ☢️", "type": "symbol", "arrow": "none", "color": "#0000FF", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": -2, "symbolId": 1, "createdAt": 1737621904541, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [828262.9946665537, 5933549.599025192], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}, "90809e73-16e6-4de0-a347-0c158566be7d": {"id": "90809e73-16e6-4de0-a347-0c158566be7d", "name": "Der Schaden 🫡", "type": "symbol", "arrow": "", "color": "#FF0000", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "", "flipIcon": false, "fontSize": 1, "hideIcon": false, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 127, "createdAt": 1737625411035, "createdBy": "ZSO Development", "fillStyle": {"name": "cross", "size": 1, "spacing": 8}, "protected": false, "iconOffset": 0.1, "coordinates": [[[828101.7299051228, 5933454.133877739], [828144.0509324009, 5933310.813577351], [828315.8785398888, 5933353.559065369], [828283.8530449469, 5933474.004558481], [828101.7299051228, 5933454.133877739]]], "fillOpacity": 1, "iconOpacity": 0.5, "strokeWidth": 1, "reportNumber": 123}}}	2025-01-23 11:10:00.012	2025-01-23 11:10:00.012	2025-01-23 11:10:00.007	\N	\N	vglmw9bpjvp2sru5etb8tjql	\N
107	{"id": "33e9c037-5bc7-409c-a0fa-d6cff4536d92", "name": "", "center": [7.44297, 46.94635], "layers": {"e2da2911-4ec0-4263-8b2d-7b63fac6fec9": {"id": "dd9d2e8b-d8f2-49d2-a8a6-d2241f10ddf2", "name": "Layer 1", "type": "draw"}}, "version": 2, "drawElements": {"0196068e-39cb-4d31-adfb-1f7127417de0": {"id": "0196068e-39cb-4d31-adfb-1f7127417de0", "name": "UnbefahrBAR🍺", "type": "symbol", "arrow": "none", "color": "#FF0000", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 103, "createdAt": 1737625531155, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[827962.6934873783, 5933460.324996402], [828222.2527158498, 5933535.020759338], [828211.8974259195, 5933648.47306964], [828301.094697668, 5933680.142979015], [828272.7911294287, 5933796.075850429]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}, "1a30bcdf-2416-4d7a-9490-75ed233a39fc": {"id": "1a30bcdf-2416-4d7a-9490-75ed233a39fc", "name": "☢️Rädio Äktivvvv ☢️", "type": "symbol", "arrow": "none", "color": "#0000FF", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": -2, "symbolId": 1, "createdAt": 1737621904541, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [828262.9946665537, 5933549.599025192], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}, "90809e73-16e6-4de0-a347-0c158566be7d": {"id": "90809e73-16e6-4de0-a347-0c158566be7d", "name": "Der Schaden 🫡", "type": "symbol", "arrow": "", "color": "#FF0000", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "", "flipIcon": false, "fontSize": 1, "hideIcon": false, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 127, "createdAt": 1737625411035, "createdBy": "ZSO Development", "fillStyle": {"name": "cross", "size": 1, "spacing": 8}, "protected": false, "iconOffset": 0.1, "coordinates": [[[828101.7299051228, 5933454.133877739], [828144.0509324009, 5933310.813577351], [828315.8785398888, 5933353.559065369], [828283.8530449469, 5933474.004558481], [828101.7299051228, 5933454.133877739]]], "fillOpacity": 1, "iconOpacity": 0.5, "strokeWidth": 1, "reportNumber": 1234}}}	2025-01-23 14:45:00.029	2025-01-23 14:45:00.029	2025-01-23 14:45:00.021	\N	\N	o6uuql46uretkdrw1cp7228i	\N
108	{"id": "33e9c037-5bc7-409c-a0fa-d6cff4536d92", "name": "", "center": [7.44297, 46.94635], "layers": {"e2da2911-4ec0-4263-8b2d-7b63fac6fec9": {"id": "dd9d2e8b-d8f2-49d2-a8a6-d2241f10ddf2", "name": "Layer 1", "type": "draw"}}, "version": 2, "drawElements": {"0196068e-39cb-4d31-adfb-1f7127417de0": {"id": "0196068e-39cb-4d31-adfb-1f7127417de0", "name": "UnbefahrBAR🍺", "type": "symbol", "arrow": "none", "color": "#FF0000", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 103, "createdAt": 1737625531155, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[827962.6934873783, 5933460.324996402], [828222.2527158498, 5933535.020759338], [828211.8974259195, 5933648.47306964], [828301.094697668, 5933680.142979015], [828272.7911294287, 5933796.075850429]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}, "1a30bcdf-2416-4d7a-9490-75ed233a39fc": {"id": "1a30bcdf-2416-4d7a-9490-75ed233a39fc", "name": "☢️Rädio Äktivvvv ☢️", "type": "symbol", "arrow": "none", "color": "#0000FF", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": -2, "symbolId": 1, "createdAt": 1737621904541, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [828262.9946665537, 5933549.599025192], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}, "90809e73-16e6-4de0-a347-0c158566be7d": {"id": "90809e73-16e6-4de0-a347-0c158566be7d", "name": "Der Schaden 🫡", "type": "symbol", "arrow": "", "color": "#FF0000", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "", "flipIcon": false, "fontSize": 1, "hideIcon": false, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 127, "createdAt": 1737625411035, "createdBy": "ZSO Development", "fillStyle": {"name": "cross", "size": 1, "spacing": 8}, "protected": false, "iconOffset": 0.1, "coordinates": [[[828103.8700314824, 5933443.146652157], [828146.1910587605, 5933299.826351769], [828318.0186662484, 5933342.571839787], [828285.9931713066, 5933463.017332899], [828103.8700314824, 5933443.146652157]]], "fillOpacity": 1, "iconOpacity": 0.5, "strokeWidth": 1, "reportNumber": 1234}}}	2025-01-23 15:05:00.033	2025-01-23 15:05:00.033	2025-01-23 15:05:00.024	\N	\N	iw1egbgtrt2scmxe89fp706x	\N
109	{"id": "33e9c037-5bc7-409c-a0fa-d6cff4536d92", "name": "", "center": [7.44297, 46.94635], "layers": {"e2da2911-4ec0-4263-8b2d-7b63fac6fec9": {"id": "dd9d2e8b-d8f2-49d2-a8a6-d2241f10ddf2", "name": "Layer 1", "type": "draw"}}, "version": 2, "drawElements": {"0196068e-39cb-4d31-adfb-1f7127417de0": {"id": "0196068e-39cb-4d31-adfb-1f7127417de0", "name": "UnbefahrBAR🍺", "type": "symbol", "arrow": "none", "color": "#FF0000", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 103, "createdAt": 1737625531155, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[827962.6934873783, 5933460.324996402], [828222.2527158498, 5933535.020759338], [828211.8974259195, 5933648.47306964], [828301.094697668, 5933680.142979015], [828272.7911294287, 5933796.075850429]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}, "1a30bcdf-2416-4d7a-9490-75ed233a39fc": {"id": "1a30bcdf-2416-4d7a-9490-75ed233a39fc", "name": "☢️Rädio Äktivvvv ☢️", "type": "symbol", "arrow": "none", "color": "#0000FF", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": -2, "symbolId": 1, "createdAt": 1737621904541, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [828262.9946665537, 5933549.599025192], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}, "90809e73-16e6-4de0-a347-0c158566be7d": {"id": "90809e73-16e6-4de0-a347-0c158566be7d", "name": "Der Schaden! 🫡", "type": "symbol", "arrow": "", "color": "#FF0000", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "", "flipIcon": false, "fontSize": 1, "hideIcon": false, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 127, "createdAt": 1737625411035, "createdBy": "ZSO Development", "fillStyle": {"name": "cross", "size": 1, "spacing": 8}, "protected": false, "iconOffset": 0.1, "coordinates": [[[828103.8700314824, 5933443.146652157], [828146.1910587605, 5933299.826351769], [828318.0186662484, 5933342.571839787], [828282.1279145416, 5933478.099265068], [828103.8700314824, 5933443.146652157]]], "fillOpacity": 1, "iconOpacity": 0.5, "strokeWidth": 1, "reportNumber": 1234}}}	2025-01-23 15:10:00.028	2025-01-23 15:10:00.028	2025-01-23 15:10:00.02	\N	\N	snmyxbwsqtvr1j3qpkq3se7k	\N
\.


--
-- TOC entry 4241 (class 0 OID 40942)
-- Dependencies: 251
-- Data for Name: map_snapshots_operation_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.map_snapshots_operation_lnk (id, map_snapshot_id, operation_id, map_snapshot_ord) FROM stdin;
75	75	5	1
76	76	4	1
77	77	4	2
78	78	5	2
102	106	7	1
103	107	7	2
104	108	7	3
105	109	7	4
\.


--
-- TOC entry 4243 (class 0 OID 40946)
-- Dependencies: 253
-- Data for Name: operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operations (id, name, description, status, map_state, event_states, map_layers, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at, phase) FROM stdin;
5	GGGGGG2		active	{"id": "de1b8f0c-6386-42cd-8ea0-54df99ebda21", "name": "", "center": [7.44297, 46.94635], "layers": {"7b5e4a76-5f27-4ac0-b7a5-c1826331c111": {"id": "188e33f4-7033-40fa-934c-c606f4d8414d", "name": "Layer 1", "type": "draw"}}, "version": 2, "drawElements": {"e9b64fbb-c8bb-4939-a415-5cce61add17c": {"id": "e9b64fbb-c8bb-4939-a415-5cce61add17c", "type": "symbol", "arrow": "none", "color": "#FF0000", "layer": "7b5e4a76-5f27-4ac0-b7a5-c1826331c111", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": 10, "symbolId": 149, "createdAt": 1737449667953, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[[827846.7109715503, 5932951.3508799495], [828474.8509925624, 5932707.48777802], [828924.9262484662, 5933206.147946799], [828643.9417917059, 5933643.300194381], [828175.5037340854, 5933682.302486645], [827553.9116991363, 5933442.662325825], [827846.7109715503, 5932951.3508799495]]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}}}	[7, 19]	\N	2025-01-21 09:53:58.119	2025-01-22 16:16:41.952	\N	\N	o7sll22u98n89o28l92ra00p	\N	2025-01-22 16:16:41.948	active
8	Tet		active	{"id": "3f6155a1-c5af-4d5c-9a6e-11d9852dd8dd", "name": "", "center": [7.44297, 46.94635], "layers": {"5f747bea-e683-47df-b3ea-e3ccb5e06a6e": {"id": "776aa6cb-d5a0-47fa-8154-c9f6ba7fa07f", "name": "Layer 1", "type": "draw"}}, "version": 2}	[]	\N	2025-01-22 15:08:01.128	2025-01-23 07:57:26.418	\N	\N	tkagzxy1za7fw7wr32y9ws9s	\N	2025-01-23 07:57:26.408	archived
4	Test22		active	{"id": "08bcf71d-c7d0-45b8-89b0-edf394e2e8ca", "name": "", "center": [7.44297, 46.94635], "layers": {"5ff3d4b5-16f8-4122-b0de-3e72f14ddb5f": {"id": "5ff3d4b5-16f8-4122-b0de-3e72f14ddb5f", "name": "Layer 1", "type": "draw"}}, "version": 2, "drawElements": {"3178270e-2616-43e6-be79-4397bf17c32f": {"id": "3178270e-2616-43e6-be79-4397bf17c32f", "name": "Möööin222", "type": "symbol", "arrow": "none", "color": "#FF0000", "layer": "5ff3d4b5-16f8-4122-b0de-3e72f14ddb5f", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 149, "createdAt": 1737619243221, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[[828071.4008198903, 5934401.275223735], [827724.7002998717, 5934160.366088811], [827588.920070916, 5933905.628868449], [826563.972458512, 5933239.533816095], [828941.9100022798, 5933271.933331955], [828980.2778500078, 5934081.16698869], [828662.2674198024, 5934611.807439976], [828071.4008198903, 5934401.275223735]]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1, "reportNumber": 123}, "8a60cb42-8f73-4d8e-a769-cab4c6e17b49": {"id": "8a60cb42-8f73-4d8e-a769-cab4c6e17b49", "name": "Test222", "type": "symbol", "arrow": "", "color": "#0000FF", "layer": "5ff3d4b5-16f8-4122-b0de-3e72f14ddb5f", "style": "", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": -169, "symbolId": 3, "createdAt": 1736875313622, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[[827527.9756734973, 5932822.007524004], [826533.1819925589, 5932690.900299692], [828283.3305470538, 5932161.308887166], [828784.2619274851, 5932219.814653468], [829100.9964051731, 5932620.236477788], [828987.1992864028, 5933054.916092007], [828453.9595733328, 5933439.014025279], [828069.4759955085, 5932802.046583489], [827868.1189472114, 5932877.592201959], [827746.5175595834, 5932954.094738505], [827432.13314335, 5933063.0340640005], [827527.9756734973, 5932822.007524004]]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1, "reportNumber": 1234}}}	[7]	\N	2025-01-14 18:21:44.436	2025-01-23 09:13:00.013	\N	\N	txdte2ttq1ok2fzjleh4mqgc	\N	2025-01-23 09:13:00.007	active
7	HHHH		active	{"id": "33e9c037-5bc7-409c-a0fa-d6cff4536d92", "name": "", "center": [7.44297, 46.94635], "layers": {"e2da2911-4ec0-4263-8b2d-7b63fac6fec9": {"id": "dd9d2e8b-d8f2-49d2-a8a6-d2241f10ddf2", "name": "Layer 1", "type": "draw"}}, "version": 2, "drawElements": {"0196068e-39cb-4d31-adfb-1f7127417de0": {"id": "0196068e-39cb-4d31-adfb-1f7127417de0", "name": "UnbefahrBAR🍺", "type": "symbol", "arrow": "none", "color": "#FF0000", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 103, "createdAt": 1737625531155, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [[827962.6934873783, 5933460.324996402], [828222.2527158498, 5933535.020759338], [828211.8974259195, 5933648.47306964], [828301.094697668, 5933680.142979015], [828272.7911294287, 5933796.075850429]], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}, "1a30bcdf-2416-4d7a-9490-75ed233a39fc": {"id": "1a30bcdf-2416-4d7a-9490-75ed233a39fc", "name": "☢️Rädio Äktivvvv ☢️", "type": "symbol", "arrow": "none", "color": "#0000FF", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "solid", "flipIcon": false, "fontSize": 1, "iconSize": 1, "nameShow": true, "rotation": -2, "symbolId": 1, "createdAt": 1737621904541, "createdBy": "ZSO Development", "fillStyle": {"name": "filled", "size": 5, "angle": 45, "spacing": 10}, "protected": false, "iconOffset": 0.1, "coordinates": [828262.9946665537, 5933549.599025192], "fillOpacity": 0.2, "iconOpacity": 0.5, "strokeWidth": 1}, "90809e73-16e6-4de0-a347-0c158566be7d": {"id": "90809e73-16e6-4de0-a347-0c158566be7d", "name": "Der Schaden! 🫡", "type": "symbol", "arrow": "", "color": "#FF0000", "layer": "e2da2911-4ec0-4263-8b2d-7b63fac6fec9", "style": "", "flipIcon": false, "fontSize": 1, "hideIcon": false, "iconSize": 1, "nameShow": true, "rotation": 1, "symbolId": 127, "createdAt": 1737625411035, "createdBy": "ZSO Development", "fillStyle": {"name": "cross", "size": 1, "spacing": 8}, "protected": false, "iconOffset": 0.1, "coordinates": [[[828103.8700314824, 5933443.146652157], [828146.1910587605, 5933299.826351769], [828318.0186662484, 5933342.571839787], [828282.1279145416, 5933478.099265068], [828103.8700314824, 5933443.146652157]]], "fillOpacity": 1, "iconOpacity": 0.5, "strokeWidth": 1, "reportNumber": 1234}}}	[]	\N	2025-01-22 14:53:10.233	2025-01-23 15:05:30.016	\N	\N	sw6d1p5if5ert4u725zco5rn	\N	2025-01-23 15:05:30.009	active
\.


--
-- TOC entry 4245 (class 0 OID 40952)
-- Dependencies: 255
-- Data for Name: operations_organization_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operations_organization_lnk (id, operation_id, organization_id, operation_ord) FROM stdin;
3	4	3	1
5	5	3	2
7	7	3	3
8	8	3	4
\.


--
-- TOC entry 4247 (class 0 OID 40956)
-- Dependencies: 257
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, map_longitude, map_latitude, map_zoom_level, default_locale, url, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
4	ZSO Gast (1h)	7.44297	46.94635	16.00	de-CH	\N	2025-01-14 18:06:29.541	2025-01-14 18:06:29.541	\N	\N	an92vebwaeo4srt2i2n9aote	\N	2025-01-22 13:42:13.672
3	ZSO Development	7.44297	46.94635	16.00	de-CH	\N	2025-01-14 18:04:02.567	2025-01-21 10:43:33.61	\N	\N	fb4s0f6iyhhp5lcpg0zfwjdz	\N	2025-01-22 13:42:13.672
\.


--
-- TOC entry 4249 (class 0 OID 40962)
-- Dependencies: 259
-- Data for Name: organizations_map_layer_favorites_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations_map_layer_favorites_lnk (id, organization_id, map_layer_id, map_layer_ord) FROM stdin;
1	3	1	1
2	3	2	2
3	3	3	3
\.


--
-- TOC entry 4251 (class 0 OID 40966)
-- Dependencies: 261
-- Data for Name: organizations_wms_sources_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations_wms_sources_lnk (id, organization_id, wms_source_id, wms_source_ord) FROM stdin;
\.


--
-- TOC entry 4253 (class 0 OID 40970)
-- Dependencies: 263
-- Data for Name: strapi_api_token_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_api_token_permissions (id, action, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
\.


--
-- TOC entry 4255 (class 0 OID 40976)
-- Dependencies: 265
-- Data for Name: strapi_api_token_permissions_token_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_api_token_permissions_token_lnk (id, api_token_permission_id, api_token_id, api_token_permission_ord) FROM stdin;
\.


--
-- TOC entry 4257 (class 0 OID 40980)
-- Dependencies: 267
-- Data for Name: strapi_api_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_api_tokens (id, name, description, type, access_key, last_used_at, expires_at, lifespan, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
\.


--
-- TOC entry 4259 (class 0 OID 40986)
-- Dependencies: 269
-- Data for Name: strapi_core_store_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_core_store_settings (id, key, value, type, environment, tag) FROM stdin;
32	plugin_content_manager_configuration_content_types::admin::transfer-token	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"description":{"edit":{"label":"description","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"description","searchable":true,"sortable":true}},"accessKey":{"edit":{"label":"accessKey","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"accessKey","searchable":true,"sortable":true}},"lastUsedAt":{"edit":{"label":"lastUsedAt","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"lastUsedAt","searchable":true,"sortable":true}},"permissions":{"edit":{"label":"permissions","description":"","placeholder":"","visible":true,"editable":true,"mainField":"action"},"list":{"label":"permissions","searchable":false,"sortable":false}},"expiresAt":{"edit":{"label":"expiresAt","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"expiresAt","searchable":true,"sortable":true}},"lifespan":{"edit":{"label":"lifespan","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"lifespan","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","description","accessKey"],"edit":[[{"name":"name","size":6},{"name":"description","size":6}],[{"name":"accessKey","size":6},{"name":"lastUsedAt","size":6}],[{"name":"permissions","size":6},{"name":"expiresAt","size":6}],[{"name":"lifespan","size":4}]]},"uid":"admin::transfer-token"}	object	\N	\N
33	plugin_content_manager_configuration_content_types::admin::api-token	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"description":{"edit":{"label":"description","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"description","searchable":true,"sortable":true}},"type":{"edit":{"label":"type","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"type","searchable":true,"sortable":true}},"accessKey":{"edit":{"label":"accessKey","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"accessKey","searchable":true,"sortable":true}},"lastUsedAt":{"edit":{"label":"lastUsedAt","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"lastUsedAt","searchable":true,"sortable":true}},"permissions":{"edit":{"label":"permissions","description":"","placeholder":"","visible":true,"editable":true,"mainField":"action"},"list":{"label":"permissions","searchable":false,"sortable":false}},"expiresAt":{"edit":{"label":"expiresAt","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"expiresAt","searchable":true,"sortable":true}},"lifespan":{"edit":{"label":"lifespan","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"lifespan","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","description","type"],"edit":[[{"name":"name","size":6},{"name":"description","size":6}],[{"name":"type","size":6},{"name":"accessKey","size":6}],[{"name":"lastUsedAt","size":6},{"name":"permissions","size":6}],[{"name":"expiresAt","size":6},{"name":"lifespan","size":4}]]},"uid":"admin::api-token"}	object	\N	\N
34	plugin_content_manager_configuration_content_types::admin::transfer-token-permission	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"action","defaultSortBy":"action","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"action":{"edit":{"label":"action","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"action","searchable":true,"sortable":true}},"token":{"edit":{"label":"token","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"token","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","action","token","createdAt"],"edit":[[{"name":"action","size":6},{"name":"token","size":6}]]},"uid":"admin::transfer-token-permission"}	object	\N	\N
35	plugin_content_manager_configuration_content_types::admin::permission	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"action","defaultSortBy":"action","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"action":{"edit":{"label":"action","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"action","searchable":true,"sortable":true}},"actionParameters":{"edit":{"label":"actionParameters","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"actionParameters","searchable":false,"sortable":false}},"subject":{"edit":{"label":"subject","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"subject","searchable":true,"sortable":true}},"properties":{"edit":{"label":"properties","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"properties","searchable":false,"sortable":false}},"conditions":{"edit":{"label":"conditions","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"conditions","searchable":false,"sortable":false}},"role":{"edit":{"label":"role","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"role","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","action","subject","role"],"edit":[[{"name":"action","size":6}],[{"name":"actionParameters","size":12}],[{"name":"subject","size":6}],[{"name":"properties","size":12}],[{"name":"conditions","size":12}],[{"name":"role","size":6}]]},"uid":"admin::permission"}	object	\N	\N
36	plugin_content_manager_configuration_content_types::admin::api-token-permission	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"action","defaultSortBy":"action","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"action":{"edit":{"label":"action","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"action","searchable":true,"sortable":true}},"token":{"edit":{"label":"token","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"token","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","action","token","createdAt"],"edit":[[{"name":"action","size":6},{"name":"token","size":6}]]},"uid":"admin::api-token-permission"}	object	\N	\N
37	plugin_content_manager_configuration_content_types::admin::user	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"firstname","defaultSortBy":"firstname","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"firstname":{"edit":{"label":"firstname","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"firstname","searchable":true,"sortable":true}},"lastname":{"edit":{"label":"lastname","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"lastname","searchable":true,"sortable":true}},"username":{"edit":{"label":"username","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"username","searchable":true,"sortable":true}},"email":{"edit":{"label":"email","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"email","searchable":true,"sortable":true}},"password":{"edit":{"label":"password","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"password","searchable":true,"sortable":true}},"resetPasswordToken":{"edit":{"label":"resetPasswordToken","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"resetPasswordToken","searchable":true,"sortable":true}},"registrationToken":{"edit":{"label":"registrationToken","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"registrationToken","searchable":true,"sortable":true}},"isActive":{"edit":{"label":"isActive","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"isActive","searchable":true,"sortable":true}},"roles":{"edit":{"label":"roles","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"roles","searchable":false,"sortable":false}},"blocked":{"edit":{"label":"blocked","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"blocked","searchable":true,"sortable":true}},"preferedLanguage":{"edit":{"label":"preferedLanguage","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"preferedLanguage","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","firstname","lastname","username"],"edit":[[{"name":"firstname","size":6},{"name":"lastname","size":6}],[{"name":"username","size":6},{"name":"email","size":6}],[{"name":"password","size":6},{"name":"isActive","size":4}],[{"name":"roles","size":6},{"name":"blocked","size":4}],[{"name":"preferedLanguage","size":6}]]},"uid":"admin::user"}	object	\N	\N
38	plugin_content_manager_configuration_content_types::admin::role	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"code":{"edit":{"label":"code","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"code","searchable":true,"sortable":true}},"description":{"edit":{"label":"description","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"description","searchable":true,"sortable":true}},"users":{"edit":{"label":"users","description":"","placeholder":"","visible":true,"editable":true,"mainField":"firstname"},"list":{"label":"users","searchable":false,"sortable":false}},"permissions":{"edit":{"label":"permissions","description":"","placeholder":"","visible":true,"editable":true,"mainField":"action"},"list":{"label":"permissions","searchable":false,"sortable":false}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","code","description"],"edit":[[{"name":"name","size":6},{"name":"code","size":6}],[{"name":"description","size":6},{"name":"users","size":6}],[{"name":"permissions","size":6}]]},"uid":"admin::role"}	object	\N	\N
39	plugin_content_manager_configuration_content_types::plugin::content-releases.release	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"releasedAt":{"edit":{"label":"releasedAt","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"releasedAt","searchable":true,"sortable":true}},"scheduledAt":{"edit":{"label":"scheduledAt","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"scheduledAt","searchable":true,"sortable":true}},"timezone":{"edit":{"label":"timezone","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"timezone","searchable":true,"sortable":true}},"status":{"edit":{"label":"status","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"status","searchable":true,"sortable":true}},"actions":{"edit":{"label":"actions","description":"","placeholder":"","visible":true,"editable":true,"mainField":"contentType"},"list":{"label":"actions","searchable":false,"sortable":false}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","releasedAt","scheduledAt"],"edit":[[{"name":"name","size":6},{"name":"releasedAt","size":6}],[{"name":"scheduledAt","size":6},{"name":"timezone","size":6}],[{"name":"status","size":6},{"name":"actions","size":6}]]},"uid":"plugin::content-releases.release"}	object	\N	\N
31	strapi_content_types_schema	{"plugin::upload.file":{"collectionName":"files","info":{"singularName":"file","pluralName":"files","displayName":"File","description":""},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","configurable":false,"required":true},"alternativeText":{"type":"string","configurable":false},"caption":{"type":"string","configurable":false},"width":{"type":"integer","configurable":false},"height":{"type":"integer","configurable":false},"formats":{"type":"json","configurable":false},"hash":{"type":"string","configurable":false,"required":true},"ext":{"type":"string","configurable":false},"mime":{"type":"string","configurable":false,"required":true},"size":{"type":"decimal","configurable":false,"required":true},"url":{"type":"string","configurable":false,"required":true},"previewUrl":{"type":"string","configurable":false},"provider":{"type":"string","configurable":false,"required":true},"provider_metadata":{"type":"json","configurable":false},"related":{"type":"relation","relation":"morphToMany","configurable":false},"folder":{"type":"relation","relation":"manyToOne","target":"plugin::upload.folder","inversedBy":"files","private":true},"folderPath":{"type":"string","minLength":1,"required":true,"private":true,"searchable":false},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"plugin::upload.file","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"files"}}},"indexes":[{"name":"upload_files_folder_path_index","columns":["folder_path"],"type":null},{"name":"upload_files_created_at_index","columns":["created_at"],"type":null},{"name":"upload_files_updated_at_index","columns":["updated_at"],"type":null},{"name":"upload_files_name_index","columns":["name"],"type":null},{"name":"upload_files_size_index","columns":["size"],"type":null},{"name":"upload_files_ext_index","columns":["ext"],"type":null}],"plugin":"upload","globalId":"UploadFile","uid":"plugin::upload.file","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"files","info":{"singularName":"file","pluralName":"files","displayName":"File","description":""},"options":{},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","configurable":false,"required":true},"alternativeText":{"type":"string","configurable":false},"caption":{"type":"string","configurable":false},"width":{"type":"integer","configurable":false},"height":{"type":"integer","configurable":false},"formats":{"type":"json","configurable":false},"hash":{"type":"string","configurable":false,"required":true},"ext":{"type":"string","configurable":false},"mime":{"type":"string","configurable":false,"required":true},"size":{"type":"decimal","configurable":false,"required":true},"url":{"type":"string","configurable":false,"required":true},"previewUrl":{"type":"string","configurable":false},"provider":{"type":"string","configurable":false,"required":true},"provider_metadata":{"type":"json","configurable":false},"related":{"type":"relation","relation":"morphToMany","configurable":false},"folder":{"type":"relation","relation":"manyToOne","target":"plugin::upload.folder","inversedBy":"files","private":true},"folderPath":{"type":"string","minLength":1,"required":true,"private":true,"searchable":false}},"kind":"collectionType"},"modelName":"file"},"plugin::upload.folder":{"collectionName":"upload_folders","info":{"singularName":"folder","pluralName":"folders","displayName":"Folder"},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","minLength":1,"required":true},"pathId":{"type":"integer","unique":true,"required":true},"parent":{"type":"relation","relation":"manyToOne","target":"plugin::upload.folder","inversedBy":"children"},"children":{"type":"relation","relation":"oneToMany","target":"plugin::upload.folder","mappedBy":"parent"},"files":{"type":"relation","relation":"oneToMany","target":"plugin::upload.file","mappedBy":"folder"},"path":{"type":"string","minLength":1,"required":true},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"plugin::upload.folder","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"upload_folders"}}},"indexes":[{"name":"upload_folders_path_id_index","columns":["path_id"],"type":"unique"},{"name":"upload_folders_path_index","columns":["path"],"type":"unique"}],"plugin":"upload","globalId":"UploadFolder","uid":"plugin::upload.folder","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"upload_folders","info":{"singularName":"folder","pluralName":"folders","displayName":"Folder"},"options":{},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","minLength":1,"required":true},"pathId":{"type":"integer","unique":true,"required":true},"parent":{"type":"relation","relation":"manyToOne","target":"plugin::upload.folder","inversedBy":"children"},"children":{"type":"relation","relation":"oneToMany","target":"plugin::upload.folder","mappedBy":"parent"},"files":{"type":"relation","relation":"oneToMany","target":"plugin::upload.file","mappedBy":"folder"},"path":{"type":"string","minLength":1,"required":true}},"kind":"collectionType"},"modelName":"folder"},"plugin::i18n.locale":{"info":{"singularName":"locale","pluralName":"locales","collectionName":"locales","displayName":"Locale","description":""},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","min":1,"max":50,"configurable":false},"code":{"type":"string","unique":true,"configurable":false},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"plugin::i18n.locale","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"i18n_locale"}}},"plugin":"i18n","collectionName":"i18n_locale","globalId":"I18NLocale","uid":"plugin::i18n.locale","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"i18n_locale","info":{"singularName":"locale","pluralName":"locales","collectionName":"locales","displayName":"Locale","description":""},"options":{},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","min":1,"max":50,"configurable":false},"code":{"type":"string","unique":true,"configurable":false}},"kind":"collectionType"},"modelName":"locale"},"plugin::content-releases.release":{"collectionName":"strapi_releases","info":{"singularName":"release","pluralName":"releases","displayName":"Release"},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","required":true},"releasedAt":{"type":"datetime"},"scheduledAt":{"type":"datetime"},"timezone":{"type":"string"},"status":{"type":"enumeration","enum":["ready","blocked","failed","done","empty"],"required":true},"actions":{"type":"relation","relation":"oneToMany","target":"plugin::content-releases.release-action","mappedBy":"release"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"plugin::content-releases.release","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"strapi_releases"}}},"plugin":"content-releases","globalId":"ContentReleasesRelease","uid":"plugin::content-releases.release","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"strapi_releases","info":{"singularName":"release","pluralName":"releases","displayName":"Release"},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","required":true},"releasedAt":{"type":"datetime"},"scheduledAt":{"type":"datetime"},"timezone":{"type":"string"},"status":{"type":"enumeration","enum":["ready","blocked","failed","done","empty"],"required":true},"actions":{"type":"relation","relation":"oneToMany","target":"plugin::content-releases.release-action","mappedBy":"release"}},"kind":"collectionType"},"modelName":"release"},"plugin::content-releases.release-action":{"collectionName":"strapi_release_actions","info":{"singularName":"release-action","pluralName":"release-actions","displayName":"Release Action"},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"type":{"type":"enumeration","enum":["publish","unpublish"],"required":true},"contentType":{"type":"string","required":true},"entryDocumentId":{"type":"string"},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"release":{"type":"relation","relation":"manyToOne","target":"plugin::content-releases.release","inversedBy":"actions"},"isEntryValid":{"type":"boolean"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"localizations":{"type":"relation","relation":"oneToMany","target":"plugin::content-releases.release-action","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"strapi_release_actions"}}},"plugin":"content-releases","globalId":"ContentReleasesReleaseAction","uid":"plugin::content-releases.release-action","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"strapi_release_actions","info":{"singularName":"release-action","pluralName":"release-actions","displayName":"Release Action"},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"type":{"type":"enumeration","enum":["publish","unpublish"],"required":true},"contentType":{"type":"string","required":true},"entryDocumentId":{"type":"string"},"locale":{"type":"string"},"release":{"type":"relation","relation":"manyToOne","target":"plugin::content-releases.release","inversedBy":"actions"},"isEntryValid":{"type":"boolean"}},"kind":"collectionType"},"modelName":"release-action"},"plugin::review-workflows.workflow":{"collectionName":"strapi_workflows","info":{"name":"Workflow","description":"","singularName":"workflow","pluralName":"workflows","displayName":"Workflow"},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","required":true,"unique":true},"stages":{"type":"relation","target":"plugin::review-workflows.workflow-stage","relation":"oneToMany","mappedBy":"workflow"},"stageRequiredToPublish":{"type":"relation","target":"plugin::review-workflows.workflow-stage","relation":"oneToOne","required":false},"contentTypes":{"type":"json","required":true,"default":"[]"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"plugin::review-workflows.workflow","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"strapi_workflows"}}},"plugin":"review-workflows","globalId":"ReviewWorkflowsWorkflow","uid":"plugin::review-workflows.workflow","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"strapi_workflows","info":{"name":"Workflow","description":"","singularName":"workflow","pluralName":"workflows","displayName":"Workflow"},"options":{},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","required":true,"unique":true},"stages":{"type":"relation","target":"plugin::review-workflows.workflow-stage","relation":"oneToMany","mappedBy":"workflow"},"stageRequiredToPublish":{"type":"relation","target":"plugin::review-workflows.workflow-stage","relation":"oneToOne","required":false},"contentTypes":{"type":"json","required":true,"default":"[]"}},"kind":"collectionType"},"modelName":"workflow"},"plugin::review-workflows.workflow-stage":{"collectionName":"strapi_workflows_stages","info":{"name":"Workflow Stage","description":"","singularName":"workflow-stage","pluralName":"workflow-stages","displayName":"Stages"},"options":{"version":"1.1.0","draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","configurable":false},"color":{"type":"string","configurable":false,"default":"#4945FF"},"workflow":{"type":"relation","target":"plugin::review-workflows.workflow","relation":"manyToOne","inversedBy":"stages","configurable":false},"permissions":{"type":"relation","target":"admin::permission","relation":"manyToMany","configurable":false},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"plugin::review-workflows.workflow-stage","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"strapi_workflows_stages"}}},"plugin":"review-workflows","globalId":"ReviewWorkflowsWorkflowStage","uid":"plugin::review-workflows.workflow-stage","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"strapi_workflows_stages","info":{"name":"Workflow Stage","description":"","singularName":"workflow-stage","pluralName":"workflow-stages","displayName":"Stages"},"options":{"version":"1.1.0"},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","configurable":false},"color":{"type":"string","configurable":false,"default":"#4945FF"},"workflow":{"type":"relation","target":"plugin::review-workflows.workflow","relation":"manyToOne","inversedBy":"stages","configurable":false},"permissions":{"type":"relation","target":"admin::permission","relation":"manyToMany","configurable":false}},"kind":"collectionType"},"modelName":"workflow-stage"},"plugin::users-permissions.permission":{"collectionName":"up_permissions","info":{"name":"permission","description":"","singularName":"permission","pluralName":"permissions","displayName":"Permission"},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"action":{"type":"string","required":true,"configurable":false},"role":{"type":"relation","relation":"manyToOne","target":"plugin::users-permissions.role","inversedBy":"permissions","configurable":false},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"plugin::users-permissions.permission","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"up_permissions"}}},"plugin":"users-permissions","globalId":"UsersPermissionsPermission","uid":"plugin::users-permissions.permission","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"up_permissions","info":{"name":"permission","description":"","singularName":"permission","pluralName":"permissions","displayName":"Permission"},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"action":{"type":"string","required":true,"configurable":false},"role":{"type":"relation","relation":"manyToOne","target":"plugin::users-permissions.role","inversedBy":"permissions","configurable":false}},"kind":"collectionType"},"modelName":"permission","options":{"draftAndPublish":false}},"plugin::users-permissions.role":{"collectionName":"up_roles","info":{"name":"role","description":"","singularName":"role","pluralName":"roles","displayName":"Role"},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","minLength":3,"required":true,"configurable":false},"description":{"type":"string","configurable":false},"type":{"type":"string","unique":true,"configurable":false},"permissions":{"type":"relation","relation":"oneToMany","target":"plugin::users-permissions.permission","mappedBy":"role","configurable":false},"users":{"type":"relation","relation":"oneToMany","target":"plugin::users-permissions.user","mappedBy":"role","configurable":false},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"plugin::users-permissions.role","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"up_roles"}}},"plugin":"users-permissions","globalId":"UsersPermissionsRole","uid":"plugin::users-permissions.role","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"up_roles","info":{"name":"role","description":"","singularName":"role","pluralName":"roles","displayName":"Role"},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","minLength":3,"required":true,"configurable":false},"description":{"type":"string","configurable":false},"type":{"type":"string","unique":true,"configurable":false},"permissions":{"type":"relation","relation":"oneToMany","target":"plugin::users-permissions.permission","mappedBy":"role","configurable":false},"users":{"type":"relation","relation":"oneToMany","target":"plugin::users-permissions.user","mappedBy":"role","configurable":false}},"kind":"collectionType"},"modelName":"role","options":{"draftAndPublish":false}},"plugin::users-permissions.user":{"collectionName":"up_users","info":{"name":"user","description":"","singularName":"user","pluralName":"users","displayName":"User"},"options":{"draftAndPublish":false,"timestamps":true},"attributes":{"username":{"type":"string","minLength":3,"unique":true,"configurable":false,"required":true},"email":{"type":"email","minLength":6,"configurable":false,"required":true},"provider":{"type":"string","configurable":false},"password":{"type":"password","minLength":6,"configurable":false,"private":true},"resetPasswordToken":{"type":"string","configurable":false,"private":true},"confirmationToken":{"type":"string","configurable":false,"private":true},"confirmed":{"type":"boolean","default":false,"configurable":false},"blocked":{"type":"boolean","default":false,"configurable":false},"role":{"type":"relation","relation":"manyToOne","target":"plugin::users-permissions.role","inversedBy":"users","configurable":false},"organization":{"type":"relation","relation":"manyToOne","target":"api::organization.organization","inversedBy":"users"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"plugin::users-permissions.user","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"up_users"}}},"config":{"attributes":{"resetPasswordToken":{"hidden":true},"confirmationToken":{"hidden":true},"provider":{"hidden":true}}},"plugin":"users-permissions","globalId":"UsersPermissionsUser","kind":"collectionType","__filename__":"schema.json","uid":"plugin::users-permissions.user","modelType":"contentType","__schema__":{"collectionName":"up_users","info":{"name":"user","description":"","singularName":"user","pluralName":"users","displayName":"User"},"options":{"draftAndPublish":false,"timestamps":true},"attributes":{"username":{"type":"string","minLength":3,"unique":true,"configurable":false,"required":true},"email":{"type":"email","minLength":6,"configurable":false,"required":true},"provider":{"type":"string","configurable":false},"password":{"type":"password","minLength":6,"configurable":false,"private":true},"resetPasswordToken":{"type":"string","configurable":false,"private":true},"confirmationToken":{"type":"string","configurable":false,"private":true},"confirmed":{"type":"boolean","default":false,"configurable":false},"blocked":{"type":"boolean","default":false,"configurable":false},"role":{"type":"relation","relation":"manyToOne","target":"plugin::users-permissions.role","inversedBy":"users","configurable":false},"organization":{"type":"relation","relation":"manyToOne","target":"api::organization.organization","inversedBy":"users"}},"kind":"collectionType"},"modelName":"user"},"api::access.access":{"kind":"collectionType","collectionName":"accesses","info":{"singularName":"access","pluralName":"accesses","displayName":"Access","description":""},"options":{"draftAndPublish":false},"pluginOptions":{},"attributes":{"accessToken":{"type":"string","required":true,"private":true,"unique":true},"operation":{"type":"relation","relation":"oneToOne","target":"api::operation.operation"},"type":{"type":"enumeration","enum":["read","write","all"],"required":true,"default":"read"},"name":{"type":"string"},"active":{"type":"boolean","required":true,"default":true},"expiresOn":{"type":"datetime"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"api::access.access","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"accesses"}}},"apiName":"access","globalId":"Access","uid":"api::access.access","modelType":"contentType","__schema__":{"collectionName":"accesses","info":{"singularName":"access","pluralName":"accesses","displayName":"Access","description":""},"options":{"draftAndPublish":false},"pluginOptions":{},"attributes":{"accessToken":{"type":"string","required":true,"private":true,"unique":true},"operation":{"type":"relation","relation":"oneToOne","target":"api::operation.operation"},"type":{"type":"enumeration","enum":["read","write","all"],"required":true,"default":"read"},"name":{"type":"string"},"active":{"type":"boolean","required":true,"default":true},"expiresOn":{"type":"datetime"}},"kind":"collectionType"},"modelName":"access","actions":{},"lifecycles":{}},"api::journal-entry.journal-entry":{"kind":"collectionType","collectionName":"journal_entries","info":{"singularName":"journal-entry","pluralName":"journal-entries","displayName":"Journal Entry","description":""},"options":{"draftAndPublish":false},"pluginOptions":{},"attributes":{"sender":{"type":"string"},"creator":{"type":"string"},"message_number":{"type":"integer"},"communication_type":{"type":"string"},"communication_details":{"type":"string"},"message_subject":{"type":"string"},"message_content":{"type":"text"},"visum_message":{"type":"string"},"is_key_message":{"type":"boolean"},"department":{"type":"string"},"date_message":{"type":"datetime"},"visum_triage":{"type":"string"},"date_triage":{"type":"datetime"},"decision":{"type":"text"},"date_decision":{"type":"datetime"},"operation":{"type":"relation","relation":"oneToOne","target":"api::operation.operation"},"organization":{"type":"relation","relation":"oneToOne","target":"api::organization.organization"},"date_decision_delivered":{"type":"datetime"},"visum_decider":{"type":"string"},"decision_receiver":{"type":"string"},"entry_status":{"type":"enumeration","enum":["awaiting_message","awaiting_triage","awaiting_drawing","awaiting_decision","awaiting_completion","completed"]},"decision_sender":{"type":"string"},"is_drawn_on_map":{"type":"boolean"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"api::journal-entry.journal-entry","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"journal_entries"}}},"apiName":"journal-entry","globalId":"JournalEntry","uid":"api::journal-entry.journal-entry","modelType":"contentType","__schema__":{"collectionName":"journal_entries","info":{"singularName":"journal-entry","pluralName":"journal-entries","displayName":"Journal Entry","description":""},"options":{"draftAndPublish":false},"pluginOptions":{},"attributes":{"sender":{"type":"string"},"creator":{"type":"string"},"message_number":{"type":"integer"},"communication_type":{"type":"string"},"communication_details":{"type":"string"},"message_subject":{"type":"string"},"message_content":{"type":"text"},"visum_message":{"type":"string"},"is_key_message":{"type":"boolean"},"department":{"type":"string"},"date_message":{"type":"datetime"},"visum_triage":{"type":"string"},"date_triage":{"type":"datetime"},"decision":{"type":"text"},"date_decision":{"type":"datetime"},"operation":{"type":"relation","relation":"oneToOne","target":"api::operation.operation"},"organization":{"type":"relation","relation":"oneToOne","target":"api::organization.organization"},"date_decision_delivered":{"type":"datetime"},"visum_decider":{"type":"string"},"decision_receiver":{"type":"string"},"entry_status":{"type":"enumeration","enum":["awaiting_message","awaiting_triage","awaiting_drawing","awaiting_decision","awaiting_completion","completed"]},"decision_sender":{"type":"string"},"is_drawn_on_map":{"type":"boolean"}},"kind":"collectionType"},"modelName":"journal-entry","actions":{},"lifecycles":{}},"api::map-layer.map-layer":{"kind":"collectionType","collectionName":"map_layers","info":{"singularName":"map-layer","pluralName":"map-layers","displayName":"Map Layer","description":""},"options":{"draftAndPublish":false},"attributes":{"label":{"type":"string"},"serverLayerName":{"type":"text"},"type":{"type":"enumeration","enum":["wms","wms_custom","wmts","aggregate","geojson","csv"]},"wms_source":{"type":"relation","relation":"manyToOne","target":"api::wms-source.wms-source","inversedBy":"map_layers"},"custom_source":{"type":"string"},"options":{"type":"json"},"public":{"type":"boolean"},"organization":{"type":"relation","relation":"oneToOne","target":"api::organization.organization"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"api::map-layer.map-layer","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"map_layers"}}},"apiName":"map-layer","globalId":"MapLayer","uid":"api::map-layer.map-layer","modelType":"contentType","__schema__":{"collectionName":"map_layers","info":{"singularName":"map-layer","pluralName":"map-layers","displayName":"Map Layer","description":""},"options":{"draftAndPublish":false},"attributes":{"label":{"type":"string"},"serverLayerName":{"type":"text"},"type":{"type":"enumeration","enum":["wms","wms_custom","wmts","aggregate","geojson","csv"]},"wms_source":{"type":"relation","relation":"manyToOne","target":"api::wms-source.wms-source","inversedBy":"map_layers"},"custom_source":{"type":"string"},"options":{"type":"json"},"public":{"type":"boolean"},"organization":{"type":"relation","relation":"oneToOne","target":"api::organization.organization"}},"kind":"collectionType"},"modelName":"map-layer","actions":{},"lifecycles":{}},"api::map-snapshot.map-snapshot":{"kind":"collectionType","collectionName":"map_snapshots","info":{"singularName":"map-snapshot","pluralName":"map-snapshots","displayName":"Map Snapshot","description":""},"options":{"draftAndPublish":false},"pluginOptions":{},"attributes":{"mapState":{"type":"json"},"operation":{"type":"relation","relation":"manyToOne","target":"api::operation.operation","inversedBy":"mapSnapshots"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"api::map-snapshot.map-snapshot","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"map_snapshots"}}},"apiName":"map-snapshot","globalId":"MapSnapshot","uid":"api::map-snapshot.map-snapshot","modelType":"contentType","__schema__":{"collectionName":"map_snapshots","info":{"singularName":"map-snapshot","pluralName":"map-snapshots","displayName":"Map Snapshot","description":""},"options":{"draftAndPublish":false},"pluginOptions":{},"attributes":{"mapState":{"type":"json"},"operation":{"type":"relation","relation":"manyToOne","target":"api::operation.operation","inversedBy":"mapSnapshots"}},"kind":"collectionType"},"modelName":"map-snapshot","actions":{},"lifecycles":{}},"api::operation.operation":{"kind":"collectionType","collectionName":"operations","info":{"singularName":"operation","pluralName":"operations","displayName":"Operation","description":""},"options":{"draftAndPublish":false},"pluginOptions":{},"attributes":{"name":{"type":"string","required":true},"description":{"type":"richtext"},"status":{"type":"enumeration","enum":["active","archived","deleted"],"default":"active","required":false},"organization":{"type":"relation","relation":"manyToOne","target":"api::organization.organization","inversedBy":"operations"},"mapState":{"type":"json"},"mapSnapshots":{"type":"relation","relation":"oneToMany","target":"api::map-snapshot.map-snapshot","mappedBy":"operation"},"eventStates":{"type":"json"},"mapLayers":{"type":"json"},"phase":{"type":"enumeration","enum":["active","archived","deleted"],"required":true,"default":"active"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"api::operation.operation","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"operations"}}},"apiName":"operation","globalId":"Operation","uid":"api::operation.operation","modelType":"contentType","__schema__":{"collectionName":"operations","info":{"singularName":"operation","pluralName":"operations","displayName":"Operation","description":""},"options":{"draftAndPublish":false},"pluginOptions":{},"attributes":{"name":{"type":"string","required":true},"description":{"type":"richtext"},"status":{"type":"enumeration","enum":["active","archived","deleted"],"default":"active","required":false},"organization":{"type":"relation","relation":"manyToOne","target":"api::organization.organization","inversedBy":"operations"},"mapState":{"type":"json"},"mapSnapshots":{"type":"relation","relation":"oneToMany","target":"api::map-snapshot.map-snapshot","mappedBy":"operation"},"eventStates":{"type":"json"},"mapLayers":{"type":"json"},"phase":{"type":"enumeration","enum":["active","archived","deleted"],"required":true,"default":"active"}},"kind":"collectionType"},"modelName":"operation","actions":{},"lifecycles":{}},"api::organization.organization":{"kind":"collectionType","collectionName":"organizations","info":{"singularName":"organization","pluralName":"organizations","displayName":"Organization","description":""},"options":{"draftAndPublish":false},"pluginOptions":{},"attributes":{"name":{"type":"string","required":true},"mapLongitude":{"type":"float","default":7.44297},"mapLatitude":{"type":"float","default":46.94635},"mapZoomLevel":{"type":"decimal","default":16},"defaultLocale":{"type":"enumeration","enum":["de-CH","fr-CH","it-CH","en-US"],"default":"de-CH"},"url":{"type":"string"},"logo":{"type":"media","multiple":false,"required":false,"allowedTypes":["images"]},"operations":{"type":"relation","relation":"oneToMany","target":"api::operation.operation","mappedBy":"organization"},"users":{"type":"relation","relation":"oneToMany","target":"plugin::users-permissions.user","mappedBy":"organization"},"wms_sources":{"type":"relation","relation":"oneToMany","target":"api::wms-source.wms-source"},"map_layer_favorites":{"type":"relation","relation":"oneToMany","target":"api::map-layer.map-layer"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"api::organization.organization","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"organizations"}}},"apiName":"organization","globalId":"Organization","uid":"api::organization.organization","modelType":"contentType","__schema__":{"collectionName":"organizations","info":{"singularName":"organization","pluralName":"organizations","displayName":"Organization","description":""},"options":{"draftAndPublish":false},"pluginOptions":{},"attributes":{"name":{"type":"string","required":true},"mapLongitude":{"type":"float","default":7.44297},"mapLatitude":{"type":"float","default":46.94635},"mapZoomLevel":{"type":"decimal","default":16},"defaultLocale":{"type":"enumeration","enum":["de-CH","fr-CH","it-CH","en-US"],"default":"de-CH"},"url":{"type":"string"},"logo":{"type":"media","multiple":false,"required":false,"allowedTypes":["images"]},"operations":{"type":"relation","relation":"oneToMany","target":"api::operation.operation","mappedBy":"organization"},"users":{"type":"relation","relation":"oneToMany","target":"plugin::users-permissions.user","mappedBy":"organization"},"wms_sources":{"type":"relation","relation":"oneToMany","target":"api::wms-source.wms-source"},"map_layer_favorites":{"type":"relation","relation":"oneToMany","target":"api::map-layer.map-layer"}},"kind":"collectionType"},"modelName":"organization","actions":{},"lifecycles":{}},"api::wms-source.wms-source":{"kind":"collectionType","collectionName":"wms_sources","info":{"singularName":"wms-source","pluralName":"wms-sources","displayName":"WMS Source","description":""},"options":{"draftAndPublish":false},"attributes":{"label":{"type":"string"},"type":{"type":"enumeration","enum":["wms","wmts"]},"url":{"type":"string"},"attribution":{"type":"json"},"public":{"type":"boolean"},"organization":{"type":"relation","relation":"oneToOne","target":"api::organization.organization"},"map_layers":{"type":"relation","relation":"oneToMany","target":"api::map-layer.map-layer","mappedBy":"wms_source"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"api::wms-source.wms-source","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"wms_sources"}}},"apiName":"wms-source","globalId":"WmsSource","uid":"api::wms-source.wms-source","modelType":"contentType","__schema__":{"collectionName":"wms_sources","info":{"singularName":"wms-source","pluralName":"wms-sources","displayName":"WMS Source","description":""},"options":{"draftAndPublish":false},"attributes":{"label":{"type":"string"},"type":{"type":"enumeration","enum":["wms","wmts"]},"url":{"type":"string"},"attribution":{"type":"json"},"public":{"type":"boolean"},"organization":{"type":"relation","relation":"oneToOne","target":"api::organization.organization"},"map_layers":{"type":"relation","relation":"oneToMany","target":"api::map-layer.map-layer","mappedBy":"wms_source"}},"kind":"collectionType"},"modelName":"wms-source","actions":{},"lifecycles":{}},"admin::permission":{"collectionName":"admin_permissions","info":{"name":"Permission","description":"","singularName":"permission","pluralName":"permissions","displayName":"Permission"},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"action":{"type":"string","minLength":1,"configurable":false,"required":true},"actionParameters":{"type":"json","configurable":false,"required":false,"default":{}},"subject":{"type":"string","minLength":1,"configurable":false,"required":false},"properties":{"type":"json","configurable":false,"required":false,"default":{}},"conditions":{"type":"json","configurable":false,"required":false,"default":[]},"role":{"configurable":false,"type":"relation","relation":"manyToOne","inversedBy":"permissions","target":"admin::role"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"admin::permission","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"admin_permissions"}}},"plugin":"admin","globalId":"AdminPermission","uid":"admin::permission","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"admin_permissions","info":{"name":"Permission","description":"","singularName":"permission","pluralName":"permissions","displayName":"Permission"},"options":{},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"action":{"type":"string","minLength":1,"configurable":false,"required":true},"actionParameters":{"type":"json","configurable":false,"required":false,"default":{}},"subject":{"type":"string","minLength":1,"configurable":false,"required":false},"properties":{"type":"json","configurable":false,"required":false,"default":{}},"conditions":{"type":"json","configurable":false,"required":false,"default":[]},"role":{"configurable":false,"type":"relation","relation":"manyToOne","inversedBy":"permissions","target":"admin::role"}},"kind":"collectionType"},"modelName":"permission"},"admin::user":{"collectionName":"admin_users","info":{"name":"User","description":"","singularName":"user","pluralName":"users","displayName":"User"},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"firstname":{"type":"string","unique":false,"minLength":1,"configurable":false,"required":false},"lastname":{"type":"string","unique":false,"minLength":1,"configurable":false,"required":false},"username":{"type":"string","unique":false,"configurable":false,"required":false},"email":{"type":"email","minLength":6,"configurable":false,"required":true,"unique":true,"private":true},"password":{"type":"password","minLength":6,"configurable":false,"required":false,"private":true,"searchable":false},"resetPasswordToken":{"type":"string","configurable":false,"private":true,"searchable":false},"registrationToken":{"type":"string","configurable":false,"private":true,"searchable":false},"isActive":{"type":"boolean","default":false,"configurable":false,"private":true},"roles":{"configurable":false,"private":true,"type":"relation","relation":"manyToMany","inversedBy":"users","target":"admin::role","collectionName":"strapi_users_roles"},"blocked":{"type":"boolean","default":false,"configurable":false,"private":true},"preferedLanguage":{"type":"string","configurable":false,"required":false,"searchable":false},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"admin::user","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"admin_users"}}},"config":{"attributes":{"resetPasswordToken":{"hidden":true},"registrationToken":{"hidden":true}}},"plugin":"admin","globalId":"AdminUser","uid":"admin::user","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"admin_users","info":{"name":"User","description":"","singularName":"user","pluralName":"users","displayName":"User"},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"firstname":{"type":"string","unique":false,"minLength":1,"configurable":false,"required":false},"lastname":{"type":"string","unique":false,"minLength":1,"configurable":false,"required":false},"username":{"type":"string","unique":false,"configurable":false,"required":false},"email":{"type":"email","minLength":6,"configurable":false,"required":true,"unique":true,"private":true},"password":{"type":"password","minLength":6,"configurable":false,"required":false,"private":true,"searchable":false},"resetPasswordToken":{"type":"string","configurable":false,"private":true,"searchable":false},"registrationToken":{"type":"string","configurable":false,"private":true,"searchable":false},"isActive":{"type":"boolean","default":false,"configurable":false,"private":true},"roles":{"configurable":false,"private":true,"type":"relation","relation":"manyToMany","inversedBy":"users","target":"admin::role","collectionName":"strapi_users_roles"},"blocked":{"type":"boolean","default":false,"configurable":false,"private":true},"preferedLanguage":{"type":"string","configurable":false,"required":false,"searchable":false}},"kind":"collectionType"},"modelName":"user","options":{"draftAndPublish":false}},"admin::role":{"collectionName":"admin_roles","info":{"name":"Role","description":"","singularName":"role","pluralName":"roles","displayName":"Role"},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","minLength":1,"unique":true,"configurable":false,"required":true},"code":{"type":"string","minLength":1,"unique":true,"configurable":false,"required":true},"description":{"type":"string","configurable":false},"users":{"configurable":false,"type":"relation","relation":"manyToMany","mappedBy":"roles","target":"admin::user"},"permissions":{"configurable":false,"type":"relation","relation":"oneToMany","mappedBy":"role","target":"admin::permission"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"admin::role","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"admin_roles"}}},"plugin":"admin","globalId":"AdminRole","uid":"admin::role","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"admin_roles","info":{"name":"Role","description":"","singularName":"role","pluralName":"roles","displayName":"Role"},"options":{},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","minLength":1,"unique":true,"configurable":false,"required":true},"code":{"type":"string","minLength":1,"unique":true,"configurable":false,"required":true},"description":{"type":"string","configurable":false},"users":{"configurable":false,"type":"relation","relation":"manyToMany","mappedBy":"roles","target":"admin::user"},"permissions":{"configurable":false,"type":"relation","relation":"oneToMany","mappedBy":"role","target":"admin::permission"}},"kind":"collectionType"},"modelName":"role"},"admin::api-token":{"collectionName":"strapi_api_tokens","info":{"name":"Api Token","singularName":"api-token","pluralName":"api-tokens","displayName":"Api Token","description":""},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","minLength":1,"configurable":false,"required":true,"unique":true},"description":{"type":"string","minLength":1,"configurable":false,"required":false,"default":""},"type":{"type":"enumeration","enum":["read-only","full-access","custom"],"configurable":false,"required":true,"default":"read-only"},"accessKey":{"type":"string","minLength":1,"configurable":false,"required":true,"searchable":false},"lastUsedAt":{"type":"datetime","configurable":false,"required":false},"permissions":{"type":"relation","target":"admin::api-token-permission","relation":"oneToMany","mappedBy":"token","configurable":false,"required":false},"expiresAt":{"type":"datetime","configurable":false,"required":false},"lifespan":{"type":"biginteger","configurable":false,"required":false},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"admin::api-token","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"strapi_api_tokens"}}},"plugin":"admin","globalId":"AdminApiToken","uid":"admin::api-token","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"strapi_api_tokens","info":{"name":"Api Token","singularName":"api-token","pluralName":"api-tokens","displayName":"Api Token","description":""},"options":{},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","minLength":1,"configurable":false,"required":true,"unique":true},"description":{"type":"string","minLength":1,"configurable":false,"required":false,"default":""},"type":{"type":"enumeration","enum":["read-only","full-access","custom"],"configurable":false,"required":true,"default":"read-only"},"accessKey":{"type":"string","minLength":1,"configurable":false,"required":true,"searchable":false},"lastUsedAt":{"type":"datetime","configurable":false,"required":false},"permissions":{"type":"relation","target":"admin::api-token-permission","relation":"oneToMany","mappedBy":"token","configurable":false,"required":false},"expiresAt":{"type":"datetime","configurable":false,"required":false},"lifespan":{"type":"biginteger","configurable":false,"required":false}},"kind":"collectionType"},"modelName":"api-token"},"admin::api-token-permission":{"collectionName":"strapi_api_token_permissions","info":{"name":"API Token Permission","description":"","singularName":"api-token-permission","pluralName":"api-token-permissions","displayName":"API Token Permission"},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"action":{"type":"string","minLength":1,"configurable":false,"required":true},"token":{"configurable":false,"type":"relation","relation":"manyToOne","inversedBy":"permissions","target":"admin::api-token"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"admin::api-token-permission","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"strapi_api_token_permissions"}}},"plugin":"admin","globalId":"AdminApiTokenPermission","uid":"admin::api-token-permission","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"strapi_api_token_permissions","info":{"name":"API Token Permission","description":"","singularName":"api-token-permission","pluralName":"api-token-permissions","displayName":"API Token Permission"},"options":{},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"action":{"type":"string","minLength":1,"configurable":false,"required":true},"token":{"configurable":false,"type":"relation","relation":"manyToOne","inversedBy":"permissions","target":"admin::api-token"}},"kind":"collectionType"},"modelName":"api-token-permission"},"admin::transfer-token":{"collectionName":"strapi_transfer_tokens","info":{"name":"Transfer Token","singularName":"transfer-token","pluralName":"transfer-tokens","displayName":"Transfer Token","description":""},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","minLength":1,"configurable":false,"required":true,"unique":true},"description":{"type":"string","minLength":1,"configurable":false,"required":false,"default":""},"accessKey":{"type":"string","minLength":1,"configurable":false,"required":true},"lastUsedAt":{"type":"datetime","configurable":false,"required":false},"permissions":{"type":"relation","target":"admin::transfer-token-permission","relation":"oneToMany","mappedBy":"token","configurable":false,"required":false},"expiresAt":{"type":"datetime","configurable":false,"required":false},"lifespan":{"type":"biginteger","configurable":false,"required":false},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"admin::transfer-token","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"strapi_transfer_tokens"}}},"plugin":"admin","globalId":"AdminTransferToken","uid":"admin::transfer-token","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"strapi_transfer_tokens","info":{"name":"Transfer Token","singularName":"transfer-token","pluralName":"transfer-tokens","displayName":"Transfer Token","description":""},"options":{},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"name":{"type":"string","minLength":1,"configurable":false,"required":true,"unique":true},"description":{"type":"string","minLength":1,"configurable":false,"required":false,"default":""},"accessKey":{"type":"string","minLength":1,"configurable":false,"required":true},"lastUsedAt":{"type":"datetime","configurable":false,"required":false},"permissions":{"type":"relation","target":"admin::transfer-token-permission","relation":"oneToMany","mappedBy":"token","configurable":false,"required":false},"expiresAt":{"type":"datetime","configurable":false,"required":false},"lifespan":{"type":"biginteger","configurable":false,"required":false}},"kind":"collectionType"},"modelName":"transfer-token"},"admin::transfer-token-permission":{"collectionName":"strapi_transfer_token_permissions","info":{"name":"Transfer Token Permission","description":"","singularName":"transfer-token-permission","pluralName":"transfer-token-permissions","displayName":"Transfer Token Permission"},"options":{"draftAndPublish":false},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"action":{"type":"string","minLength":1,"configurable":false,"required":true},"token":{"configurable":false,"type":"relation","relation":"manyToOne","inversedBy":"permissions","target":"admin::transfer-token"},"createdAt":{"type":"datetime"},"updatedAt":{"type":"datetime"},"publishedAt":{"type":"datetime","configurable":false,"writable":true,"visible":false},"createdBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"updatedBy":{"type":"relation","relation":"oneToOne","target":"admin::user","configurable":false,"writable":false,"visible":false,"useJoinTable":false,"private":true},"locale":{"writable":true,"private":true,"configurable":false,"visible":false,"type":"string"},"localizations":{"type":"relation","relation":"oneToMany","target":"admin::transfer-token-permission","writable":false,"private":true,"configurable":false,"visible":false,"unstable_virtual":true,"joinColumn":{"name":"document_id","referencedColumn":"document_id","referencedTable":"strapi_transfer_token_permissions"}}},"plugin":"admin","globalId":"AdminTransferTokenPermission","uid":"admin::transfer-token-permission","modelType":"contentType","kind":"collectionType","__schema__":{"collectionName":"strapi_transfer_token_permissions","info":{"name":"Transfer Token Permission","description":"","singularName":"transfer-token-permission","pluralName":"transfer-token-permissions","displayName":"Transfer Token Permission"},"options":{},"pluginOptions":{"content-manager":{"visible":false},"content-type-builder":{"visible":false}},"attributes":{"action":{"type":"string","minLength":1,"configurable":false,"required":true},"token":{"configurable":false,"type":"relation","relation":"manyToOne","inversedBy":"permissions","target":"admin::transfer-token"}},"kind":"collectionType"},"modelName":"transfer-token-permission"}}	object	\N	\N
40	plugin_content_manager_configuration_content_types::plugin::users-permissions.permission	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"action","defaultSortBy":"action","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"action":{"edit":{"label":"action","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"action","searchable":true,"sortable":true}},"role":{"edit":{"label":"role","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"role","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","action","role","createdAt"],"edit":[[{"name":"action","size":6},{"name":"role","size":6}]]},"uid":"plugin::users-permissions.permission"}	object	\N	\N
41	plugin_content_manager_configuration_content_types::api::map-layer.map-layer	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"label","defaultSortBy":"label","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"label":{"edit":{"label":"label","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"label","searchable":true,"sortable":true}},"serverLayerName":{"edit":{"label":"serverLayerName","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"serverLayerName","searchable":true,"sortable":true}},"type":{"edit":{"label":"type","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"type","searchable":true,"sortable":true}},"wms_source":{"edit":{"label":"wms_source","description":"","placeholder":"","visible":true,"editable":true,"mainField":"label"},"list":{"label":"wms_source","searchable":true,"sortable":true}},"custom_source":{"edit":{"label":"custom_source","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"custom_source","searchable":true,"sortable":true}},"options":{"edit":{"label":"options","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"options","searchable":false,"sortable":false}},"public":{"edit":{"label":"public","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"public","searchable":true,"sortable":true}},"organization":{"edit":{"label":"organization","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"organization","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","label","serverLayerName","type"],"edit":[[{"name":"label","size":6},{"name":"serverLayerName","size":6}],[{"name":"type","size":6},{"name":"wms_source","size":6}],[{"name":"custom_source","size":6}],[{"name":"options","size":12}],[{"name":"public","size":4},{"name":"organization","size":6}]]},"uid":"api::map-layer.map-layer"}	object	\N	\N
42	plugin_content_manager_configuration_content_types::plugin::users-permissions.user	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"username","defaultSortBy":"username","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"username":{"edit":{"label":"username","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"username","searchable":true,"sortable":true}},"email":{"edit":{"label":"email","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"email","searchable":true,"sortable":true}},"provider":{"edit":{"label":"provider","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"provider","searchable":true,"sortable":true}},"password":{"edit":{"label":"password","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"password","searchable":true,"sortable":true}},"resetPasswordToken":{"edit":{"label":"resetPasswordToken","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"resetPasswordToken","searchable":true,"sortable":true}},"confirmationToken":{"edit":{"label":"confirmationToken","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"confirmationToken","searchable":true,"sortable":true}},"confirmed":{"edit":{"label":"confirmed","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"confirmed","searchable":true,"sortable":true}},"blocked":{"edit":{"label":"blocked","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"blocked","searchable":true,"sortable":true}},"role":{"edit":{"label":"role","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"role","searchable":true,"sortable":true}},"organization":{"edit":{"label":"organization","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"organization","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","username","email","confirmed"],"edit":[[{"name":"username","size":6},{"name":"email","size":6}],[{"name":"password","size":6},{"name":"confirmed","size":4}],[{"name":"blocked","size":4},{"name":"role","size":6}],[{"name":"organization","size":6}]]},"uid":"plugin::users-permissions.user"}	object	\N	\N
44	plugin_content_manager_configuration_content_types::plugin::i18n.locale	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"code":{"edit":{"label":"code","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"code","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","code","createdAt"],"edit":[[{"name":"name","size":6},{"name":"code","size":6}]]},"uid":"plugin::i18n.locale"}	object	\N	\N
45	plugin_content_manager_configuration_content_types::plugin::upload.folder	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"pathId":{"edit":{"label":"pathId","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"pathId","searchable":true,"sortable":true}},"parent":{"edit":{"label":"parent","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"parent","searchable":true,"sortable":true}},"children":{"edit":{"label":"children","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"children","searchable":false,"sortable":false}},"files":{"edit":{"label":"files","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"files","searchable":false,"sortable":false}},"path":{"edit":{"label":"path","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"path","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","pathId","parent"],"edit":[[{"name":"name","size":6},{"name":"pathId","size":4}],[{"name":"parent","size":6},{"name":"children","size":6}],[{"name":"files","size":6},{"name":"path","size":6}]]},"uid":"plugin::upload.folder"}	object	\N	\N
46	plugin_content_manager_configuration_content_types::api::wms-source.wms-source	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"label","defaultSortBy":"label","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"label":{"edit":{"label":"label","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"label","searchable":true,"sortable":true}},"type":{"edit":{"label":"type","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"type","searchable":true,"sortable":true}},"url":{"edit":{"label":"url","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"url","searchable":true,"sortable":true}},"attribution":{"edit":{"label":"attribution","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"attribution","searchable":false,"sortable":false}},"public":{"edit":{"label":"public","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"public","searchable":true,"sortable":true}},"organization":{"edit":{"label":"organization","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"organization","searchable":true,"sortable":true}},"map_layers":{"edit":{"label":"map_layers","description":"","placeholder":"","visible":true,"editable":true,"mainField":"label"},"list":{"label":"map_layers","searchable":false,"sortable":false}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","label","type","url"],"edit":[[{"name":"label","size":6},{"name":"type","size":6}],[{"name":"url","size":6}],[{"name":"attribution","size":12}],[{"name":"public","size":4},{"name":"organization","size":6}],[{"name":"map_layers","size":6}]]},"uid":"api::wms-source.wms-source"}	object	\N	\N
63	plugin_content_manager_configuration_content_types::plugin::review-workflows.workflow	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"stages":{"edit":{"label":"stages","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"stages","searchable":false,"sortable":false}},"stageRequiredToPublish":{"edit":{"label":"stageRequiredToPublish","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"stageRequiredToPublish","searchable":true,"sortable":true}},"contentTypes":{"edit":{"label":"contentTypes","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"contentTypes","searchable":false,"sortable":false}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","stages","stageRequiredToPublish"],"edit":[[{"name":"name","size":6},{"name":"stages","size":6}],[{"name":"stageRequiredToPublish","size":6}],[{"name":"contentTypes","size":12}]]},"uid":"plugin::review-workflows.workflow"}	object	\N	\N
47	plugin_content_manager_configuration_content_types::plugin::upload.file	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"alternativeText":{"edit":{"label":"alternativeText","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"alternativeText","searchable":true,"sortable":true}},"caption":{"edit":{"label":"caption","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"caption","searchable":true,"sortable":true}},"width":{"edit":{"label":"width","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"width","searchable":true,"sortable":true}},"height":{"edit":{"label":"height","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"height","searchable":true,"sortable":true}},"formats":{"edit":{"label":"formats","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"formats","searchable":false,"sortable":false}},"hash":{"edit":{"label":"hash","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"hash","searchable":true,"sortable":true}},"ext":{"edit":{"label":"ext","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"ext","searchable":true,"sortable":true}},"mime":{"edit":{"label":"mime","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"mime","searchable":true,"sortable":true}},"size":{"edit":{"label":"size","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"size","searchable":true,"sortable":true}},"url":{"edit":{"label":"url","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"url","searchable":true,"sortable":true}},"previewUrl":{"edit":{"label":"previewUrl","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"previewUrl","searchable":true,"sortable":true}},"provider":{"edit":{"label":"provider","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"provider","searchable":true,"sortable":true}},"provider_metadata":{"edit":{"label":"provider_metadata","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"provider_metadata","searchable":false,"sortable":false}},"folder":{"edit":{"label":"folder","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"folder","searchable":true,"sortable":true}},"folderPath":{"edit":{"label":"folderPath","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"folderPath","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","alternativeText","caption"],"edit":[[{"name":"name","size":6},{"name":"alternativeText","size":6}],[{"name":"caption","size":6},{"name":"width","size":4}],[{"name":"height","size":4}],[{"name":"formats","size":12}],[{"name":"hash","size":6},{"name":"ext","size":6}],[{"name":"mime","size":6},{"name":"size","size":4}],[{"name":"url","size":6},{"name":"previewUrl","size":6}],[{"name":"provider","size":6}],[{"name":"provider_metadata","size":12}],[{"name":"folder","size":6},{"name":"folderPath","size":6}]]},"uid":"plugin::upload.file"}	object	\N	\N
48	plugin_content_manager_configuration_content_types::api::map-snapshot.map-snapshot	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"id","defaultSortBy":"id","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"mapState":{"edit":{"label":"mapState","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"mapState","searchable":false,"sortable":false}},"operation":{"edit":{"label":"operation","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"operation","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","operation","createdAt","updatedAt"],"edit":[[{"name":"mapState","size":12}],[{"name":"operation","size":6}]]},"uid":"api::map-snapshot.map-snapshot"}	object	\N	\N
50	plugin_content_manager_configuration_content_types::plugin::users-permissions.role	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"description":{"edit":{"label":"description","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"description","searchable":true,"sortable":true}},"type":{"edit":{"label":"type","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"type","searchable":true,"sortable":true}},"permissions":{"edit":{"label":"permissions","description":"","placeholder":"","visible":true,"editable":true,"mainField":"action"},"list":{"label":"permissions","searchable":false,"sortable":false}},"users":{"edit":{"label":"users","description":"","placeholder":"","visible":true,"editable":true,"mainField":"username"},"list":{"label":"users","searchable":false,"sortable":false}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","description","type"],"edit":[[{"name":"name","size":6},{"name":"description","size":6}],[{"name":"type","size":6},{"name":"permissions","size":6}],[{"name":"users","size":6}]]},"uid":"plugin::users-permissions.role"}	object	\N	\N
51	plugin_content_manager_configuration_content_types::api::access.access	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"accessToken","defaultSortBy":"accessToken","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"accessToken":{"edit":{"label":"accessToken","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"accessToken","searchable":true,"sortable":true}},"operation":{"edit":{"label":"operation","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"operation","searchable":true,"sortable":true}},"type":{"edit":{"label":"type","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"type","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"active":{"edit":{"label":"active","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"active","searchable":true,"sortable":true}},"expiresOn":{"edit":{"label":"expiresOn","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"expiresOn","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","accessToken","operation","type"],"edit":[[{"name":"accessToken","size":6},{"name":"operation","size":6}],[{"name":"type","size":6},{"name":"name","size":6}],[{"name":"active","size":4},{"name":"expiresOn","size":6}]]},"uid":"api::access.access"}	object	\N	\N
52	plugin_upload_settings	{"sizeOptimization":true,"responsiveDimensions":true,"autoOrientation":false}	object	\N	\N
53	plugin_upload_view_configuration	{"pageSize":10,"sort":"createdAt:DESC"}	object	\N	\N
55	plugin_content_manager_configuration_content_types::api::organization.organization	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"mapLongitude":{"edit":{"label":"mapLongitude","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"mapLongitude","searchable":true,"sortable":true}},"mapLatitude":{"edit":{"label":"mapLatitude","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"mapLatitude","searchable":true,"sortable":true}},"mapZoomLevel":{"edit":{"label":"mapZoomLevel","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"mapZoomLevel","searchable":true,"sortable":true}},"defaultLocale":{"edit":{"label":"defaultLocale","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"defaultLocale","searchable":true,"sortable":true}},"url":{"edit":{"label":"url","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"url","searchable":true,"sortable":true}},"logo":{"edit":{"label":"logo","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"logo","searchable":false,"sortable":false}},"operations":{"edit":{"label":"operations","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"operations","searchable":false,"sortable":false}},"users":{"edit":{"label":"users","description":"","placeholder":"","visible":true,"editable":true,"mainField":"username"},"list":{"label":"users","searchable":false,"sortable":false}},"wms_sources":{"edit":{"label":"wms_sources","description":"","placeholder":"","visible":true,"editable":true,"mainField":"label"},"list":{"label":"wms_sources","searchable":false,"sortable":false}},"map_layer_favorites":{"edit":{"label":"map_layer_favorites","description":"","placeholder":"","visible":true,"editable":true,"mainField":"label"},"list":{"label":"map_layer_favorites","searchable":false,"sortable":false}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","mapLongitude","mapLatitude"],"edit":[[{"name":"name","size":6},{"name":"mapLongitude","size":4}],[{"name":"mapLatitude","size":4},{"name":"mapZoomLevel","size":4}],[{"name":"defaultLocale","size":6},{"name":"url","size":6}],[{"name":"logo","size":6},{"name":"operations","size":6}],[{"name":"users","size":6},{"name":"wms_sources","size":6}],[{"name":"map_layer_favorites","size":6}]]},"uid":"api::organization.organization"}	object	\N	\N
56	plugin_i18n_default_locale	"en"	string	\N	\N
58	plugin_users-permissions_email	{"reset_password":{"display":"Email.template.reset_password","icon":"sync","options":{"from":{"name":"Administration Panel","email":"no-reply@strapi.io"},"response_email":"","object":"Reset password","message":"<p>We heard that you lost your password. Sorry about that!</p>\\n\\n<p>But don’t worry! You can use the following link to reset your password:</p>\\n<p><%= URL %>?code=<%= TOKEN %></p>\\n\\n<p>Thanks.</p>"}},"email_confirmation":{"display":"Email.template.email_confirmation","icon":"check-square","options":{"from":{"name":"Administration Panel","email":"no-reply@strapi.io"},"response_email":"","object":"Account confirmation","message":"<p>Thank you for registering!</p>\\n\\n<p>You have to confirm your email address. Please click on the link below.</p>\\n\\n<p><%= URL %>?confirmation=<%= CODE %></p>\\n\\n<p>Thanks.</p>"}}}	object	\N	\N
59	plugin_users-permissions_advanced	{"unique_email":true,"allow_register":true,"email_confirmation":false,"email_reset_password":null,"email_confirmation_redirection":"","default_role":"organization"}	object	\N	\N
54	plugin_upload_metrics	{"weeklySchedule":"55 56 20 * * 2","lastWeeklyUpdate":1737489415027}	object	\N	\N
49	core_admin_auth	{"providers":{"autoRegister":false,"defaultRole":null,"ssoLockedRoles":null}}	object	\N	\N
57	plugin_users-permissions_grant	{"email":{"icon":"envelope","enabled":true},"discord":{"icon":"discord","enabled":false,"key":"","secret":"","callbackUrl":"api/auth/discord/callback","scope":["identify","email"],"callback":"api/auth/discord/callback"},"facebook":{"icon":"facebook-square","enabled":false,"key":"","secret":"","callbackUrl":"api/auth/facebook/callback","scope":["email"],"callback":"api/auth/facebook/callback"},"google":{"icon":"google","enabled":false,"key":"","secret":"","callbackUrl":"api/auth/google/callback","scope":["email"],"callback":"api/auth/google/callback"},"github":{"icon":"github","enabled":false,"key":"","secret":"","callbackUrl":"api/auth/github/callback","scope":["user","user:email"],"callback":"api/auth/github/callback"},"microsoft":{"icon":"windows","enabled":false,"key":"","secret":"","callbackUrl":"api/auth/microsoft/callback","scope":["user.read"],"callback":"api/auth/microsoft/callback"},"twitter":{"icon":"twitter","enabled":false,"key":"","secret":"","callbackUrl":"api/auth/twitter/callback","callback":"api/auth/twitter/callback"},"instagram":{"icon":"instagram","enabled":false,"key":"","secret":"","callbackUrl":"api/auth/instagram/callback","scope":["user_profile"],"callback":"api/auth/instagram/callback"},"vk":{"icon":"vk","enabled":false,"key":"","secret":"","callbackUrl":"api/auth/vk/callback","scope":["email"],"callback":"api/auth/vk/callback"},"twitch":{"icon":"twitch","enabled":false,"key":"","secret":"","callbackUrl":"api/auth/twitch/callback","scope":["user:read:email"],"callback":"api/auth/twitch/callback"},"linkedin":{"icon":"linkedin","enabled":false,"key":"","secret":"","callbackUrl":"api/auth/linkedin/callback","scope":["r_liteprofile","r_emailaddress"],"callback":"api/auth/linkedin/callback"},"cognito":{"icon":"aws","enabled":false,"key":"","secret":"","subdomain":"my.subdomain.com","callback":"api/auth/cognito/callback","scope":["email","openid","profile"]},"reddit":{"icon":"reddit","enabled":false,"key":"","secret":"","callback":"api/auth/reddit/callback","scope":["identity"],"state":true},"auth0":{"icon":"","enabled":false,"key":"","secret":"","subdomain":"my-tenant.eu","callback":"api/auth/auth0/callback","scope":["openid","email","profile"]},"cas":{"icon":"book","enabled":false,"key":"","secret":"","callback":"api/auth/cas/callback","scope":["openid email"],"subdomain":"my.subdomain.com/cas"},"patreon":{"icon":"","enabled":false,"key":"","secret":"","callback":"api/auth/patreon/callback","scope":["identity","identity[email]"]},"keycloak":{"icon":"","enabled":false,"key":"","secret":"","subdomain":"myKeycloakProvider.com/realms/myrealm","callback":"api/auth/keycloak/callback","scope":["openid","email","profile"]}}	object	\N	\N
64	plugin_content_manager_configuration_content_types::plugin::review-workflows.workflow-stage	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"color":{"edit":{"label":"color","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"color","searchable":true,"sortable":true}},"workflow":{"edit":{"label":"workflow","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"workflow","searchable":true,"sortable":true}},"permissions":{"edit":{"label":"permissions","description":"","placeholder":"","visible":true,"editable":true,"mainField":"action"},"list":{"label":"permissions","searchable":false,"sortable":false}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","color","workflow"],"edit":[[{"name":"name","size":6},{"name":"color","size":6}],[{"name":"workflow","size":6},{"name":"permissions","size":6}]]},"uid":"plugin::review-workflows.workflow-stage"}	object	\N	\N
60	plugin_content_manager_configuration_content_types::plugin::content-releases.release-action	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"contentType","defaultSortBy":"contentType","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"type":{"edit":{"label":"type","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"type","searchable":true,"sortable":true}},"contentType":{"edit":{"label":"contentType","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"contentType","searchable":true,"sortable":true}},"entryDocumentId":{"edit":{"label":"entryDocumentId","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"entryDocumentId","searchable":true,"sortable":true}},"release":{"edit":{"label":"release","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"release","searchable":true,"sortable":true}},"isEntryValid":{"edit":{"label":"isEntryValid","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"isEntryValid","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","type","contentType","entryDocumentId"],"edit":[[{"name":"type","size":6},{"name":"contentType","size":6}],[{"name":"release","size":6}],[{"name":"isEntryValid","size":4},{"name":"entryDocumentId","size":6}]]},"uid":"plugin::content-releases.release-action"}	object	\N	\N
43	plugin_content_manager_configuration_content_types::api::operation.operation	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"name","defaultSortBy":"name","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"name":{"edit":{"label":"name","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"name","searchable":true,"sortable":true}},"description":{"edit":{"label":"description","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"description","searchable":false,"sortable":false}},"status":{"edit":{"label":"status","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"status","searchable":true,"sortable":true}},"organization":{"edit":{"label":"organization","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"organization","searchable":true,"sortable":true}},"mapState":{"edit":{"label":"mapState","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"mapState","searchable":false,"sortable":false}},"mapSnapshots":{"edit":{"label":"mapSnapshots","description":"","placeholder":"","visible":true,"editable":true,"mainField":"id"},"list":{"label":"mapSnapshots","searchable":false,"sortable":false}},"eventStates":{"edit":{"label":"eventStates","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"eventStates","searchable":false,"sortable":false}},"mapLayers":{"edit":{"label":"mapLayers","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"mapLayers","searchable":false,"sortable":false}},"phase":{"edit":{"label":"phase","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"phase","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","name","status","organization"],"edit":[[{"name":"name","size":6}],[{"name":"description","size":12}],[{"name":"status","size":6},{"name":"organization","size":6}],[{"name":"mapState","size":12}],[{"name":"mapSnapshots","size":6}],[{"name":"eventStates","size":12}],[{"name":"mapLayers","size":12}],[{"name":"phase","size":6}]]},"uid":"api::operation.operation"}	object	\N	\N
61	plugin_content_manager_configuration_content_types::api::journal-entry.journal-entry	{"settings":{"bulkable":true,"filterable":true,"searchable":true,"pageSize":10,"mainField":"sender","defaultSortBy":"sender","defaultSortOrder":"ASC"},"metadatas":{"id":{"edit":{},"list":{"label":"id","searchable":true,"sortable":true}},"sender":{"edit":{"label":"sender","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"sender","searchable":true,"sortable":true}},"creator":{"edit":{"label":"creator","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"creator","searchable":true,"sortable":true}},"message_number":{"edit":{"label":"message_number","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"message_number","searchable":true,"sortable":true}},"communication_type":{"edit":{"label":"communication_type","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"communication_type","searchable":true,"sortable":true}},"communication_details":{"edit":{"label":"communication_details","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"communication_details","searchable":true,"sortable":true}},"message_subject":{"edit":{"label":"message_subject","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"message_subject","searchable":true,"sortable":true}},"message_content":{"edit":{"label":"message_content","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"message_content","searchable":true,"sortable":true}},"visum_message":{"edit":{"label":"visum_message","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"visum_message","searchable":true,"sortable":true}},"is_key_message":{"edit":{"label":"is_key_message","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"is_key_message","searchable":true,"sortable":true}},"department":{"edit":{"label":"department","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"department","searchable":true,"sortable":true}},"date_message":{"edit":{"label":"date_message","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"date_message","searchable":true,"sortable":true}},"visum_triage":{"edit":{"label":"visum_triage","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"visum_triage","searchable":true,"sortable":true}},"date_triage":{"edit":{"label":"date_triage","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"date_triage","searchable":true,"sortable":true}},"decision":{"edit":{"label":"decision","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"decision","searchable":true,"sortable":true}},"date_decision":{"edit":{"label":"date_decision","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"date_decision","searchable":true,"sortable":true}},"operation":{"edit":{"label":"operation","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"operation","searchable":true,"sortable":true}},"organization":{"edit":{"label":"organization","description":"","placeholder":"","visible":true,"editable":true,"mainField":"name"},"list":{"label":"organization","searchable":true,"sortable":true}},"date_decision_delivered":{"edit":{"label":"date_decision_delivered","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"date_decision_delivered","searchable":true,"sortable":true}},"visum_decider":{"edit":{"label":"visum_decider","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"visum_decider","searchable":true,"sortable":true}},"decision_receiver":{"edit":{"label":"decision_receiver","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"decision_receiver","searchable":true,"sortable":true}},"entry_status":{"edit":{"label":"entry_status","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"entry_status","searchable":true,"sortable":true}},"decision_sender":{"edit":{"label":"decision_sender","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"decision_sender","searchable":true,"sortable":true}},"is_drawn_on_map":{"edit":{"label":"is_drawn_on_map","description":"","placeholder":"","visible":true,"editable":true},"list":{"label":"is_drawn_on_map","searchable":true,"sortable":true}},"createdAt":{"edit":{"label":"createdAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"createdAt","searchable":true,"sortable":true}},"updatedAt":{"edit":{"label":"updatedAt","description":"","placeholder":"","visible":false,"editable":true},"list":{"label":"updatedAt","searchable":true,"sortable":true}},"createdBy":{"edit":{"label":"createdBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"createdBy","searchable":true,"sortable":true}},"updatedBy":{"edit":{"label":"updatedBy","description":"","placeholder":"","visible":false,"editable":true,"mainField":"firstname"},"list":{"label":"updatedBy","searchable":true,"sortable":true}}},"layouts":{"list":["id","sender","creator","date_message"],"edit":[[{"name":"sender","size":6},{"name":"creator","size":6}],[{"name":"message_number","size":4}],[{"name":"communication_type","size":6},{"name":"communication_details","size":6}],[{"name":"message_subject","size":6},{"name":"message_content","size":6}],[{"name":"visum_message","size":6},{"name":"is_key_message","size":4}],[{"name":"department","size":6}],[{"name":"visum_triage","size":6}],[{"name":"decision","size":6}],[{"name":"operation","size":6},{"name":"organization","size":6}],[{"name":"date_message","size":6},{"name":"date_triage","size":6}],[{"name":"date_decision","size":6},{"name":"date_decision_delivered","size":6}],[{"name":"visum_decider","size":6},{"name":"decision_receiver","size":6}],[{"name":"entry_status","size":6},{"name":"decision_sender","size":6}],[{"name":"is_drawn_on_map","size":4}]]},"uid":"api::journal-entry.journal-entry"}	object	\N	\N
\.


--
-- TOC entry 4261 (class 0 OID 40992)
-- Dependencies: 271
-- Data for Name: strapi_database_schema; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_database_schema (id, schema, "time", hash) FROM stdin;
9	{"tables":[{"name":"files","indexes":[{"name":"upload_files_folder_path_index","columns":["folder_path"],"type":null},{"name":"upload_files_created_at_index","columns":["created_at"],"type":null},{"name":"upload_files_updated_at_index","columns":["updated_at"],"type":null},{"name":"upload_files_name_index","columns":["name"],"type":null},{"name":"upload_files_size_index","columns":["size"],"type":null},{"name":"upload_files_ext_index","columns":["ext"],"type":null},{"name":"files_documents_idx","columns":["document_id","locale","published_at"]},{"name":"files_created_by_id_fk","columns":["created_by_id"]},{"name":"files_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"files_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"files_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"alternative_text","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"caption","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"width","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"height","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"formats","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"hash","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"ext","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"mime","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"size","type":"decimal","args":[10,2],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"url","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"preview_url","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"provider","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"provider_metadata","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"folder_path","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"upload_folders","indexes":[{"name":"upload_folders_path_id_index","columns":["path_id"],"type":"unique"},{"name":"upload_folders_path_index","columns":["path"],"type":"unique"},{"name":"upload_folders_documents_idx","columns":["document_id","locale","published_at"]},{"name":"upload_folders_created_by_id_fk","columns":["created_by_id"]},{"name":"upload_folders_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"upload_folders_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"upload_folders_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"path_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"path","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"i18n_locale","indexes":[{"name":"i18n_locale_documents_idx","columns":["document_id","locale","published_at"]},{"name":"i18n_locale_created_by_id_fk","columns":["created_by_id"]},{"name":"i18n_locale_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"i18n_locale_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"i18n_locale_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"code","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"strapi_releases","indexes":[{"name":"strapi_releases_documents_idx","columns":["document_id","locale","published_at"]},{"name":"strapi_releases_created_by_id_fk","columns":["created_by_id"]},{"name":"strapi_releases_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"strapi_releases_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"strapi_releases_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"released_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"scheduled_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"timezone","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"status","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"strapi_release_actions","indexes":[{"name":"strapi_release_actions_documents_idx","columns":["document_id","locale","published_at"]},{"name":"strapi_release_actions_created_by_id_fk","columns":["created_by_id"]},{"name":"strapi_release_actions_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"strapi_release_actions_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"strapi_release_actions_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"type","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"content_type","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"entry_document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"is_entry_valid","type":"boolean","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"strapi_workflows","indexes":[{"name":"strapi_workflows_documents_idx","columns":["document_id","locale","published_at"]},{"name":"strapi_workflows_created_by_id_fk","columns":["created_by_id"]},{"name":"strapi_workflows_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"strapi_workflows_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"strapi_workflows_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"content_types","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"strapi_workflows_stages","indexes":[{"name":"strapi_workflows_stages_documents_idx","columns":["document_id","locale","published_at"]},{"name":"strapi_workflows_stages_created_by_id_fk","columns":["created_by_id"]},{"name":"strapi_workflows_stages_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"strapi_workflows_stages_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"strapi_workflows_stages_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"color","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"up_permissions","indexes":[{"name":"up_permissions_documents_idx","columns":["document_id","locale","published_at"]},{"name":"up_permissions_created_by_id_fk","columns":["created_by_id"]},{"name":"up_permissions_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"up_permissions_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"up_permissions_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"action","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"up_roles","indexes":[{"name":"up_roles_documents_idx","columns":["document_id","locale","published_at"]},{"name":"up_roles_created_by_id_fk","columns":["created_by_id"]},{"name":"up_roles_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"up_roles_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"up_roles_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"description","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"type","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"up_users","indexes":[{"name":"up_users_documents_idx","columns":["document_id","locale","published_at"]},{"name":"up_users_created_by_id_fk","columns":["created_by_id"]},{"name":"up_users_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"up_users_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"up_users_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"username","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"email","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"provider","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"password","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"reset_password_token","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"confirmation_token","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"confirmed","type":"boolean","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"blocked","type":"boolean","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"accesses","indexes":[{"name":"accesses_documents_idx","columns":["document_id","locale","published_at"]},{"name":"accesses_created_by_id_fk","columns":["created_by_id"]},{"name":"accesses_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"accesses_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"accesses_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"access_token","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"type","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"active","type":"boolean","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"expires_on","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"journal_entries","indexes":[{"name":"journal_entries_documents_idx","columns":["document_id","locale","published_at"]},{"name":"journal_entries_created_by_id_fk","columns":["created_by_id"]},{"name":"journal_entries_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"journal_entries_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"journal_entries_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"sender","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"creator","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"message_number","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"communication_type","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"communication_details","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"message_subject","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"message_content","type":"text","args":["longtext"],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"visum_message","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"is_key_message","type":"boolean","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"department","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"date_message","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"visum_triage","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"date_triage","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"decision","type":"text","args":["longtext"],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"date_decision","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"date_decision_delivered","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"visum_decider","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"decision_receiver","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"entry_status","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"decision_sender","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"is_drawn_on_map","type":"boolean","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"map_layers","indexes":[{"name":"map_layers_documents_idx","columns":["document_id","locale","published_at"]},{"name":"map_layers_created_by_id_fk","columns":["created_by_id"]},{"name":"map_layers_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"map_layers_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"map_layers_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"label","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"server_layer_name","type":"text","args":["longtext"],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"type","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"custom_source","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"options","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"public","type":"boolean","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"map_snapshots","indexes":[{"name":"map_snapshots_documents_idx","columns":["document_id","locale","published_at"]},{"name":"map_snapshots_created_by_id_fk","columns":["created_by_id"]},{"name":"map_snapshots_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"map_snapshots_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"map_snapshots_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"map_state","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"operations","indexes":[{"name":"operations_documents_idx","columns":["document_id","locale","published_at"]},{"name":"operations_created_by_id_fk","columns":["created_by_id"]},{"name":"operations_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"operations_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"operations_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"description","type":"text","args":["longtext"],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"status","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"map_state","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"event_states","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"map_layers","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"phase","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"organizations","indexes":[{"name":"organizations_documents_idx","columns":["document_id","locale","published_at"]},{"name":"organizations_created_by_id_fk","columns":["created_by_id"]},{"name":"organizations_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"organizations_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"organizations_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"map_longitude","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"map_latitude","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"map_zoom_level","type":"decimal","args":[10,2],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"default_locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"url","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"wms_sources","indexes":[{"name":"wms_sources_documents_idx","columns":["document_id","locale","published_at"]},{"name":"wms_sources_created_by_id_fk","columns":["created_by_id"]},{"name":"wms_sources_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"wms_sources_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"wms_sources_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"label","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"type","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"url","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"attribution","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"public","type":"boolean","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"admin_permissions","indexes":[{"name":"admin_permissions_documents_idx","columns":["document_id","locale","published_at"]},{"name":"admin_permissions_created_by_id_fk","columns":["created_by_id"]},{"name":"admin_permissions_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"admin_permissions_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"admin_permissions_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"action","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"action_parameters","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"subject","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"properties","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"conditions","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"admin_users","indexes":[{"name":"admin_users_documents_idx","columns":["document_id","locale","published_at"]},{"name":"admin_users_created_by_id_fk","columns":["created_by_id"]},{"name":"admin_users_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"admin_users_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"admin_users_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"firstname","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"lastname","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"username","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"email","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"password","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"reset_password_token","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"registration_token","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"is_active","type":"boolean","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"blocked","type":"boolean","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"prefered_language","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"admin_roles","indexes":[{"name":"admin_roles_documents_idx","columns":["document_id","locale","published_at"]},{"name":"admin_roles_created_by_id_fk","columns":["created_by_id"]},{"name":"admin_roles_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"admin_roles_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"admin_roles_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"code","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"description","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"strapi_api_tokens","indexes":[{"name":"strapi_api_tokens_documents_idx","columns":["document_id","locale","published_at"]},{"name":"strapi_api_tokens_created_by_id_fk","columns":["created_by_id"]},{"name":"strapi_api_tokens_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"strapi_api_tokens_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"strapi_api_tokens_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"description","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"type","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"access_key","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"last_used_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"expires_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"lifespan","type":"bigInteger","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"strapi_api_token_permissions","indexes":[{"name":"strapi_api_token_permissions_documents_idx","columns":["document_id","locale","published_at"]},{"name":"strapi_api_token_permissions_created_by_id_fk","columns":["created_by_id"]},{"name":"strapi_api_token_permissions_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"strapi_api_token_permissions_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"strapi_api_token_permissions_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"action","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"strapi_transfer_tokens","indexes":[{"name":"strapi_transfer_tokens_documents_idx","columns":["document_id","locale","published_at"]},{"name":"strapi_transfer_tokens_created_by_id_fk","columns":["created_by_id"]},{"name":"strapi_transfer_tokens_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"strapi_transfer_tokens_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"strapi_transfer_tokens_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"description","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"access_key","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"last_used_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"expires_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"lifespan","type":"bigInteger","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"strapi_transfer_token_permissions","indexes":[{"name":"strapi_transfer_token_permissions_documents_idx","columns":["document_id","locale","published_at"]},{"name":"strapi_transfer_token_permissions_created_by_id_fk","columns":["created_by_id"]},{"name":"strapi_transfer_token_permissions_updated_by_id_fk","columns":["updated_by_id"]}],"foreignKeys":[{"name":"strapi_transfer_token_permissions_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"},{"name":"strapi_transfer_token_permissions_updated_by_id_fk","columns":["updated_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"action","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"updated_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"published_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"updated_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"strapi_core_store_settings","indexes":[],"foreignKeys":[],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"key","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"value","type":"text","args":["longtext"],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"type","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"environment","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"tag","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"strapi_webhooks","indexes":[],"foreignKeys":[],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"name","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"url","type":"text","args":["longtext"],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"headers","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"events","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"enabled","type":"boolean","args":[],"defaultTo":null,"notNullable":false,"unsigned":false}]},{"name":"strapi_history_versions","indexes":[{"name":"strapi_history_versions_created_by_id_fk","columns":["created_by_id"]}],"foreignKeys":[{"name":"strapi_history_versions_created_by_id_fk","columns":["created_by_id"],"referencedTable":"admin_users","referencedColumns":["id"],"onDelete":"SET NULL"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"content_type","type":"string","args":[],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"related_document_id","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"locale","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"status","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"data","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"schema","type":"jsonb","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_at","type":"datetime","args":[{"useTz":false,"precision":6}],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"created_by_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"files_related_mph","indexes":[{"name":"files_related_mph_fk","columns":["file_id"]},{"name":"files_related_mph_oidx","columns":["order"]},{"name":"files_related_mph_idix","columns":["related_id"]}],"foreignKeys":[{"name":"files_related_mph_fk","columns":["file_id"],"referencedColumns":["id"],"referencedTable":"files","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"file_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"related_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"related_type","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"field","type":"string","args":[],"defaultTo":null,"notNullable":false,"unsigned":false},{"name":"order","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"files_folder_lnk","indexes":[{"name":"files_folder_lnk_fk","columns":["file_id"]},{"name":"files_folder_lnk_ifk","columns":["folder_id"]},{"name":"files_folder_lnk_uq","columns":["file_id","folder_id"],"type":"unique"},{"name":"files_folder_lnk_oifk","columns":["file_ord"]}],"foreignKeys":[{"name":"files_folder_lnk_fk","columns":["file_id"],"referencedColumns":["id"],"referencedTable":"files","onDelete":"CASCADE"},{"name":"files_folder_lnk_ifk","columns":["folder_id"],"referencedColumns":["id"],"referencedTable":"upload_folders","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"file_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"folder_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"file_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"upload_folders_parent_lnk","indexes":[{"name":"upload_folders_parent_lnk_fk","columns":["folder_id"]},{"name":"upload_folders_parent_lnk_ifk","columns":["inv_folder_id"]},{"name":"upload_folders_parent_lnk_uq","columns":["folder_id","inv_folder_id"],"type":"unique"},{"name":"upload_folders_parent_lnk_oifk","columns":["folder_ord"]}],"foreignKeys":[{"name":"upload_folders_parent_lnk_fk","columns":["folder_id"],"referencedColumns":["id"],"referencedTable":"upload_folders","onDelete":"CASCADE"},{"name":"upload_folders_parent_lnk_ifk","columns":["inv_folder_id"],"referencedColumns":["id"],"referencedTable":"upload_folders","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"folder_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"inv_folder_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"folder_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"strapi_release_actions_release_lnk","indexes":[{"name":"strapi_release_actions_release_lnk_fk","columns":["release_action_id"]},{"name":"strapi_release_actions_release_lnk_ifk","columns":["release_id"]},{"name":"strapi_release_actions_release_lnk_uq","columns":["release_action_id","release_id"],"type":"unique"},{"name":"strapi_release_actions_release_lnk_oifk","columns":["release_action_ord"]}],"foreignKeys":[{"name":"strapi_release_actions_release_lnk_fk","columns":["release_action_id"],"referencedColumns":["id"],"referencedTable":"strapi_release_actions","onDelete":"CASCADE"},{"name":"strapi_release_actions_release_lnk_ifk","columns":["release_id"],"referencedColumns":["id"],"referencedTable":"strapi_releases","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"release_action_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"release_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"release_action_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"strapi_workflows_stage_required_to_publish_lnk","indexes":[{"name":"strapi_workflows_stage_required_to_publish_lnk_fk","columns":["workflow_id"]},{"name":"strapi_workflows_stage_required_to_publish_lnk_ifk","columns":["workflow_stage_id"]},{"name":"strapi_workflows_stage_required_to_publish_lnk_uq","columns":["workflow_id","workflow_stage_id"],"type":"unique"}],"foreignKeys":[{"name":"strapi_workflows_stage_required_to_publish_lnk_fk","columns":["workflow_id"],"referencedColumns":["id"],"referencedTable":"strapi_workflows","onDelete":"CASCADE"},{"name":"strapi_workflows_stage_required_to_publish_lnk_ifk","columns":["workflow_stage_id"],"referencedColumns":["id"],"referencedTable":"strapi_workflows_stages","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"workflow_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"workflow_stage_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"strapi_workflows_stages_workflow_lnk","indexes":[{"name":"strapi_workflows_stages_workflow_lnk_fk","columns":["workflow_stage_id"]},{"name":"strapi_workflows_stages_workflow_lnk_ifk","columns":["workflow_id"]},{"name":"strapi_workflows_stages_workflow_lnk_uq","columns":["workflow_stage_id","workflow_id"],"type":"unique"},{"name":"strapi_workflows_stages_workflow_lnk_oifk","columns":["workflow_stage_ord"]}],"foreignKeys":[{"name":"strapi_workflows_stages_workflow_lnk_fk","columns":["workflow_stage_id"],"referencedColumns":["id"],"referencedTable":"strapi_workflows_stages","onDelete":"CASCADE"},{"name":"strapi_workflows_stages_workflow_lnk_ifk","columns":["workflow_id"],"referencedColumns":["id"],"referencedTable":"strapi_workflows","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"workflow_stage_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"workflow_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"workflow_stage_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"strapi_workflows_stages_permissions_lnk","indexes":[{"name":"strapi_workflows_stages_permissions_lnk_fk","columns":["workflow_stage_id"]},{"name":"strapi_workflows_stages_permissions_lnk_ifk","columns":["permission_id"]},{"name":"strapi_workflows_stages_permissions_lnk_uq","columns":["workflow_stage_id","permission_id"],"type":"unique"},{"name":"strapi_workflows_stages_permissions_lnk_ofk","columns":["permission_ord"]}],"foreignKeys":[{"name":"strapi_workflows_stages_permissions_lnk_fk","columns":["workflow_stage_id"],"referencedColumns":["id"],"referencedTable":"strapi_workflows_stages","onDelete":"CASCADE"},{"name":"strapi_workflows_stages_permissions_lnk_ifk","columns":["permission_id"],"referencedColumns":["id"],"referencedTable":"admin_permissions","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"workflow_stage_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"permission_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"permission_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"up_permissions_role_lnk","indexes":[{"name":"up_permissions_role_lnk_fk","columns":["permission_id"]},{"name":"up_permissions_role_lnk_ifk","columns":["role_id"]},{"name":"up_permissions_role_lnk_uq","columns":["permission_id","role_id"],"type":"unique"},{"name":"up_permissions_role_lnk_oifk","columns":["permission_ord"]}],"foreignKeys":[{"name":"up_permissions_role_lnk_fk","columns":["permission_id"],"referencedColumns":["id"],"referencedTable":"up_permissions","onDelete":"CASCADE"},{"name":"up_permissions_role_lnk_ifk","columns":["role_id"],"referencedColumns":["id"],"referencedTable":"up_roles","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"permission_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"role_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"permission_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"up_users_role_lnk","indexes":[{"name":"up_users_role_lnk_fk","columns":["user_id"]},{"name":"up_users_role_lnk_ifk","columns":["role_id"]},{"name":"up_users_role_lnk_uq","columns":["user_id","role_id"],"type":"unique"},{"name":"up_users_role_lnk_oifk","columns":["user_ord"]}],"foreignKeys":[{"name":"up_users_role_lnk_fk","columns":["user_id"],"referencedColumns":["id"],"referencedTable":"up_users","onDelete":"CASCADE"},{"name":"up_users_role_lnk_ifk","columns":["role_id"],"referencedColumns":["id"],"referencedTable":"up_roles","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"user_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"role_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"user_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"up_users_organization_lnk","indexes":[{"name":"up_users_organization_lnk_fk","columns":["user_id"]},{"name":"up_users_organization_lnk_ifk","columns":["organization_id"]},{"name":"up_users_organization_lnk_uq","columns":["user_id","organization_id"],"type":"unique"},{"name":"up_users_organization_lnk_oifk","columns":["user_ord"]}],"foreignKeys":[{"name":"up_users_organization_lnk_fk","columns":["user_id"],"referencedColumns":["id"],"referencedTable":"up_users","onDelete":"CASCADE"},{"name":"up_users_organization_lnk_ifk","columns":["organization_id"],"referencedColumns":["id"],"referencedTable":"organizations","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"user_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"organization_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"user_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"accesses_operation_lnk","indexes":[{"name":"accesses_operation_lnk_fk","columns":["access_id"]},{"name":"accesses_operation_lnk_ifk","columns":["operation_id"]},{"name":"accesses_operation_lnk_uq","columns":["access_id","operation_id"],"type":"unique"}],"foreignKeys":[{"name":"accesses_operation_lnk_fk","columns":["access_id"],"referencedColumns":["id"],"referencedTable":"accesses","onDelete":"CASCADE"},{"name":"accesses_operation_lnk_ifk","columns":["operation_id"],"referencedColumns":["id"],"referencedTable":"operations","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"access_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"operation_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"journal_entries_operation_lnk","indexes":[{"name":"journal_entries_operation_lnk_fk","columns":["journal_entry_id"]},{"name":"journal_entries_operation_lnk_ifk","columns":["operation_id"]},{"name":"journal_entries_operation_lnk_uq","columns":["journal_entry_id","operation_id"],"type":"unique"}],"foreignKeys":[{"name":"journal_entries_operation_lnk_fk","columns":["journal_entry_id"],"referencedColumns":["id"],"referencedTable":"journal_entries","onDelete":"CASCADE"},{"name":"journal_entries_operation_lnk_ifk","columns":["operation_id"],"referencedColumns":["id"],"referencedTable":"operations","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"journal_entry_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"operation_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"journal_entries_organization_lnk","indexes":[{"name":"journal_entries_organization_lnk_fk","columns":["journal_entry_id"]},{"name":"journal_entries_organization_lnk_ifk","columns":["organization_id"]},{"name":"journal_entries_organization_lnk_uq","columns":["journal_entry_id","organization_id"],"type":"unique"}],"foreignKeys":[{"name":"journal_entries_organization_lnk_fk","columns":["journal_entry_id"],"referencedColumns":["id"],"referencedTable":"journal_entries","onDelete":"CASCADE"},{"name":"journal_entries_organization_lnk_ifk","columns":["organization_id"],"referencedColumns":["id"],"referencedTable":"organizations","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"journal_entry_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"organization_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"map_layers_wms_source_lnk","indexes":[{"name":"map_layers_wms_source_lnk_fk","columns":["map_layer_id"]},{"name":"map_layers_wms_source_lnk_ifk","columns":["wms_source_id"]},{"name":"map_layers_wms_source_lnk_uq","columns":["map_layer_id","wms_source_id"],"type":"unique"},{"name":"map_layers_wms_source_lnk_oifk","columns":["map_layer_ord"]}],"foreignKeys":[{"name":"map_layers_wms_source_lnk_fk","columns":["map_layer_id"],"referencedColumns":["id"],"referencedTable":"map_layers","onDelete":"CASCADE"},{"name":"map_layers_wms_source_lnk_ifk","columns":["wms_source_id"],"referencedColumns":["id"],"referencedTable":"wms_sources","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"map_layer_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"wms_source_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"map_layer_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"map_layers_organization_lnk","indexes":[{"name":"map_layers_organization_lnk_fk","columns":["map_layer_id"]},{"name":"map_layers_organization_lnk_ifk","columns":["organization_id"]},{"name":"map_layers_organization_lnk_uq","columns":["map_layer_id","organization_id"],"type":"unique"}],"foreignKeys":[{"name":"map_layers_organization_lnk_fk","columns":["map_layer_id"],"referencedColumns":["id"],"referencedTable":"map_layers","onDelete":"CASCADE"},{"name":"map_layers_organization_lnk_ifk","columns":["organization_id"],"referencedColumns":["id"],"referencedTable":"organizations","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"map_layer_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"organization_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"map_snapshots_operation_lnk","indexes":[{"name":"map_snapshots_operation_lnk_fk","columns":["map_snapshot_id"]},{"name":"map_snapshots_operation_lnk_ifk","columns":["operation_id"]},{"name":"map_snapshots_operation_lnk_uq","columns":["map_snapshot_id","operation_id"],"type":"unique"},{"name":"map_snapshots_operation_lnk_oifk","columns":["map_snapshot_ord"]}],"foreignKeys":[{"name":"map_snapshots_operation_lnk_fk","columns":["map_snapshot_id"],"referencedColumns":["id"],"referencedTable":"map_snapshots","onDelete":"CASCADE"},{"name":"map_snapshots_operation_lnk_ifk","columns":["operation_id"],"referencedColumns":["id"],"referencedTable":"operations","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"map_snapshot_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"operation_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"map_snapshot_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"operations_organization_lnk","indexes":[{"name":"operations_organization_lnk_fk","columns":["operation_id"]},{"name":"operations_organization_lnk_ifk","columns":["organization_id"]},{"name":"operations_organization_lnk_uq","columns":["operation_id","organization_id"],"type":"unique"},{"name":"operations_organization_lnk_oifk","columns":["operation_ord"]}],"foreignKeys":[{"name":"operations_organization_lnk_fk","columns":["operation_id"],"referencedColumns":["id"],"referencedTable":"operations","onDelete":"CASCADE"},{"name":"operations_organization_lnk_ifk","columns":["organization_id"],"referencedColumns":["id"],"referencedTable":"organizations","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"operation_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"organization_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"operation_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"organizations_wms_sources_lnk","indexes":[{"name":"organizations_wms_sources_lnk_fk","columns":["organization_id"]},{"name":"organizations_wms_sources_lnk_ifk","columns":["wms_source_id"]},{"name":"organizations_wms_sources_lnk_uq","columns":["organization_id","wms_source_id"],"type":"unique"},{"name":"organizations_wms_sources_lnk_ofk","columns":["wms_source_ord"]}],"foreignKeys":[{"name":"organizations_wms_sources_lnk_fk","columns":["organization_id"],"referencedColumns":["id"],"referencedTable":"organizations","onDelete":"CASCADE"},{"name":"organizations_wms_sources_lnk_ifk","columns":["wms_source_id"],"referencedColumns":["id"],"referencedTable":"wms_sources","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"organization_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"wms_source_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"wms_source_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"organizations_map_layer_favorites_lnk","indexes":[{"name":"organizations_map_layer_favorites_lnk_fk","columns":["organization_id"]},{"name":"organizations_map_layer_favorites_lnk_ifk","columns":["map_layer_id"]},{"name":"organizations_map_layer_favorites_lnk_uq","columns":["organization_id","map_layer_id"],"type":"unique"},{"name":"organizations_map_layer_favorites_lnk_ofk","columns":["map_layer_ord"]}],"foreignKeys":[{"name":"organizations_map_layer_favorites_lnk_fk","columns":["organization_id"],"referencedColumns":["id"],"referencedTable":"organizations","onDelete":"CASCADE"},{"name":"organizations_map_layer_favorites_lnk_ifk","columns":["map_layer_id"],"referencedColumns":["id"],"referencedTable":"map_layers","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"organization_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"map_layer_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"map_layer_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"wms_sources_organization_lnk","indexes":[{"name":"wms_sources_organization_lnk_fk","columns":["wms_source_id"]},{"name":"wms_sources_organization_lnk_ifk","columns":["organization_id"]},{"name":"wms_sources_organization_lnk_uq","columns":["wms_source_id","organization_id"],"type":"unique"}],"foreignKeys":[{"name":"wms_sources_organization_lnk_fk","columns":["wms_source_id"],"referencedColumns":["id"],"referencedTable":"wms_sources","onDelete":"CASCADE"},{"name":"wms_sources_organization_lnk_ifk","columns":["organization_id"],"referencedColumns":["id"],"referencedTable":"organizations","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"wms_source_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"organization_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"admin_permissions_role_lnk","indexes":[{"name":"admin_permissions_role_lnk_fk","columns":["permission_id"]},{"name":"admin_permissions_role_lnk_ifk","columns":["role_id"]},{"name":"admin_permissions_role_lnk_uq","columns":["permission_id","role_id"],"type":"unique"},{"name":"admin_permissions_role_lnk_oifk","columns":["permission_ord"]}],"foreignKeys":[{"name":"admin_permissions_role_lnk_fk","columns":["permission_id"],"referencedColumns":["id"],"referencedTable":"admin_permissions","onDelete":"CASCADE"},{"name":"admin_permissions_role_lnk_ifk","columns":["role_id"],"referencedColumns":["id"],"referencedTable":"admin_roles","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"permission_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"role_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"permission_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"admin_users_roles_lnk","indexes":[{"name":"admin_users_roles_lnk_fk","columns":["user_id"]},{"name":"admin_users_roles_lnk_ifk","columns":["role_id"]},{"name":"admin_users_roles_lnk_uq","columns":["user_id","role_id"],"type":"unique"},{"name":"admin_users_roles_lnk_ofk","columns":["role_ord"]},{"name":"admin_users_roles_lnk_oifk","columns":["user_ord"]}],"foreignKeys":[{"name":"admin_users_roles_lnk_fk","columns":["user_id"],"referencedColumns":["id"],"referencedTable":"admin_users","onDelete":"CASCADE"},{"name":"admin_users_roles_lnk_ifk","columns":["role_id"],"referencedColumns":["id"],"referencedTable":"admin_roles","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"user_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"role_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"role_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"user_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"strapi_api_token_permissions_token_lnk","indexes":[{"name":"strapi_api_token_permissions_token_lnk_fk","columns":["api_token_permission_id"]},{"name":"strapi_api_token_permissions_token_lnk_ifk","columns":["api_token_id"]},{"name":"strapi_api_token_permissions_token_lnk_uq","columns":["api_token_permission_id","api_token_id"],"type":"unique"},{"name":"strapi_api_token_permissions_token_lnk_oifk","columns":["api_token_permission_ord"]}],"foreignKeys":[{"name":"strapi_api_token_permissions_token_lnk_fk","columns":["api_token_permission_id"],"referencedColumns":["id"],"referencedTable":"strapi_api_token_permissions","onDelete":"CASCADE"},{"name":"strapi_api_token_permissions_token_lnk_ifk","columns":["api_token_id"],"referencedColumns":["id"],"referencedTable":"strapi_api_tokens","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"api_token_permission_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"api_token_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"api_token_permission_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]},{"name":"strapi_transfer_token_permissions_token_lnk","indexes":[{"name":"strapi_transfer_token_permissions_token_lnk_fk","columns":["transfer_token_permission_id"]},{"name":"strapi_transfer_token_permissions_token_lnk_ifk","columns":["transfer_token_id"]},{"name":"strapi_transfer_token_permissions_token_lnk_uq","columns":["transfer_token_permission_id","transfer_token_id"],"type":"unique"},{"name":"strapi_transfer_token_permissions_token_lnk_oifk","columns":["transfer_token_permission_ord"]}],"foreignKeys":[{"name":"strapi_transfer_token_permissions_token_lnk_fk","columns":["transfer_token_permission_id"],"referencedColumns":["id"],"referencedTable":"strapi_transfer_token_permissions","onDelete":"CASCADE"},{"name":"strapi_transfer_token_permissions_token_lnk_ifk","columns":["transfer_token_id"],"referencedColumns":["id"],"referencedTable":"strapi_transfer_tokens","onDelete":"CASCADE"}],"columns":[{"name":"id","type":"increments","args":[{"primary":true,"primaryKey":true}],"defaultTo":null,"notNullable":true,"unsigned":false},{"name":"transfer_token_permission_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"transfer_token_id","type":"integer","args":[],"defaultTo":null,"notNullable":false,"unsigned":true},{"name":"transfer_token_permission_ord","type":"double","args":[],"defaultTo":null,"notNullable":false,"unsigned":true}]}]}	2025-01-23 13:49:09.862	57373b220a1a7df79d9368b00f6274e1
\.


--
-- TOC entry 4263 (class 0 OID 40998)
-- Dependencies: 273
-- Data for Name: strapi_history_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_history_versions (id, content_type, related_document_id, locale, status, data, schema, created_at, created_by_id) FROM stdin;
\.


--
-- TOC entry 4265 (class 0 OID 41004)
-- Dependencies: 275
-- Data for Name: strapi_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_migrations (id, name, "time") FROM stdin;
\.


--
-- TOC entry 4267 (class 0 OID 41008)
-- Dependencies: 277
-- Data for Name: strapi_migrations_internal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_migrations_internal (id, name, "time") FROM stdin;
1	5.0.0-rename-identifiers-longer-than-max-length	2025-01-22 13:42:13.311
2	5.0.0-02-created-document-id	2025-01-22 13:42:13.554
3	5.0.0-03-created-locale	2025-01-22 13:42:13.63
4	5.0.0-04-created-published-at	2025-01-22 13:42:13.711
5	5.0.0-05-drop-slug-fields-index	2025-01-22 13:42:13.738
6	core::5.0.0-discard-drafts	2025-01-22 13:42:13.813
\.


--
-- TOC entry 4269 (class 0 OID 41012)
-- Dependencies: 279
-- Data for Name: strapi_release_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_release_actions (id, type, content_type, locale, is_entry_valid, created_at, updated_at, created_by_id, updated_by_id, document_id, published_at, entry_document_id) FROM stdin;
\.


--
-- TOC entry 4271 (class 0 OID 41018)
-- Dependencies: 281
-- Data for Name: strapi_release_actions_release_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_release_actions_release_lnk (id, release_action_id, release_id, release_action_ord) FROM stdin;
\.


--
-- TOC entry 4273 (class 0 OID 41022)
-- Dependencies: 283
-- Data for Name: strapi_releases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_releases (id, name, released_at, scheduled_at, timezone, status, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
\.


--
-- TOC entry 4275 (class 0 OID 41028)
-- Dependencies: 285
-- Data for Name: strapi_transfer_token_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_transfer_token_permissions (id, action, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
1	pull	2025-01-20 14:32:23.154	2025-01-20 14:32:23.154	\N	\N	eq9fzgffkhqc83a6tkz7oxx7	\N	2025-01-22 13:42:13.696
\.


--
-- TOC entry 4277 (class 0 OID 41034)
-- Dependencies: 287
-- Data for Name: strapi_transfer_token_permissions_token_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_transfer_token_permissions_token_lnk (id, transfer_token_permission_id, transfer_token_id, transfer_token_permission_ord) FROM stdin;
1	1	1	1
\.


--
-- TOC entry 4279 (class 0 OID 41038)
-- Dependencies: 289
-- Data for Name: strapi_transfer_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_transfer_tokens (id, name, description, access_key, last_used_at, expires_at, lifespan, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
1	default		4d5541f34bd8e3411d759098f9b8027fc229dd06adb6f3da980e6001f9dea2e19af615d0bc718a058ea5a7a254f917ca4c4399612ce08a3a61977f86e180e202	\N	\N	\N	2025-01-20 14:32:23.143	2025-01-20 14:32:23.143	\N	\N	hiofr2uf4z4psulumvdx4qx7	\N	2025-01-22 13:42:13.693
\.


--
-- TOC entry 4281 (class 0 OID 41044)
-- Dependencies: 291
-- Data for Name: strapi_webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_webhooks (id, name, url, headers, events, enabled) FROM stdin;
\.


--
-- TOC entry 4283 (class 0 OID 41050)
-- Dependencies: 293
-- Data for Name: strapi_workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_workflows (id, document_id, name, content_types, created_at, updated_at, published_at, created_by_id, updated_by_id, locale) FROM stdin;
\.


--
-- TOC entry 4285 (class 0 OID 41056)
-- Dependencies: 295
-- Data for Name: strapi_workflows_stage_required_to_publish_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_workflows_stage_required_to_publish_lnk (id, workflow_id, workflow_stage_id) FROM stdin;
\.


--
-- TOC entry 4287 (class 0 OID 41060)
-- Dependencies: 297
-- Data for Name: strapi_workflows_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_workflows_stages (id, document_id, name, color, created_at, updated_at, published_at, created_by_id, updated_by_id, locale) FROM stdin;
\.


--
-- TOC entry 4289 (class 0 OID 41066)
-- Dependencies: 299
-- Data for Name: strapi_workflows_stages_permissions_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_workflows_stages_permissions_lnk (id, workflow_stage_id, permission_id, permission_ord) FROM stdin;
\.


--
-- TOC entry 4291 (class 0 OID 41070)
-- Dependencies: 301
-- Data for Name: strapi_workflows_stages_workflow_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strapi_workflows_stages_workflow_lnk (id, workflow_stage_id, workflow_id, workflow_stage_ord) FROM stdin;
\.


--
-- TOC entry 4293 (class 0 OID 41074)
-- Dependencies: 303
-- Data for Name: up_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.up_permissions (id, action, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
137	api::operation.operation.currentLocation	2025-01-14 17:46:05.576	2025-01-23 09:16:31.351	\N	\N	kyej6c70y8gaj9n9ag19hx7y	\N	2025-01-22 13:42:13.649
274	api::operation.operation.overview	2025-01-21 08:05:01.746	2025-01-23 09:16:31.351	\N	\N	wovmt44hzindisizdtl5au96	\N	2025-01-22 13:42:13.649
138	plugin::users-permissions.user.me	2025-01-14 17:46:05.576	2025-01-23 09:16:31.351	\N	\N	o91xqiq2az87qldu8a0frw79	\N	2025-01-22 13:42:13.649
322	api::map-layer.map-layer.find	2025-01-21 09:27:20.871	2025-01-23 09:16:31.347	\N	\N	zqryhvjyscy24t42di7c8aa5	\N	2025-01-22 13:42:13.649
320	api::journal-entry.journal-entry.update	2025-01-21 09:27:20.871	2025-01-23 09:16:31.347	\N	\N	w9ecbjs261lx9zh28so46qxx	\N	2025-01-22 13:42:13.649
323	api::map-layer.map-layer.findOne	2025-01-21 09:27:20.871	2025-01-23 09:16:31.347	\N	\N	avk6eo88c2lba6s8nf3tsrh8	\N	2025-01-22 13:42:13.649
299	api::access.access.find	2025-01-21 09:21:13.294	2025-01-23 09:16:31.347	\N	\N	sh9j7ubxx3jxb6rjl6wc8j6q	\N	2025-01-22 13:42:13.649
310	api::operation.operation.findOne	2025-01-21 09:21:13.296	2025-01-23 09:16:31.347	\N	\N	yalkcf6twnzl5wd1tnglkaxs	\N	2025-01-22 13:42:13.649
302	api::map-snapshot.map-snapshot.findOne	2025-01-21 09:21:13.295	2025-01-23 09:16:31.347	\N	\N	omul6hx7ibwoo5d4nzlt6r7g	\N	2025-01-22 13:42:13.649
304	api::operation.operation.create	2025-01-21 09:21:13.295	2025-01-23 09:16:31.347	\N	\N	l4t8vk5feg2atf8ebpusx6cp	\N	2025-01-22 13:42:13.649
277	api::map-layer.map-layer.find	2025-01-21 08:06:07.79	2025-01-23 09:16:31.353	\N	\N	eryjazvnmn3ny9mb21avficq	\N	2025-01-22 13:42:13.649
287	api::wms-source.wms-source.findOne	2025-01-21 08:06:48.069	2025-01-23 09:16:31.353	\N	\N	hun2n6bf1sqxhlu47kx07f74	\N	2025-01-22 13:42:13.649
335	plugin::users-permissions.user.find	2025-01-21 09:40:34.774	2025-01-23 09:16:31.363	\N	\N	zoxb1tbdwu8c07pezpswhw3x	\N	2025-01-22 13:42:13.649
275	api::wms-source.wms-source.find	2025-01-21 08:05:01.746	2025-01-23 09:16:31.351	\N	\N	r1kuk1iq2925r1xyvuui5318	\N	2025-01-22 13:42:13.649
279	api::map-layer.map-layer.create	2025-01-21 08:06:07.79	2025-01-23 09:16:31.353	\N	\N	nyohmer9dtiyno8wmffoyora	\N	2025-01-22 13:42:13.649
282	api::map-snapshot.map-snapshot.find	2025-01-21 08:06:48.069	2025-01-23 09:16:31.353	\N	\N	hjklqqyfiymeh1lzx8co01gt	\N	2025-01-22 13:42:13.649
332	api::journal-entry.journal-entry.update	2025-01-21 09:33:10.292	2025-01-23 09:16:31.353	\N	\N	g5olzuxapp91tt2jrbk0b6e5	\N	2025-01-22 13:42:13.649
285	api::operation.operation.updateMapLayers	2025-01-21 08:06:48.069	2025-01-23 09:16:31.353	\N	\N	xfz45xicm5x0zk8co3vz4go5	\N	2025-01-22 13:42:13.649
141	api::operation.operation.patch	2025-01-14 17:46:54.091	2025-01-23 09:16:31.353	\N	\N	hl0v5gxf8aacjmjph4juqe7x	\N	2025-01-22 13:42:13.649
135	api::operation.operation.findOne	2025-01-14 17:46:05.576	2025-01-23 09:16:31.351	\N	\N	fv772r6j6ifiw3w8mnq00ycb	\N	2025-01-22 13:42:13.649
316	api::wms-source.wms-source.findOne	2025-01-21 09:21:13.298	2025-01-23 09:16:31.347	\N	\N	w8i1uoirta5ijxvi8sc3ewnq	\N	2025-01-22 13:42:13.649
280	api::map-layer.map-layer.update	2025-01-21 08:06:07.79	2025-01-23 09:16:31.353	\N	\N	whmhthyu5k4ocgfyo3eobf94	\N	2025-01-22 13:42:13.649
139	api::access.access.refresh	2025-01-14 17:46:54.091	2025-01-23 09:16:31.353	\N	\N	cn4ier4dfp7601idda1jik43	\N	2025-01-22 13:42:13.649
331	api::journal-entry.journal-entry.create	2025-01-21 09:33:10.292	2025-01-23 09:16:31.353	\N	\N	lugicjly04s5n82c6bzzqk35	\N	2025-01-22 13:42:13.649
328	api::operation.operation.updateMeta	2025-01-21 09:27:25.256	2025-01-23 09:16:31.347	\N	\N	hw0ye8bub0gxuith0cdooz8h	\N	2025-01-22 13:42:13.649
309	api::operation.operation.patch	2025-01-21 09:21:13.296	2025-01-23 09:16:31.347	\N	\N	i321cwfv5ow8qhr978ip6uje	\N	2025-01-22 13:42:13.649
324	api::operation.operation.overview	2025-01-21 09:27:20.871	2025-01-23 09:16:31.347	\N	\N	fa1xh3tuznanzd7ffit36h5g	\N	2025-01-22 13:42:13.649
326	api::operation.operation.updateMapLayers	2025-01-21 09:27:20.871	2025-01-23 09:16:31.347	\N	\N	n77nxxul7msdwm34lfp1l8kv	\N	2025-01-22 13:42:13.649
314	plugin::users-permissions.user.me	2025-01-21 09:21:13.297	2025-01-23 09:16:31.347	\N	\N	b3fjw43dnp8gxkbn0eo2947w	\N	2025-01-22 13:42:13.649
325	api::operation.operation.archive	2025-01-21 09:27:20.871	2025-01-23 09:16:31.347	\N	\N	zgg3c6jz4d62dfny5mt4r90y	\N	2025-01-22 13:42:13.649
136	api::access.access.refresh	2025-01-14 17:46:05.576	2025-01-23 09:16:31.351	\N	\N	b9jyj59vlk1ig14cg3dxt82k	\N	2025-01-22 13:42:13.649
271	api::map-layer.map-layer.findOne	2025-01-21 08:05:01.746	2025-01-23 09:16:31.351	\N	\N	mq4ru8ydaeqf5ei4ors9yx1f	\N	2025-01-22 13:42:13.649
272	api::map-snapshot.map-snapshot.findOne	2025-01-21 08:05:01.746	2025-01-23 09:16:31.351	\N	\N	r9q4iiaqf2lgm3qw4fxwzhpp	\N	2025-01-22 13:42:13.649
296	api::journal-entry.journal-entry.find	2025-01-21 08:21:58.399	2025-01-23 09:16:31.367	\N	\N	uotg4s5cg2nvp142jitsw92q	\N	2025-01-22 13:42:13.649
337	api::organization.organization.find	2025-01-21 09:56:42.234	2025-01-23 09:16:31.347	\N	\N	ex3qfaswnznfh8w1fg1d2hor	\N	2025-01-22 13:42:13.649
327	api::operation.operation.unarchive	2025-01-21 09:27:20.871	2025-01-23 09:16:31.347	\N	\N	v040gxzc4yy180ti1ksm5afo	\N	2025-01-22 13:42:13.649
298	api::journal-entry.journal-entry.update	2025-01-21 08:21:58.399	2025-01-23 09:16:31.367	\N	\N	toswdp9qxvoh3utl1tnvbsda	\N	2025-01-22 13:42:13.649
293	api::access.access.update	2025-01-21 08:07:27.462	2025-01-23 09:16:31.367	\N	\N	r2doofaqz9dpkm4d4c2s6hqx	\N	2025-01-22 13:42:13.649
294	api::operation.operation.unarchive	2025-01-21 08:07:27.462	2025-01-23 09:16:31.367	\N	\N	ke0s4wmzr9279hwv7krre79v	\N	2025-01-22 13:42:13.649
144	api::access.access.generate	2025-01-14 17:48:24.156	2025-01-23 09:16:31.366	\N	\N	oalu3xvh06gyhk5wqpzl3kp0	\N	2025-01-22 13:42:13.649
297	api::journal-entry.journal-entry.create	2025-01-21 08:21:58.399	2025-01-23 09:16:31.367	\N	\N	novv2oa6e6p12tkfde3ecypl	\N	2025-01-22 13:42:13.649
336	api::organization.organization.find	2025-01-21 09:53:31.866	2025-01-23 09:16:31.367	\N	\N	fpdsz20nvavm7azft39pb1a1	\N	2025-01-22 13:42:13.649
321	api::journal-entry.journal-entry.create	2025-01-21 09:27:20.871	2025-01-23 09:16:31.347	\N	\N	hchejgreg45bf8l1flw4bj7l	\N	2025-01-22 13:42:13.649
319	api::journal-entry.journal-entry.find	2025-01-21 09:27:20.871	2025-01-23 09:16:31.347	\N	\N	weipct0rmdmdsp7v9ntvwf3d	\N	2025-01-22 13:42:13.649
276	api::wms-source.wms-source.findOne	2025-01-21 08:05:01.746	2025-01-23 09:16:31.351	\N	\N	gyun6tlygrhedq5yk42sfrox	\N	2025-01-22 13:42:13.649
330	api::journal-entry.journal-entry.find	2025-01-21 09:33:10.292	2025-01-23 09:16:31.353	\N	\N	ymx5jggypjl36fs0e216lgbt	\N	2025-01-22 13:42:13.649
142	api::operation.operation.currentLocation	2025-01-14 17:46:54.091	2025-01-23 09:16:31.353	\N	\N	l5srirc9xgstd3w70r4kf4sv	\N	2025-01-22 13:42:13.649
140	api::operation.operation.findOne	2025-01-14 17:46:54.091	2025-01-23 09:16:31.353	\N	\N	eo2ig1r6b5p1rkqldreh2lue	\N	2025-01-22 13:42:13.649
289	api::wms-source.wms-source.update	2025-01-21 08:06:48.069	2025-01-23 09:16:31.353	\N	\N	tzpverd3w3b8mpev1wfrruk0	\N	2025-01-22 13:42:13.649
291	api::access.access.create	2025-01-21 08:07:27.462	2025-01-23 09:16:31.366	\N	\N	h91eufwkl5ns2d3wepqox8g3	\N	2025-01-22 13:42:13.649
292	api::access.access.findOne	2025-01-21 08:07:27.462	2025-01-23 09:16:31.366	\N	\N	b6anilp9xu2zervpp9wtjylf	\N	2025-01-22 13:42:13.649
290	api::access.access.token	2025-01-21 08:07:27.462	2025-01-23 09:16:31.366	\N	\N	wdg7drd575mg6b19pcthyqd9	\N	2025-01-22 13:42:13.649
278	api::map-layer.map-layer.findOne	2025-01-21 08:06:07.79	2025-01-23 09:16:31.353	\N	\N	pdjvexcep8kyd6xlwklrvdc9	\N	2025-01-22 13:42:13.649
283	api::operation.operation.overview	2025-01-21 08:06:48.069	2025-01-23 09:16:31.353	\N	\N	oa0dv4ovf8d61vew2rt7knyx	\N	2025-01-22 13:42:13.649
334	api::organization.organization.find	2025-01-21 09:39:54.972	2025-01-23 09:16:31.363	\N	\N	mdvv8zm6277zbxd04x7gpyiy	\N	2025-01-22 13:42:13.649
281	api::map-snapshot.map-snapshot.findOne	2025-01-21 08:06:48.069	2025-01-23 09:16:31.353	\N	\N	hou8m9gk07xtmvu6hdqkw9y1	\N	2025-01-22 13:42:13.649
143	plugin::users-permissions.user.me	2025-01-14 17:46:54.091	2025-01-23 09:16:31.354	\N	\N	kcfkrfcmjpo301yy7alg1xnc	\N	2025-01-22 13:42:13.649
286	api::wms-source.wms-source.find	2025-01-21 08:06:48.069	2025-01-23 09:16:31.353	\N	\N	xdyn1xrrp2m1qtk5szl3jfya	\N	2025-01-22 13:42:13.649
288	api::wms-source.wms-source.create	2025-01-21 08:06:48.069	2025-01-23 09:16:31.353	\N	\N	soijby1t7f7dpk81xgx9q03k	\N	2025-01-22 13:42:13.649
212	api::map-layer.map-layer.findOne	2025-01-14 18:13:41.308	2025-01-23 09:16:31.363	\N	\N	iwb9vsnrv1jz80axk197bt6t	\N	2025-01-22 13:42:13.649
152	api::operation.operation.currentLocation	2025-01-14 17:48:24.156	2025-01-23 09:16:31.367	\N	\N	ohfrw679c76euw5pwn2q54es	\N	2025-01-22 13:42:13.649
154	api::operation.operation.find	2025-01-14 17:48:24.156	2025-01-23 09:16:31.367	\N	\N	aby0uqcxs179os2yy9rkqj29	\N	2025-01-22 13:42:13.649
230	api::map-layer.map-layer.create	2025-01-14 18:24:08.829	2025-01-23 09:16:31.367	\N	\N	s2a7hna8etrt4ivqjpeee771	\N	2025-01-22 13:42:13.649
240	api::map-layer.map-layer.update	2025-01-14 18:24:08.829	2025-01-23 09:16:31.367	\N	\N	a0b5uo503tjuqsgx71iqkz0q	\N	2025-01-22 13:42:13.649
150	api::operation.operation.findOne	2025-01-14 17:48:24.156	2025-01-23 09:16:31.367	\N	\N	hf7dsn68snhu9b3pqels2mkf	\N	2025-01-22 13:42:13.649
153	api::operation.operation.overview	2025-01-14 17:48:24.156	2025-01-23 09:16:31.367	\N	\N	wfqlikadykw0v0kx0pt14er3	\N	2025-01-22 13:42:13.649
149	api::map-snapshot.map-snapshot.find	2025-01-14 17:48:24.156	2025-01-23 09:16:31.367	\N	\N	uf9swluy25i78ij33vksebgc	\N	2025-01-22 13:42:13.649
235	api::wms-source.wms-source.update	2025-01-14 18:24:08.83	2025-01-23 09:16:31.367	\N	\N	prn7ezquur4mxb3p5bieg7bu	\N	2025-01-22 13:42:13.649
226	api::wms-source.wms-source.delete	2025-01-14 18:24:08.83	2025-01-23 09:16:31.367	\N	\N	hdyq67pctdqxku5igaformis	\N	2025-01-22 13:42:13.649
160	plugin::users-permissions.user.me	2025-01-14 17:48:24.156	2025-01-23 09:16:31.367	\N	\N	q4s7zzcq0466f93xuiuw1tk7	\N	2025-01-22 13:42:13.649
151	api::operation.operation.patch	2025-01-14 17:48:24.156	2025-01-23 09:16:31.367	\N	\N	gc0my12ntnz2dku9se0af5kl	\N	2025-01-22 13:42:13.649
225	api::organization.organization.updateLayerSettings	2025-01-14 18:24:08.829	2025-01-23 09:16:31.367	\N	\N	j7movnhslrz4vuurscvivr01	\N	2025-01-22 13:42:13.649
241	api::wms-source.wms-source.create	2025-01-14 18:24:08.829	2025-01-23 09:16:31.367	\N	\N	aygbzsq5oyjllfql9ltx6lg2	\N	2025-01-22 13:42:13.649
300	api::access.access.delete	2025-01-21 09:21:13.294	2025-01-23 09:16:31.346	\N	\N	gky8ezdaosao4jn5fmfsdbxw	\N	2025-01-22 13:42:13.649
303	api::access.access.generate	2025-01-21 09:21:13.295	2025-01-23 09:16:31.347	\N	\N	a94lp0963k6jh70aba308kw1	\N	2025-01-22 13:42:13.649
301	api::map-snapshot.map-snapshot.find	2025-01-21 09:21:13.295	2025-01-23 09:16:31.347	\N	\N	suiv81x41xphet25ffrumlxd	\N	2025-01-22 13:42:13.649
165	api::organization.organization.forLogin	2025-01-14 18:02:08.738	2025-01-23 09:16:31.363	\N	\N	q355js3rnwm383r8kop0925u	\N	2025-01-22 13:42:13.649
339	api::operation.operation.shadowDelete	2025-01-22 15:18:34.274	2025-01-23 09:16:31.347	\N	\N	pbc6urzatgfk2sh1soajd9rs	\N	2025-01-22 15:18:34.271
318	api::wms-source.wms-source.find	2025-01-21 09:21:13.298	2025-01-23 09:16:31.347	\N	\N	bm55vo5otup253d0awakyosh	\N	2025-01-22 13:42:13.649
270	api::map-layer.map-layer.find	2025-01-21 08:05:01.746	2025-01-23 09:16:31.351	\N	\N	tbe1hoxjnct40hhcko4r62hw	\N	2025-01-22 13:42:13.649
273	api::map-snapshot.map-snapshot.find	2025-01-21 08:05:01.746	2025-01-23 09:16:31.351	\N	\N	dcus0drkgdxyrkprmyp7lvra	\N	2025-01-22 13:42:13.649
329	api::journal-entry.journal-entry.find	2025-01-21 09:31:06.793	2025-01-23 09:16:31.351	\N	\N	przpsm4myjz7xoa7t6k5stdq	\N	2025-01-22 13:42:13.649
214	api::wms-source.wms-source.find	2025-01-14 18:13:41.308	2025-01-23 09:16:31.363	\N	\N	kzd11n4fnnykj0lo36g0oq9w	\N	2025-01-22 13:42:13.649
162	api::access.access.token	2025-01-14 18:02:01.416	2025-01-23 09:16:31.363	\N	\N	ons3f0jh0gufoy7y0yiqe2md	\N	2025-01-22 13:42:13.649
213	api::map-layer.map-layer.find	2025-01-14 18:13:41.308	2025-01-23 09:16:31.363	\N	\N	pew4xatp1b84z613ruas67y7	\N	2025-01-22 13:42:13.649
147	api::access.access.delete	2025-01-14 17:48:24.156	2025-01-23 09:16:31.366	\N	\N	bedisevxmkrwjyp02vwtn100	\N	2025-01-22 13:42:13.649
146	api::access.access.find	2025-01-14 17:48:24.156	2025-01-23 09:16:31.366	\N	\N	nrgj6esnvrgf9zf5da5zrzgz	\N	2025-01-22 13:42:13.649
145	api::access.access.refresh	2025-01-14 17:48:24.156	2025-01-23 09:16:31.366	\N	\N	fq2tinjsttzcc4yx652eefd3	\N	2025-01-22 13:42:13.649
224	api::map-layer.map-layer.find	2025-01-14 18:24:08.829	2025-01-23 09:16:31.367	\N	\N	o1obn96jod3k2pndkip9y7bk	\N	2025-01-22 13:42:13.649
242	api::map-layer.map-layer.delete	2025-01-14 18:24:08.829	2025-01-23 09:16:31.367	\N	\N	h79z2ri4y77l0ddshfgmfh55	\N	2025-01-22 13:42:13.649
148	api::map-snapshot.map-snapshot.findOne	2025-01-14 17:48:24.156	2025-01-23 09:16:31.367	\N	\N	p7hfj91a507g35im11snpdaf	\N	2025-01-22 13:42:13.649
234	api::map-layer.map-layer.findOne	2025-01-14 18:24:08.829	2025-01-23 09:16:31.367	\N	\N	wybcybmos4ggoqxezt7pund8	\N	2025-01-22 13:42:13.649
236	api::operation.operation.archive	2025-01-20 11:29:52.213	2025-01-23 09:16:31.367	\N	\N	sj3bf6buq9vj33s8yk4snzoe	\N	2025-01-22 13:42:13.649
155	api::operation.operation.create	2025-01-14 17:48:24.156	2025-01-23 09:16:31.367	\N	\N	zjzcroggsfvbe7az1y9p43fs	\N	2025-01-22 13:42:13.649
233	api::operation.operation.updateMapLayers	2025-01-20 11:29:52.213	2025-01-23 09:16:31.367	\N	\N	hcpwagjxfs5gpfuulc5675a4	\N	2025-01-22 13:42:13.649
232	api::operation.operation.updateMeta	2025-01-20 11:29:52.213	2025-01-23 09:16:31.367	\N	\N	mbdwgwsy6wm43uipu6gkmjdf	\N	2025-01-22 13:42:13.649
223	api::wms-source.wms-source.find	2025-01-14 18:24:08.829	2025-01-23 09:16:31.367	\N	\N	v6xzdezhcwpd405aotvyj22p	\N	2025-01-22 13:42:13.649
231	api::wms-source.wms-source.findOne	2025-01-14 18:24:08.829	2025-01-23 09:16:31.367	\N	\N	k7ic45e2pxj1d7x0463vvqbg	\N	2025-01-22 13:42:13.649
125	plugin::users-permissions.auth.callback	2025-01-14 17:38:53.085	2025-01-23 09:16:31.363	\N	\N	nnfew0uw6w4yh36g1w3falo0	\N	2025-01-22 13:42:13.649
215	api::wms-source.wms-source.findOne	2025-01-14 18:13:41.308	2025-01-23 09:16:31.363	\N	\N	ewxckjmxmbluzmnrphy7ud5r	\N	2025-01-22 13:42:13.649
126	plugin::users-permissions.auth.connect	2025-01-14 17:38:53.085	2025-01-23 09:16:31.363	\N	\N	fgdguywxgldathn07io4kotw	\N	2025-01-22 13:42:13.649
340	api::operation.operation.shadowDelete	2025-01-22 15:18:34.288	2025-01-23 09:16:31.367	\N	\N	kblyn8fpr6v9s9ix6yadp0iv	\N	2025-01-22 15:18:34.282
342	api::journal-entry.journal-entry.findOne	2025-01-23 13:35:44.906	2025-01-23 13:35:44.906	\N	\N	jfv77n2wie7yc02x5xrb7zzj	\N	2025-01-23 13:35:44.906
343	api::journal-entry.journal-entry.findOne	2025-01-23 13:35:53.797	2025-01-23 13:35:53.797	\N	\N	dv9qvofqmiw6ez8cpuey3c2n	\N	2025-01-23 13:35:53.797
344	api::journal-entry.journal-entry.findOne	2025-01-23 13:35:59.314	2025-01-23 13:35:59.314	\N	\N	b98nxjrk7kps1j4zog9rj5g3	\N	2025-01-23 13:35:59.314
345	api::journal-entry.journal-entry.findOne	2025-01-23 13:36:05.465	2025-01-23 13:36:05.465	\N	\N	vlbbrx6uhqa5fco51bc5zk9u	\N	2025-01-23 13:36:05.465
\.


--
-- TOC entry 4295 (class 0 OID 41080)
-- Dependencies: 305
-- Data for Name: up_permissions_role_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.up_permissions_role_lnk (id, permission_id, role_id, permission_ord) FROM stdin;
319	319	17	4
321	327	17	5
323	324	17	5
325	325	17	5
327	326	17	5
328	328	17	6
329	329	10	6
331	331	11	8
334	334	13	6
335	335	13	7
337	337	17	7
275	276	10	5
274	275	10	5
277	279	11	4
279	278	11	4
280	280	11	5
281	281	11	6
284	282	11	7
283	285	11	7
286	289	11	7
288	288	11	7
290	290	16	7
292	292	16	8
294	294	16	8
297	296	16	10
300	299	17	1
308	304	17	1
310	310	17	2
314	318	17	2
315	314	17	2
125	125	13	1
126	126	13	1
135	135	10	1
136	136	10	1
137	137	10	2
138	138	10	2
139	140	11	1
140	139	11	1
141	141	11	2
142	142	11	2
143	143	11	3
144	153	16	1
145	147	16	1
146	149	16	1
147	144	16	1
148	145	16	1
149	146	16	1
150	152	16	1
151	151	16	1
152	148	16	1
153	150	16	1
154	154	16	2
155	155	16	2
159	160	16	2
320	320	17	4
162	162	13	3
165	165	13	4
322	322	17	5
324	323	17	5
326	321	17	5
330	330	11	8
332	332	11	9
336	336	16	12
212	212	13	5
213	214	13	5
214	213	13	5
215	215	13	5
229	224	16	4
230	223	16	4
231	234	16	4
232	242	16	4
233	231	16	4
234	240	16	4
235	235	16	5
236	241	16	5
237	230	16	5
238	225	16	5
239	226	16	5
240	236	16	6
241	233	16	6
242	232	16	6
270	270	10	3
271	271	10	3
272	273	10	4
273	272	10	4
276	274	10	5
278	277	11	4
282	283	11	6
285	286	11	7
287	287	11	7
291	291	16	7
293	293	16	8
296	297	16	10
298	298	16	11
299	300	17	1
301	302	17	1
306	301	17	1
307	303	17	1
309	309	17	2
317	316	17	2
439	339	17	8
442	340	16	13
646	342	17	9
647	343	10	7
648	344	11	10
649	345	16	14
\.


--
-- TOC entry 4297 (class 0 OID 41084)
-- Dependencies: 307
-- Data for Name: up_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.up_roles (id, name, description, type, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
12	Authenticated	Default role given to authenticated user.	authenticated	2025-01-14 17:38:53.074	2025-01-23 09:16:31.339	\N	\N	w0byu09joanar45e990zuh7j	\N	2025-01-23 09:16:31.33
13	Public	Default role given to unauthenticated user.	public	2025-01-14 17:38:53.076	2025-01-23 09:16:31.344	\N	\N	bb8bq664cr38rvmr3s1w85v9	\N	2025-01-23 09:16:31.333
17	Guest	Default role given to authenticated user.	guest	2025-01-21 09:21:13.286	2025-01-23 13:35:44.897	\N	\N	e7pj23xlf7lghvvto89ysuh5	\N	2025-01-23 09:16:31.327
10	OperationRead	The role for the default operation_read user.	operationread	2025-01-14 17:46:05.567	2025-01-23 13:35:53.789	\N	\N	cuhzirl7f3xv2dvrcomyumdb	\N	2025-01-23 09:16:31.329
11	OperationWrite	The role for the default operation_write user.	operationwrite	2025-01-14 17:46:54.086	2025-01-23 13:35:59.309	\N	\N	ehki4xekm6intcglac5nvomv	\N	2025-01-23 09:16:31.337
16	Organization	Main Organization Users	organization	2025-01-14 17:48:24.151	2025-01-23 13:36:05.459	\N	\N	zogneucdi1agyukp7xpxmvrc	\N	2025-01-23 09:16:31.342
\.


--
-- TOC entry 4299 (class 0 OID 41090)
-- Dependencies: 309
-- Data for Name: up_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.up_users (id, username, email, provider, password, reset_password_token, confirmation_token, confirmed, blocked, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
6	zso_development	zso_development@zskarte.ch	local	$2a$10$W41Sgq2PcGFRXZbydPQnSuc.STI/psn3Wu3JYS4O5jaf7FuhCb3p2	\N	\N	f	f	2025-01-14 18:04:42.385	2025-01-14 18:07:30.232	\N	\N	svggeujm9e12i5g6r1yqflh3	\N	2025-01-22 13:42:13.655
5	zso_guest	zso_guest@zskarte.ch	local	$2a$10$9o/K9fPsQFB4y1KGypDgfuKXIapzKWsK9l/v5OThvOqJusLcr0lby	\N	\N	f	f	2025-01-14 18:07:16.804	2025-01-21 09:21:56.652	\N	1	uhhzzwx3adftody8y5wfuddr	\N	2025-01-22 13:42:13.655
7	operation_read	operation_read@zskarte.ch	local	$2a$10$IiygeEmKx7hO94NFsxfPo.eBpRZ5mPQBmoLanw73.THSrrd3bSsqm	\N	\N	f	f	2025-01-14 18:12:20.484	2025-01-21 09:23:29.82	\N	1	w6xkbvk5fcuxrepdsb22aq7n	\N	2025-01-22 13:42:13.655
8	operation_write	operation_write@zskarte.ch	local	$2a$10$VP4bWnDCiss1GcW3Mq5zOO2.NPscatAbcaqGLMMA/wqkMnO0fDWSO	\N	\N	f	f	2025-01-14 18:12:42.909	2025-01-21 09:23:35.406	\N	1	gecwqkxp3jk5p3edcucfpdvr	\N	2025-01-22 13:42:13.655
\.


--
-- TOC entry 4301 (class 0 OID 41096)
-- Dependencies: 311
-- Data for Name: up_users_organization_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.up_users_organization_lnk (id, user_id, organization_id, user_ord) FROM stdin;
3	6	3	1
4	5	4	1
\.


--
-- TOC entry 4303 (class 0 OID 41100)
-- Dependencies: 313
-- Data for Name: up_users_role_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.up_users_role_lnk (id, user_id, role_id, user_ord) FROM stdin;
5	6	16	1
9	5	17	1
10	7	10	1
11	8	11	1
\.


--
-- TOC entry 4305 (class 0 OID 41104)
-- Dependencies: 315
-- Data for Name: upload_folders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.upload_folders (id, name, path_id, path, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
1	test	1	/1	2025-01-21 11:10:43.637	2025-01-21 11:10:43.637	1	1	pzllu2is268ja7kqy67xqhy1	\N	2025-01-22 13:42:13.637
2	test	2	/1/2	2025-01-21 11:10:48.851	2025-01-21 11:10:48.851	1	1	ask69rcihg3m3lrgmz3z7p7q	\N	2025-01-22 13:42:13.637
\.


--
-- TOC entry 4307 (class 0 OID 41110)
-- Dependencies: 317
-- Data for Name: upload_folders_parent_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.upload_folders_parent_lnk (id, folder_id, inv_folder_id, folder_ord) FROM stdin;
1	2	1	1
\.


--
-- TOC entry 4309 (class 0 OID 41114)
-- Dependencies: 319
-- Data for Name: wms_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wms_sources (id, label, type, url, attribution, public, created_at, updated_at, created_by_id, updated_by_id, document_id, locale, published_at) FROM stdin;
\.


--
-- TOC entry 4311 (class 0 OID 41120)
-- Dependencies: 321
-- Data for Name: wms_sources_organization_lnk; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wms_sources_organization_lnk (id, wms_source_id, organization_id) FROM stdin;
\.


--
-- TOC entry 4372 (class 0 OID 0)
-- Dependencies: 216
-- Name: accesses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accesses_id_seq', 11, true);


--
-- TOC entry 4373 (class 0 OID 0)
-- Dependencies: 218
-- Name: accesses_operation_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accesses_operation_links_id_seq', 10, true);


--
-- TOC entry 4374 (class 0 OID 0)
-- Dependencies: 220
-- Name: admin_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_permissions_id_seq', 177, true);


--
-- TOC entry 4375 (class 0 OID 0)
-- Dependencies: 222
-- Name: admin_permissions_role_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_permissions_role_links_id_seq', 177, true);


--
-- TOC entry 4376 (class 0 OID 0)
-- Dependencies: 224
-- Name: admin_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_roles_id_seq', 3, true);


--
-- TOC entry 4377 (class 0 OID 0)
-- Dependencies: 226
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 1, true);


--
-- TOC entry 4378 (class 0 OID 0)
-- Dependencies: 228
-- Name: admin_users_roles_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_users_roles_links_id_seq', 1, true);


--
-- TOC entry 4379 (class 0 OID 0)
-- Dependencies: 231
-- Name: files_folder_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.files_folder_links_id_seq', 1, false);


--
-- TOC entry 4380 (class 0 OID 0)
-- Dependencies: 232
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.files_id_seq', 1, false);


--
-- TOC entry 4381 (class 0 OID 0)
-- Dependencies: 234
-- Name: files_related_morphs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.files_related_morphs_id_seq', 1, false);


--
-- TOC entry 4382 (class 0 OID 0)
-- Dependencies: 236
-- Name: i18n_locale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.i18n_locale_id_seq', 2, true);


--
-- TOC entry 4383 (class 0 OID 0)
-- Dependencies: 238
-- Name: journal_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journal_entries_id_seq', 1, false);


--
-- TOC entry 4384 (class 0 OID 0)
-- Dependencies: 240
-- Name: journal_entries_operation_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journal_entries_operation_links_id_seq', 1, false);


--
-- TOC entry 4385 (class 0 OID 0)
-- Dependencies: 242
-- Name: journal_entries_organization_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journal_entries_organization_links_id_seq', 1, false);


--
-- TOC entry 4386 (class 0 OID 0)
-- Dependencies: 244
-- Name: map_layers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.map_layers_id_seq', 5, true);


--
-- TOC entry 4387 (class 0 OID 0)
-- Dependencies: 246
-- Name: map_layers_organization_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.map_layers_organization_links_id_seq', 5, true);


--
-- TOC entry 4388 (class 0 OID 0)
-- Dependencies: 248
-- Name: map_layers_wms_source_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.map_layers_wms_source_links_id_seq', 1, false);


--
-- TOC entry 4389 (class 0 OID 0)
-- Dependencies: 250
-- Name: map_snapshots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.map_snapshots_id_seq', 109, true);


--
-- TOC entry 4390 (class 0 OID 0)
-- Dependencies: 252
-- Name: map_snapshots_operation_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.map_snapshots_operation_links_id_seq', 105, true);


--
-- TOC entry 4391 (class 0 OID 0)
-- Dependencies: 254
-- Name: operations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operations_id_seq', 8, true);


--
-- TOC entry 4392 (class 0 OID 0)
-- Dependencies: 256
-- Name: operations_organization_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operations_organization_links_id_seq', 8, true);


--
-- TOC entry 4393 (class 0 OID 0)
-- Dependencies: 258
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizations_id_seq', 4, true);


--
-- TOC entry 4394 (class 0 OID 0)
-- Dependencies: 260
-- Name: organizations_map_layer_favorites_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizations_map_layer_favorites_links_id_seq', 3, true);


--
-- TOC entry 4395 (class 0 OID 0)
-- Dependencies: 262
-- Name: organizations_wms_sources_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizations_wms_sources_links_id_seq', 1, false);


--
-- TOC entry 4396 (class 0 OID 0)
-- Dependencies: 264
-- Name: strapi_api_token_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_api_token_permissions_id_seq', 1, false);


--
-- TOC entry 4397 (class 0 OID 0)
-- Dependencies: 266
-- Name: strapi_api_token_permissions_token_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_api_token_permissions_token_links_id_seq', 1, false);


--
-- TOC entry 4398 (class 0 OID 0)
-- Dependencies: 268
-- Name: strapi_api_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_api_tokens_id_seq', 1, false);


--
-- TOC entry 4399 (class 0 OID 0)
-- Dependencies: 270
-- Name: strapi_core_store_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_core_store_settings_id_seq', 65, true);


--
-- TOC entry 4400 (class 0 OID 0)
-- Dependencies: 272
-- Name: strapi_database_schema_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_database_schema_id_seq', 9, true);


--
-- TOC entry 4401 (class 0 OID 0)
-- Dependencies: 274
-- Name: strapi_history_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_history_versions_id_seq', 1, false);


--
-- TOC entry 4402 (class 0 OID 0)
-- Dependencies: 276
-- Name: strapi_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_migrations_id_seq', 1, false);


--
-- TOC entry 4403 (class 0 OID 0)
-- Dependencies: 278
-- Name: strapi_migrations_internal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_migrations_internal_id_seq', 6, true);


--
-- TOC entry 4404 (class 0 OID 0)
-- Dependencies: 280
-- Name: strapi_release_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_release_actions_id_seq', 1, false);


--
-- TOC entry 4405 (class 0 OID 0)
-- Dependencies: 282
-- Name: strapi_release_actions_release_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_release_actions_release_links_id_seq', 1, false);


--
-- TOC entry 4406 (class 0 OID 0)
-- Dependencies: 284
-- Name: strapi_releases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_releases_id_seq', 1, false);


--
-- TOC entry 4407 (class 0 OID 0)
-- Dependencies: 286
-- Name: strapi_transfer_token_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_transfer_token_permissions_id_seq', 1, true);


--
-- TOC entry 4408 (class 0 OID 0)
-- Dependencies: 288
-- Name: strapi_transfer_token_permissions_token_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_transfer_token_permissions_token_links_id_seq', 1, true);


--
-- TOC entry 4409 (class 0 OID 0)
-- Dependencies: 290
-- Name: strapi_transfer_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_transfer_tokens_id_seq', 1, true);


--
-- TOC entry 4410 (class 0 OID 0)
-- Dependencies: 292
-- Name: strapi_webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_webhooks_id_seq', 1, false);


--
-- TOC entry 4411 (class 0 OID 0)
-- Dependencies: 294
-- Name: strapi_workflows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_workflows_id_seq', 1, false);


--
-- TOC entry 4412 (class 0 OID 0)
-- Dependencies: 296
-- Name: strapi_workflows_stage_required_to_publish_lnk_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_workflows_stage_required_to_publish_lnk_id_seq', 1, false);


--
-- TOC entry 4413 (class 0 OID 0)
-- Dependencies: 298
-- Name: strapi_workflows_stages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_workflows_stages_id_seq', 1, false);


--
-- TOC entry 4414 (class 0 OID 0)
-- Dependencies: 300
-- Name: strapi_workflows_stages_permissions_lnk_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_workflows_stages_permissions_lnk_id_seq', 1, false);


--
-- TOC entry 4415 (class 0 OID 0)
-- Dependencies: 302
-- Name: strapi_workflows_stages_workflow_lnk_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.strapi_workflows_stages_workflow_lnk_id_seq', 1, false);


--
-- TOC entry 4416 (class 0 OID 0)
-- Dependencies: 304
-- Name: up_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.up_permissions_id_seq', 345, true);


--
-- TOC entry 4417 (class 0 OID 0)
-- Dependencies: 306
-- Name: up_permissions_role_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.up_permissions_role_links_id_seq', 649, true);


--
-- TOC entry 4418 (class 0 OID 0)
-- Dependencies: 308
-- Name: up_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.up_roles_id_seq', 17, true);


--
-- TOC entry 4419 (class 0 OID 0)
-- Dependencies: 310
-- Name: up_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.up_users_id_seq', 8, true);


--
-- TOC entry 4420 (class 0 OID 0)
-- Dependencies: 312
-- Name: up_users_organization_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.up_users_organization_links_id_seq', 4, true);


--
-- TOC entry 4421 (class 0 OID 0)
-- Dependencies: 314
-- Name: up_users_role_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.up_users_role_links_id_seq', 11, true);


--
-- TOC entry 4422 (class 0 OID 0)
-- Dependencies: 316
-- Name: upload_folders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.upload_folders_id_seq', 2, true);


--
-- TOC entry 4423 (class 0 OID 0)
-- Dependencies: 318
-- Name: upload_folders_parent_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.upload_folders_parent_links_id_seq', 1, true);


--
-- TOC entry 4424 (class 0 OID 0)
-- Dependencies: 320
-- Name: wms_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wms_sources_id_seq', 1, false);


--
-- TOC entry 4425 (class 0 OID 0)
-- Dependencies: 322
-- Name: wms_sources_organization_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wms_sources_organization_links_id_seq', 1, false);


--
-- TOC entry 3530 (class 2606 OID 41181)
-- Name: accesses_operation_lnk accesses_operation_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses_operation_lnk
    ADD CONSTRAINT accesses_operation_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3532 (class 2606 OID 41183)
-- Name: accesses_operation_lnk accesses_operation_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses_operation_lnk
    ADD CONSTRAINT accesses_operation_links_unique UNIQUE (access_id, operation_id);


--
-- TOC entry 3536 (class 2606 OID 41185)
-- Name: accesses_operation_lnk accesses_operation_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses_operation_lnk
    ADD CONSTRAINT accesses_operation_lnk_uq UNIQUE (access_id, operation_id);


--
-- TOC entry 3525 (class 2606 OID 41187)
-- Name: accesses accesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses
    ADD CONSTRAINT accesses_pkey PRIMARY KEY (id);


--
-- TOC entry 3540 (class 2606 OID 41189)
-- Name: admin_permissions admin_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3546 (class 2606 OID 41191)
-- Name: admin_permissions_role_lnk admin_permissions_role_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions_role_lnk
    ADD CONSTRAINT admin_permissions_role_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3548 (class 2606 OID 41193)
-- Name: admin_permissions_role_lnk admin_permissions_role_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions_role_lnk
    ADD CONSTRAINT admin_permissions_role_links_unique UNIQUE (permission_id, role_id);


--
-- TOC entry 3553 (class 2606 OID 41195)
-- Name: admin_permissions_role_lnk admin_permissions_role_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions_role_lnk
    ADD CONSTRAINT admin_permissions_role_lnk_uq UNIQUE (permission_id, role_id);


--
-- TOC entry 3557 (class 2606 OID 41197)
-- Name: admin_roles admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3562 (class 2606 OID 41199)
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 3569 (class 2606 OID 41201)
-- Name: admin_users_roles_lnk admin_users_roles_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users_roles_lnk
    ADD CONSTRAINT admin_users_roles_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3571 (class 2606 OID 41203)
-- Name: admin_users_roles_lnk admin_users_roles_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users_roles_lnk
    ADD CONSTRAINT admin_users_roles_links_unique UNIQUE (user_id, role_id);


--
-- TOC entry 3577 (class 2606 OID 41205)
-- Name: admin_users_roles_lnk admin_users_roles_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users_roles_lnk
    ADD CONSTRAINT admin_users_roles_lnk_uq UNIQUE (user_id, role_id);


--
-- TOC entry 3593 (class 2606 OID 41207)
-- Name: files_folder_lnk files_folder_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_folder_lnk
    ADD CONSTRAINT files_folder_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3595 (class 2606 OID 41209)
-- Name: files_folder_lnk files_folder_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_folder_lnk
    ADD CONSTRAINT files_folder_links_unique UNIQUE (file_id, folder_id);


--
-- TOC entry 3600 (class 2606 OID 41211)
-- Name: files_folder_lnk files_folder_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_folder_lnk
    ADD CONSTRAINT files_folder_lnk_uq UNIQUE (file_id, folder_id);


--
-- TOC entry 3581 (class 2606 OID 41213)
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- TOC entry 3605 (class 2606 OID 41215)
-- Name: files_related_mph files_related_morphs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_related_mph
    ADD CONSTRAINT files_related_morphs_pkey PRIMARY KEY (id);


--
-- TOC entry 3612 (class 2606 OID 41217)
-- Name: i18n_locale i18n_locale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.i18n_locale
    ADD CONSTRAINT i18n_locale_pkey PRIMARY KEY (id);


--
-- TOC entry 3622 (class 2606 OID 41219)
-- Name: journal_entries_operation_lnk journal_entries_operation_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_operation_lnk
    ADD CONSTRAINT journal_entries_operation_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3624 (class 2606 OID 41221)
-- Name: journal_entries_operation_lnk journal_entries_operation_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_operation_lnk
    ADD CONSTRAINT journal_entries_operation_links_unique UNIQUE (journal_entry_id, operation_id);


--
-- TOC entry 3628 (class 2606 OID 41223)
-- Name: journal_entries_operation_lnk journal_entries_operation_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_operation_lnk
    ADD CONSTRAINT journal_entries_operation_lnk_uq UNIQUE (journal_entry_id, operation_id);


--
-- TOC entry 3632 (class 2606 OID 41225)
-- Name: journal_entries_organization_lnk journal_entries_organization_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_organization_lnk
    ADD CONSTRAINT journal_entries_organization_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3634 (class 2606 OID 41227)
-- Name: journal_entries_organization_lnk journal_entries_organization_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_organization_lnk
    ADD CONSTRAINT journal_entries_organization_links_unique UNIQUE (journal_entry_id, organization_id);


--
-- TOC entry 3638 (class 2606 OID 41229)
-- Name: journal_entries_organization_lnk journal_entries_organization_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_organization_lnk
    ADD CONSTRAINT journal_entries_organization_lnk_uq UNIQUE (journal_entry_id, organization_id);


--
-- TOC entry 3617 (class 2606 OID 41231)
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 3647 (class 2606 OID 41233)
-- Name: map_layers_organization_lnk map_layers_organization_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_organization_lnk
    ADD CONSTRAINT map_layers_organization_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3649 (class 2606 OID 41235)
-- Name: map_layers_organization_lnk map_layers_organization_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_organization_lnk
    ADD CONSTRAINT map_layers_organization_links_unique UNIQUE (map_layer_id, organization_id);


--
-- TOC entry 3653 (class 2606 OID 41237)
-- Name: map_layers_organization_lnk map_layers_organization_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_organization_lnk
    ADD CONSTRAINT map_layers_organization_lnk_uq UNIQUE (map_layer_id, organization_id);


--
-- TOC entry 3642 (class 2606 OID 41239)
-- Name: map_layers map_layers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers
    ADD CONSTRAINT map_layers_pkey PRIMARY KEY (id);


--
-- TOC entry 3658 (class 2606 OID 41241)
-- Name: map_layers_wms_source_lnk map_layers_wms_source_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_wms_source_lnk
    ADD CONSTRAINT map_layers_wms_source_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3660 (class 2606 OID 41243)
-- Name: map_layers_wms_source_lnk map_layers_wms_source_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_wms_source_lnk
    ADD CONSTRAINT map_layers_wms_source_links_unique UNIQUE (map_layer_id, wms_source_id);


--
-- TOC entry 3665 (class 2606 OID 41245)
-- Name: map_layers_wms_source_lnk map_layers_wms_source_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_wms_source_lnk
    ADD CONSTRAINT map_layers_wms_source_lnk_uq UNIQUE (map_layer_id, wms_source_id);


--
-- TOC entry 3675 (class 2606 OID 41247)
-- Name: map_snapshots_operation_lnk map_snapshots_operation_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots_operation_lnk
    ADD CONSTRAINT map_snapshots_operation_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3677 (class 2606 OID 41249)
-- Name: map_snapshots_operation_lnk map_snapshots_operation_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots_operation_lnk
    ADD CONSTRAINT map_snapshots_operation_links_unique UNIQUE (map_snapshot_id, operation_id);


--
-- TOC entry 3682 (class 2606 OID 41251)
-- Name: map_snapshots_operation_lnk map_snapshots_operation_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots_operation_lnk
    ADD CONSTRAINT map_snapshots_operation_lnk_uq UNIQUE (map_snapshot_id, operation_id);


--
-- TOC entry 3669 (class 2606 OID 41253)
-- Name: map_snapshots map_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots
    ADD CONSTRAINT map_snapshots_pkey PRIMARY KEY (id);


--
-- TOC entry 3692 (class 2606 OID 41255)
-- Name: operations_organization_lnk operations_organization_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations_organization_lnk
    ADD CONSTRAINT operations_organization_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3694 (class 2606 OID 41257)
-- Name: operations_organization_lnk operations_organization_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations_organization_lnk
    ADD CONSTRAINT operations_organization_links_unique UNIQUE (operation_id, organization_id);


--
-- TOC entry 3699 (class 2606 OID 41259)
-- Name: operations_organization_lnk operations_organization_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations_organization_lnk
    ADD CONSTRAINT operations_organization_lnk_uq UNIQUE (operation_id, organization_id);


--
-- TOC entry 3686 (class 2606 OID 41261)
-- Name: operations operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT operations_pkey PRIMARY KEY (id);


--
-- TOC entry 3709 (class 2606 OID 41263)
-- Name: organizations_map_layer_favorites_lnk organizations_map_layer_favorites_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_map_layer_favorites_lnk
    ADD CONSTRAINT organizations_map_layer_favorites_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3711 (class 2606 OID 41265)
-- Name: organizations_map_layer_favorites_lnk organizations_map_layer_favorites_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_map_layer_favorites_lnk
    ADD CONSTRAINT organizations_map_layer_favorites_links_unique UNIQUE (organization_id, map_layer_id);


--
-- TOC entry 3716 (class 2606 OID 41267)
-- Name: organizations_map_layer_favorites_lnk organizations_map_layer_favorites_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_map_layer_favorites_lnk
    ADD CONSTRAINT organizations_map_layer_favorites_lnk_uq UNIQUE (organization_id, map_layer_id);


--
-- TOC entry 3703 (class 2606 OID 41269)
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- TOC entry 3721 (class 2606 OID 41271)
-- Name: organizations_wms_sources_lnk organizations_wms_sources_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_wms_sources_lnk
    ADD CONSTRAINT organizations_wms_sources_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3723 (class 2606 OID 41273)
-- Name: organizations_wms_sources_lnk organizations_wms_sources_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_wms_sources_lnk
    ADD CONSTRAINT organizations_wms_sources_links_unique UNIQUE (organization_id, wms_source_id);


--
-- TOC entry 3728 (class 2606 OID 41275)
-- Name: organizations_wms_sources_lnk organizations_wms_sources_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_wms_sources_lnk
    ADD CONSTRAINT organizations_wms_sources_lnk_uq UNIQUE (organization_id, wms_source_id);


--
-- TOC entry 3732 (class 2606 OID 41277)
-- Name: strapi_api_token_permissions strapi_api_token_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions
    ADD CONSTRAINT strapi_api_token_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 41279)
-- Name: strapi_api_token_permissions_token_lnk strapi_api_token_permissions_token_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions_token_lnk
    ADD CONSTRAINT strapi_api_token_permissions_token_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3740 (class 2606 OID 41281)
-- Name: strapi_api_token_permissions_token_lnk strapi_api_token_permissions_token_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions_token_lnk
    ADD CONSTRAINT strapi_api_token_permissions_token_links_unique UNIQUE (api_token_permission_id, api_token_id);


--
-- TOC entry 3745 (class 2606 OID 41283)
-- Name: strapi_api_token_permissions_token_lnk strapi_api_token_permissions_token_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions_token_lnk
    ADD CONSTRAINT strapi_api_token_permissions_token_lnk_uq UNIQUE (api_token_permission_id, api_token_id);


--
-- TOC entry 3749 (class 2606 OID 41285)
-- Name: strapi_api_tokens strapi_api_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_tokens
    ADD CONSTRAINT strapi_api_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3752 (class 2606 OID 41287)
-- Name: strapi_core_store_settings strapi_core_store_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_core_store_settings
    ADD CONSTRAINT strapi_core_store_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3754 (class 2606 OID 41289)
-- Name: strapi_database_schema strapi_database_schema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_database_schema
    ADD CONSTRAINT strapi_database_schema_pkey PRIMARY KEY (id);


--
-- TOC entry 3757 (class 2606 OID 41291)
-- Name: strapi_history_versions strapi_history_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_history_versions
    ADD CONSTRAINT strapi_history_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 3761 (class 2606 OID 41293)
-- Name: strapi_migrations_internal strapi_migrations_internal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_migrations_internal
    ADD CONSTRAINT strapi_migrations_internal_pkey PRIMARY KEY (id);


--
-- TOC entry 3759 (class 2606 OID 41295)
-- Name: strapi_migrations strapi_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_migrations
    ADD CONSTRAINT strapi_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3765 (class 2606 OID 41297)
-- Name: strapi_release_actions strapi_release_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions
    ADD CONSTRAINT strapi_release_actions_pkey PRIMARY KEY (id);


--
-- TOC entry 3771 (class 2606 OID 41299)
-- Name: strapi_release_actions_release_lnk strapi_release_actions_release_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions_release_lnk
    ADD CONSTRAINT strapi_release_actions_release_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3773 (class 2606 OID 41301)
-- Name: strapi_release_actions_release_lnk strapi_release_actions_release_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions_release_lnk
    ADD CONSTRAINT strapi_release_actions_release_links_unique UNIQUE (release_action_id, release_id);


--
-- TOC entry 3778 (class 2606 OID 41303)
-- Name: strapi_release_actions_release_lnk strapi_release_actions_release_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions_release_lnk
    ADD CONSTRAINT strapi_release_actions_release_lnk_uq UNIQUE (release_action_id, release_id);


--
-- TOC entry 3782 (class 2606 OID 41305)
-- Name: strapi_releases strapi_releases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_releases
    ADD CONSTRAINT strapi_releases_pkey PRIMARY KEY (id);


--
-- TOC entry 3787 (class 2606 OID 41307)
-- Name: strapi_transfer_token_permissions strapi_transfer_token_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions
    ADD CONSTRAINT strapi_transfer_token_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3793 (class 2606 OID 41309)
-- Name: strapi_transfer_token_permissions_token_lnk strapi_transfer_token_permissions_token_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions_token_lnk
    ADD CONSTRAINT strapi_transfer_token_permissions_token_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3795 (class 2606 OID 41311)
-- Name: strapi_transfer_token_permissions_token_lnk strapi_transfer_token_permissions_token_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions_token_lnk
    ADD CONSTRAINT strapi_transfer_token_permissions_token_links_unique UNIQUE (transfer_token_permission_id, transfer_token_id);


--
-- TOC entry 3800 (class 2606 OID 41313)
-- Name: strapi_transfer_token_permissions_token_lnk strapi_transfer_token_permissions_token_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions_token_lnk
    ADD CONSTRAINT strapi_transfer_token_permissions_token_lnk_uq UNIQUE (transfer_token_permission_id, transfer_token_id);


--
-- TOC entry 3804 (class 2606 OID 41315)
-- Name: strapi_transfer_tokens strapi_transfer_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_tokens
    ADD CONSTRAINT strapi_transfer_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3807 (class 2606 OID 41317)
-- Name: strapi_webhooks strapi_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_webhooks
    ADD CONSTRAINT strapi_webhooks_pkey PRIMARY KEY (id);


--
-- TOC entry 3811 (class 2606 OID 41319)
-- Name: strapi_workflows strapi_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows
    ADD CONSTRAINT strapi_workflows_pkey PRIMARY KEY (id);


--
-- TOC entry 3816 (class 2606 OID 41321)
-- Name: strapi_workflows_stage_required_to_publish_lnk strapi_workflows_stage_required_to_publish_lnk_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stage_required_to_publish_lnk
    ADD CONSTRAINT strapi_workflows_stage_required_to_publish_lnk_pkey PRIMARY KEY (id);


--
-- TOC entry 3818 (class 2606 OID 41323)
-- Name: strapi_workflows_stage_required_to_publish_lnk strapi_workflows_stage_required_to_publish_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stage_required_to_publish_lnk
    ADD CONSTRAINT strapi_workflows_stage_required_to_publish_lnk_uq UNIQUE (workflow_id, workflow_stage_id);


--
-- TOC entry 3828 (class 2606 OID 41325)
-- Name: strapi_workflows_stages_permissions_lnk strapi_workflows_stages_permissions_lnk_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages_permissions_lnk
    ADD CONSTRAINT strapi_workflows_stages_permissions_lnk_pkey PRIMARY KEY (id);


--
-- TOC entry 3830 (class 2606 OID 41327)
-- Name: strapi_workflows_stages_permissions_lnk strapi_workflows_stages_permissions_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages_permissions_lnk
    ADD CONSTRAINT strapi_workflows_stages_permissions_lnk_uq UNIQUE (workflow_stage_id, permission_id);


--
-- TOC entry 3822 (class 2606 OID 41329)
-- Name: strapi_workflows_stages strapi_workflows_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages
    ADD CONSTRAINT strapi_workflows_stages_pkey PRIMARY KEY (id);


--
-- TOC entry 3835 (class 2606 OID 41331)
-- Name: strapi_workflows_stages_workflow_lnk strapi_workflows_stages_workflow_lnk_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages_workflow_lnk
    ADD CONSTRAINT strapi_workflows_stages_workflow_lnk_pkey PRIMARY KEY (id);


--
-- TOC entry 3837 (class 2606 OID 41333)
-- Name: strapi_workflows_stages_workflow_lnk strapi_workflows_stages_workflow_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages_workflow_lnk
    ADD CONSTRAINT strapi_workflows_stages_workflow_lnk_uq UNIQUE (workflow_stage_id, workflow_id);


--
-- TOC entry 3841 (class 2606 OID 41335)
-- Name: up_permissions up_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions
    ADD CONSTRAINT up_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3847 (class 2606 OID 41337)
-- Name: up_permissions_role_lnk up_permissions_role_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions_role_lnk
    ADD CONSTRAINT up_permissions_role_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3849 (class 2606 OID 41339)
-- Name: up_permissions_role_lnk up_permissions_role_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions_role_lnk
    ADD CONSTRAINT up_permissions_role_links_unique UNIQUE (permission_id, role_id);


--
-- TOC entry 3854 (class 2606 OID 41341)
-- Name: up_permissions_role_lnk up_permissions_role_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions_role_lnk
    ADD CONSTRAINT up_permissions_role_lnk_uq UNIQUE (permission_id, role_id);


--
-- TOC entry 3858 (class 2606 OID 41343)
-- Name: up_roles up_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_roles
    ADD CONSTRAINT up_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3869 (class 2606 OID 41345)
-- Name: up_users_organization_lnk up_users_organization_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_organization_lnk
    ADD CONSTRAINT up_users_organization_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3871 (class 2606 OID 41347)
-- Name: up_users_organization_lnk up_users_organization_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_organization_lnk
    ADD CONSTRAINT up_users_organization_links_unique UNIQUE (user_id, organization_id);


--
-- TOC entry 3876 (class 2606 OID 41349)
-- Name: up_users_organization_lnk up_users_organization_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_organization_lnk
    ADD CONSTRAINT up_users_organization_lnk_uq UNIQUE (user_id, organization_id);


--
-- TOC entry 3863 (class 2606 OID 41351)
-- Name: up_users up_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users
    ADD CONSTRAINT up_users_pkey PRIMARY KEY (id);


--
-- TOC entry 3881 (class 2606 OID 41353)
-- Name: up_users_role_lnk up_users_role_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_role_lnk
    ADD CONSTRAINT up_users_role_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3883 (class 2606 OID 41355)
-- Name: up_users_role_lnk up_users_role_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_role_lnk
    ADD CONSTRAINT up_users_role_links_unique UNIQUE (user_id, role_id);


--
-- TOC entry 3888 (class 2606 OID 41357)
-- Name: up_users_role_lnk up_users_role_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_role_lnk
    ADD CONSTRAINT up_users_role_lnk_uq UNIQUE (user_id, role_id);


--
-- TOC entry 3902 (class 2606 OID 41359)
-- Name: upload_folders_parent_lnk upload_folders_parent_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders_parent_lnk
    ADD CONSTRAINT upload_folders_parent_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3904 (class 2606 OID 41361)
-- Name: upload_folders_parent_lnk upload_folders_parent_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders_parent_lnk
    ADD CONSTRAINT upload_folders_parent_links_unique UNIQUE (folder_id, inv_folder_id);


--
-- TOC entry 3909 (class 2606 OID 41363)
-- Name: upload_folders_parent_lnk upload_folders_parent_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders_parent_lnk
    ADD CONSTRAINT upload_folders_parent_lnk_uq UNIQUE (folder_id, inv_folder_id);


--
-- TOC entry 3892 (class 2606 OID 41365)
-- Name: upload_folders upload_folders_path_id_index; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders
    ADD CONSTRAINT upload_folders_path_id_index UNIQUE (path_id);


--
-- TOC entry 3894 (class 2606 OID 41367)
-- Name: upload_folders upload_folders_path_index; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders
    ADD CONSTRAINT upload_folders_path_index UNIQUE (path);


--
-- TOC entry 3896 (class 2606 OID 41369)
-- Name: upload_folders upload_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders
    ADD CONSTRAINT upload_folders_pkey PRIMARY KEY (id);


--
-- TOC entry 3918 (class 2606 OID 41371)
-- Name: wms_sources_organization_lnk wms_sources_organization_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources_organization_lnk
    ADD CONSTRAINT wms_sources_organization_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3920 (class 2606 OID 41373)
-- Name: wms_sources_organization_lnk wms_sources_organization_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources_organization_lnk
    ADD CONSTRAINT wms_sources_organization_links_unique UNIQUE (wms_source_id, organization_id);


--
-- TOC entry 3924 (class 2606 OID 41375)
-- Name: wms_sources_organization_lnk wms_sources_organization_lnk_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources_organization_lnk
    ADD CONSTRAINT wms_sources_organization_lnk_uq UNIQUE (wms_source_id, organization_id);


--
-- TOC entry 3913 (class 2606 OID 41377)
-- Name: wms_sources wms_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources
    ADD CONSTRAINT wms_sources_pkey PRIMARY KEY (id);


--
-- TOC entry 3522 (class 1259 OID 41378)
-- Name: accesses_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX accesses_created_by_id_fk ON public.accesses USING btree (created_by_id);


--
-- TOC entry 3523 (class 1259 OID 41379)
-- Name: accesses_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX accesses_documents_idx ON public.accesses USING btree (document_id, locale, published_at);


--
-- TOC entry 3527 (class 1259 OID 41380)
-- Name: accesses_operation_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX accesses_operation_links_fk ON public.accesses_operation_lnk USING btree (access_id);


--
-- TOC entry 3528 (class 1259 OID 41381)
-- Name: accesses_operation_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX accesses_operation_links_inv_fk ON public.accesses_operation_lnk USING btree (operation_id);


--
-- TOC entry 3533 (class 1259 OID 41382)
-- Name: accesses_operation_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX accesses_operation_lnk_fk ON public.accesses_operation_lnk USING btree (access_id);


--
-- TOC entry 3534 (class 1259 OID 41383)
-- Name: accesses_operation_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX accesses_operation_lnk_ifk ON public.accesses_operation_lnk USING btree (operation_id);


--
-- TOC entry 3526 (class 1259 OID 41384)
-- Name: accesses_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX accesses_updated_by_id_fk ON public.accesses USING btree (updated_by_id);


--
-- TOC entry 3537 (class 1259 OID 41385)
-- Name: admin_permissions_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_permissions_created_by_id_fk ON public.admin_permissions USING btree (created_by_id);


--
-- TOC entry 3538 (class 1259 OID 41386)
-- Name: admin_permissions_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_permissions_documents_idx ON public.admin_permissions USING btree (document_id, locale, published_at);


--
-- TOC entry 3542 (class 1259 OID 41387)
-- Name: admin_permissions_role_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_permissions_role_links_fk ON public.admin_permissions_role_lnk USING btree (permission_id);


--
-- TOC entry 3543 (class 1259 OID 41388)
-- Name: admin_permissions_role_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_permissions_role_links_inv_fk ON public.admin_permissions_role_lnk USING btree (role_id);


--
-- TOC entry 3544 (class 1259 OID 41389)
-- Name: admin_permissions_role_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_permissions_role_links_order_inv_fk ON public.admin_permissions_role_lnk USING btree (permission_ord);


--
-- TOC entry 3549 (class 1259 OID 41390)
-- Name: admin_permissions_role_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_permissions_role_lnk_fk ON public.admin_permissions_role_lnk USING btree (permission_id);


--
-- TOC entry 3550 (class 1259 OID 41391)
-- Name: admin_permissions_role_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_permissions_role_lnk_ifk ON public.admin_permissions_role_lnk USING btree (role_id);


--
-- TOC entry 3551 (class 1259 OID 41392)
-- Name: admin_permissions_role_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_permissions_role_lnk_oifk ON public.admin_permissions_role_lnk USING btree (permission_ord);


--
-- TOC entry 3541 (class 1259 OID 41393)
-- Name: admin_permissions_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_permissions_updated_by_id_fk ON public.admin_permissions USING btree (updated_by_id);


--
-- TOC entry 3554 (class 1259 OID 41394)
-- Name: admin_roles_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_roles_created_by_id_fk ON public.admin_roles USING btree (created_by_id);


--
-- TOC entry 3555 (class 1259 OID 41395)
-- Name: admin_roles_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_roles_documents_idx ON public.admin_roles USING btree (document_id, locale, published_at);


--
-- TOC entry 3558 (class 1259 OID 41396)
-- Name: admin_roles_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_roles_updated_by_id_fk ON public.admin_roles USING btree (updated_by_id);


--
-- TOC entry 3559 (class 1259 OID 41397)
-- Name: admin_users_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_created_by_id_fk ON public.admin_users USING btree (created_by_id);


--
-- TOC entry 3560 (class 1259 OID 41398)
-- Name: admin_users_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_documents_idx ON public.admin_users USING btree (document_id, locale, published_at);


--
-- TOC entry 3564 (class 1259 OID 41399)
-- Name: admin_users_roles_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_roles_links_fk ON public.admin_users_roles_lnk USING btree (user_id);


--
-- TOC entry 3565 (class 1259 OID 41400)
-- Name: admin_users_roles_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_roles_links_inv_fk ON public.admin_users_roles_lnk USING btree (role_id);


--
-- TOC entry 3566 (class 1259 OID 41401)
-- Name: admin_users_roles_links_order_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_roles_links_order_fk ON public.admin_users_roles_lnk USING btree (role_ord);


--
-- TOC entry 3567 (class 1259 OID 41402)
-- Name: admin_users_roles_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_roles_links_order_inv_fk ON public.admin_users_roles_lnk USING btree (user_ord);


--
-- TOC entry 3572 (class 1259 OID 41403)
-- Name: admin_users_roles_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_roles_lnk_fk ON public.admin_users_roles_lnk USING btree (user_id);


--
-- TOC entry 3573 (class 1259 OID 41404)
-- Name: admin_users_roles_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_roles_lnk_ifk ON public.admin_users_roles_lnk USING btree (role_id);


--
-- TOC entry 3574 (class 1259 OID 41405)
-- Name: admin_users_roles_lnk_ofk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_roles_lnk_ofk ON public.admin_users_roles_lnk USING btree (role_ord);


--
-- TOC entry 3575 (class 1259 OID 41406)
-- Name: admin_users_roles_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_roles_lnk_oifk ON public.admin_users_roles_lnk USING btree (user_ord);


--
-- TOC entry 3563 (class 1259 OID 41407)
-- Name: admin_users_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_updated_by_id_fk ON public.admin_users USING btree (updated_by_id);


--
-- TOC entry 3578 (class 1259 OID 41408)
-- Name: files_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_created_by_id_fk ON public.files USING btree (created_by_id);


--
-- TOC entry 3579 (class 1259 OID 41409)
-- Name: files_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_documents_idx ON public.files USING btree (document_id, locale, published_at);


--
-- TOC entry 3589 (class 1259 OID 41410)
-- Name: files_folder_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_folder_links_fk ON public.files_folder_lnk USING btree (file_id);


--
-- TOC entry 3590 (class 1259 OID 41411)
-- Name: files_folder_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_folder_links_inv_fk ON public.files_folder_lnk USING btree (folder_id);


--
-- TOC entry 3591 (class 1259 OID 41412)
-- Name: files_folder_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_folder_links_order_inv_fk ON public.files_folder_lnk USING btree (file_ord);


--
-- TOC entry 3596 (class 1259 OID 41413)
-- Name: files_folder_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_folder_lnk_fk ON public.files_folder_lnk USING btree (file_id);


--
-- TOC entry 3597 (class 1259 OID 41414)
-- Name: files_folder_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_folder_lnk_ifk ON public.files_folder_lnk USING btree (folder_id);


--
-- TOC entry 3598 (class 1259 OID 41415)
-- Name: files_folder_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_folder_lnk_oifk ON public.files_folder_lnk USING btree (file_ord);


--
-- TOC entry 3601 (class 1259 OID 41416)
-- Name: files_related_morphs_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_related_morphs_fk ON public.files_related_mph USING btree (file_id);


--
-- TOC entry 3602 (class 1259 OID 41417)
-- Name: files_related_morphs_id_column_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_related_morphs_id_column_index ON public.files_related_mph USING btree (related_id);


--
-- TOC entry 3603 (class 1259 OID 41418)
-- Name: files_related_morphs_order_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_related_morphs_order_index ON public.files_related_mph USING btree ("order");


--
-- TOC entry 3606 (class 1259 OID 41419)
-- Name: files_related_mph_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_related_mph_fk ON public.files_related_mph USING btree (file_id);


--
-- TOC entry 3607 (class 1259 OID 41420)
-- Name: files_related_mph_idix; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_related_mph_idix ON public.files_related_mph USING btree (related_id);


--
-- TOC entry 3608 (class 1259 OID 41421)
-- Name: files_related_mph_oidx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_related_mph_oidx ON public.files_related_mph USING btree ("order");


--
-- TOC entry 3582 (class 1259 OID 41422)
-- Name: files_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_updated_by_id_fk ON public.files USING btree (updated_by_id);


--
-- TOC entry 3609 (class 1259 OID 41423)
-- Name: i18n_locale_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i18n_locale_created_by_id_fk ON public.i18n_locale USING btree (created_by_id);


--
-- TOC entry 3610 (class 1259 OID 41424)
-- Name: i18n_locale_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i18n_locale_documents_idx ON public.i18n_locale USING btree (document_id, locale, published_at);


--
-- TOC entry 3613 (class 1259 OID 41425)
-- Name: i18n_locale_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i18n_locale_updated_by_id_fk ON public.i18n_locale USING btree (updated_by_id);


--
-- TOC entry 3614 (class 1259 OID 41426)
-- Name: journal_entries_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_entries_created_by_id_fk ON public.journal_entries USING btree (created_by_id);


--
-- TOC entry 3615 (class 1259 OID 41427)
-- Name: journal_entries_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_entries_documents_idx ON public.journal_entries USING btree (document_id, locale, published_at);


--
-- TOC entry 3619 (class 1259 OID 41428)
-- Name: journal_entries_operation_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_entries_operation_links_fk ON public.journal_entries_operation_lnk USING btree (journal_entry_id);


--
-- TOC entry 3620 (class 1259 OID 41429)
-- Name: journal_entries_operation_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_entries_operation_links_inv_fk ON public.journal_entries_operation_lnk USING btree (operation_id);


--
-- TOC entry 3625 (class 1259 OID 41430)
-- Name: journal_entries_operation_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_entries_operation_lnk_fk ON public.journal_entries_operation_lnk USING btree (journal_entry_id);


--
-- TOC entry 3626 (class 1259 OID 41431)
-- Name: journal_entries_operation_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_entries_operation_lnk_ifk ON public.journal_entries_operation_lnk USING btree (operation_id);


--
-- TOC entry 3629 (class 1259 OID 41432)
-- Name: journal_entries_organization_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_entries_organization_links_fk ON public.journal_entries_organization_lnk USING btree (journal_entry_id);


--
-- TOC entry 3630 (class 1259 OID 41433)
-- Name: journal_entries_organization_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_entries_organization_links_inv_fk ON public.journal_entries_organization_lnk USING btree (organization_id);


--
-- TOC entry 3635 (class 1259 OID 41434)
-- Name: journal_entries_organization_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_entries_organization_lnk_fk ON public.journal_entries_organization_lnk USING btree (journal_entry_id);


--
-- TOC entry 3636 (class 1259 OID 41435)
-- Name: journal_entries_organization_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_entries_organization_lnk_ifk ON public.journal_entries_organization_lnk USING btree (organization_id);


--
-- TOC entry 3618 (class 1259 OID 41436)
-- Name: journal_entries_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_entries_updated_by_id_fk ON public.journal_entries USING btree (updated_by_id);


--
-- TOC entry 3639 (class 1259 OID 41437)
-- Name: map_layers_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_created_by_id_fk ON public.map_layers USING btree (created_by_id);


--
-- TOC entry 3640 (class 1259 OID 41438)
-- Name: map_layers_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_documents_idx ON public.map_layers USING btree (document_id, locale, published_at);


--
-- TOC entry 3644 (class 1259 OID 41439)
-- Name: map_layers_organization_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_organization_links_fk ON public.map_layers_organization_lnk USING btree (map_layer_id);


--
-- TOC entry 3645 (class 1259 OID 41440)
-- Name: map_layers_organization_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_organization_links_inv_fk ON public.map_layers_organization_lnk USING btree (organization_id);


--
-- TOC entry 3650 (class 1259 OID 41441)
-- Name: map_layers_organization_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_organization_lnk_fk ON public.map_layers_organization_lnk USING btree (map_layer_id);


--
-- TOC entry 3651 (class 1259 OID 41442)
-- Name: map_layers_organization_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_organization_lnk_ifk ON public.map_layers_organization_lnk USING btree (organization_id);


--
-- TOC entry 3643 (class 1259 OID 41443)
-- Name: map_layers_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_updated_by_id_fk ON public.map_layers USING btree (updated_by_id);


--
-- TOC entry 3654 (class 1259 OID 41444)
-- Name: map_layers_wms_source_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_wms_source_links_fk ON public.map_layers_wms_source_lnk USING btree (map_layer_id);


--
-- TOC entry 3655 (class 1259 OID 41445)
-- Name: map_layers_wms_source_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_wms_source_links_inv_fk ON public.map_layers_wms_source_lnk USING btree (wms_source_id);


--
-- TOC entry 3656 (class 1259 OID 41446)
-- Name: map_layers_wms_source_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_wms_source_links_order_inv_fk ON public.map_layers_wms_source_lnk USING btree (map_layer_ord);


--
-- TOC entry 3661 (class 1259 OID 41447)
-- Name: map_layers_wms_source_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_wms_source_lnk_fk ON public.map_layers_wms_source_lnk USING btree (map_layer_id);


--
-- TOC entry 3662 (class 1259 OID 41448)
-- Name: map_layers_wms_source_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_wms_source_lnk_ifk ON public.map_layers_wms_source_lnk USING btree (wms_source_id);


--
-- TOC entry 3663 (class 1259 OID 41449)
-- Name: map_layers_wms_source_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_layers_wms_source_lnk_oifk ON public.map_layers_wms_source_lnk USING btree (map_layer_ord);


--
-- TOC entry 3666 (class 1259 OID 41450)
-- Name: map_snapshots_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_snapshots_created_by_id_fk ON public.map_snapshots USING btree (created_by_id);


--
-- TOC entry 3667 (class 1259 OID 41451)
-- Name: map_snapshots_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_snapshots_documents_idx ON public.map_snapshots USING btree (document_id, locale, published_at);


--
-- TOC entry 3671 (class 1259 OID 41452)
-- Name: map_snapshots_operation_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_snapshots_operation_links_fk ON public.map_snapshots_operation_lnk USING btree (map_snapshot_id);


--
-- TOC entry 3672 (class 1259 OID 41453)
-- Name: map_snapshots_operation_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_snapshots_operation_links_inv_fk ON public.map_snapshots_operation_lnk USING btree (operation_id);


--
-- TOC entry 3673 (class 1259 OID 41454)
-- Name: map_snapshots_operation_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_snapshots_operation_links_order_inv_fk ON public.map_snapshots_operation_lnk USING btree (map_snapshot_ord);


--
-- TOC entry 3678 (class 1259 OID 41455)
-- Name: map_snapshots_operation_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_snapshots_operation_lnk_fk ON public.map_snapshots_operation_lnk USING btree (map_snapshot_id);


--
-- TOC entry 3679 (class 1259 OID 41456)
-- Name: map_snapshots_operation_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_snapshots_operation_lnk_ifk ON public.map_snapshots_operation_lnk USING btree (operation_id);


--
-- TOC entry 3680 (class 1259 OID 41457)
-- Name: map_snapshots_operation_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_snapshots_operation_lnk_oifk ON public.map_snapshots_operation_lnk USING btree (map_snapshot_ord);


--
-- TOC entry 3670 (class 1259 OID 41458)
-- Name: map_snapshots_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX map_snapshots_updated_by_id_fk ON public.map_snapshots USING btree (updated_by_id);


--
-- TOC entry 3683 (class 1259 OID 41459)
-- Name: operations_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operations_created_by_id_fk ON public.operations USING btree (created_by_id);


--
-- TOC entry 3684 (class 1259 OID 41460)
-- Name: operations_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operations_documents_idx ON public.operations USING btree (document_id, locale, published_at);


--
-- TOC entry 3688 (class 1259 OID 41461)
-- Name: operations_organization_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operations_organization_links_fk ON public.operations_organization_lnk USING btree (operation_id);


--
-- TOC entry 3689 (class 1259 OID 41462)
-- Name: operations_organization_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operations_organization_links_inv_fk ON public.operations_organization_lnk USING btree (organization_id);


--
-- TOC entry 3690 (class 1259 OID 41463)
-- Name: operations_organization_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operations_organization_links_order_inv_fk ON public.operations_organization_lnk USING btree (operation_ord);


--
-- TOC entry 3695 (class 1259 OID 41464)
-- Name: operations_organization_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operations_organization_lnk_fk ON public.operations_organization_lnk USING btree (operation_id);


--
-- TOC entry 3696 (class 1259 OID 41465)
-- Name: operations_organization_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operations_organization_lnk_ifk ON public.operations_organization_lnk USING btree (organization_id);


--
-- TOC entry 3697 (class 1259 OID 41466)
-- Name: operations_organization_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operations_organization_lnk_oifk ON public.operations_organization_lnk USING btree (operation_ord);


--
-- TOC entry 3687 (class 1259 OID 41467)
-- Name: operations_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operations_updated_by_id_fk ON public.operations USING btree (updated_by_id);


--
-- TOC entry 3700 (class 1259 OID 41468)
-- Name: organizations_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_created_by_id_fk ON public.organizations USING btree (created_by_id);


--
-- TOC entry 3701 (class 1259 OID 41469)
-- Name: organizations_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_documents_idx ON public.organizations USING btree (document_id, locale, published_at);


--
-- TOC entry 3705 (class 1259 OID 41470)
-- Name: organizations_map_layer_favorites_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_map_layer_favorites_links_fk ON public.organizations_map_layer_favorites_lnk USING btree (organization_id);


--
-- TOC entry 3706 (class 1259 OID 41471)
-- Name: organizations_map_layer_favorites_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_map_layer_favorites_links_inv_fk ON public.organizations_map_layer_favorites_lnk USING btree (map_layer_id);


--
-- TOC entry 3707 (class 1259 OID 41472)
-- Name: organizations_map_layer_favorites_links_order_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_map_layer_favorites_links_order_fk ON public.organizations_map_layer_favorites_lnk USING btree (map_layer_ord);


--
-- TOC entry 3712 (class 1259 OID 41473)
-- Name: organizations_map_layer_favorites_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_map_layer_favorites_lnk_fk ON public.organizations_map_layer_favorites_lnk USING btree (organization_id);


--
-- TOC entry 3713 (class 1259 OID 41474)
-- Name: organizations_map_layer_favorites_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_map_layer_favorites_lnk_ifk ON public.organizations_map_layer_favorites_lnk USING btree (map_layer_id);


--
-- TOC entry 3714 (class 1259 OID 41475)
-- Name: organizations_map_layer_favorites_lnk_ofk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_map_layer_favorites_lnk_ofk ON public.organizations_map_layer_favorites_lnk USING btree (map_layer_ord);


--
-- TOC entry 3704 (class 1259 OID 41476)
-- Name: organizations_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_updated_by_id_fk ON public.organizations USING btree (updated_by_id);


--
-- TOC entry 3717 (class 1259 OID 41477)
-- Name: organizations_wms_sources_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_wms_sources_links_fk ON public.organizations_wms_sources_lnk USING btree (organization_id);


--
-- TOC entry 3718 (class 1259 OID 41478)
-- Name: organizations_wms_sources_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_wms_sources_links_inv_fk ON public.organizations_wms_sources_lnk USING btree (wms_source_id);


--
-- TOC entry 3719 (class 1259 OID 41479)
-- Name: organizations_wms_sources_links_order_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_wms_sources_links_order_fk ON public.organizations_wms_sources_lnk USING btree (wms_source_ord);


--
-- TOC entry 3724 (class 1259 OID 41480)
-- Name: organizations_wms_sources_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_wms_sources_lnk_fk ON public.organizations_wms_sources_lnk USING btree (organization_id);


--
-- TOC entry 3725 (class 1259 OID 41481)
-- Name: organizations_wms_sources_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_wms_sources_lnk_ifk ON public.organizations_wms_sources_lnk USING btree (wms_source_id);


--
-- TOC entry 3726 (class 1259 OID 41482)
-- Name: organizations_wms_sources_lnk_ofk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organizations_wms_sources_lnk_ofk ON public.organizations_wms_sources_lnk USING btree (wms_source_ord);


--
-- TOC entry 3729 (class 1259 OID 41483)
-- Name: strapi_api_token_permissions_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_token_permissions_created_by_id_fk ON public.strapi_api_token_permissions USING btree (created_by_id);


--
-- TOC entry 3730 (class 1259 OID 41484)
-- Name: strapi_api_token_permissions_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_token_permissions_documents_idx ON public.strapi_api_token_permissions USING btree (document_id, locale, published_at);


--
-- TOC entry 3734 (class 1259 OID 41485)
-- Name: strapi_api_token_permissions_token_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_token_permissions_token_links_fk ON public.strapi_api_token_permissions_token_lnk USING btree (api_token_permission_id);


--
-- TOC entry 3735 (class 1259 OID 41486)
-- Name: strapi_api_token_permissions_token_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_token_permissions_token_links_inv_fk ON public.strapi_api_token_permissions_token_lnk USING btree (api_token_id);


--
-- TOC entry 3736 (class 1259 OID 41487)
-- Name: strapi_api_token_permissions_token_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_token_permissions_token_links_order_inv_fk ON public.strapi_api_token_permissions_token_lnk USING btree (api_token_permission_ord);


--
-- TOC entry 3741 (class 1259 OID 41488)
-- Name: strapi_api_token_permissions_token_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_token_permissions_token_lnk_fk ON public.strapi_api_token_permissions_token_lnk USING btree (api_token_permission_id);


--
-- TOC entry 3742 (class 1259 OID 41489)
-- Name: strapi_api_token_permissions_token_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_token_permissions_token_lnk_ifk ON public.strapi_api_token_permissions_token_lnk USING btree (api_token_id);


--
-- TOC entry 3743 (class 1259 OID 41490)
-- Name: strapi_api_token_permissions_token_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_token_permissions_token_lnk_oifk ON public.strapi_api_token_permissions_token_lnk USING btree (api_token_permission_ord);


--
-- TOC entry 3733 (class 1259 OID 41491)
-- Name: strapi_api_token_permissions_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_token_permissions_updated_by_id_fk ON public.strapi_api_token_permissions USING btree (updated_by_id);


--
-- TOC entry 3746 (class 1259 OID 41492)
-- Name: strapi_api_tokens_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_tokens_created_by_id_fk ON public.strapi_api_tokens USING btree (created_by_id);


--
-- TOC entry 3747 (class 1259 OID 41493)
-- Name: strapi_api_tokens_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_tokens_documents_idx ON public.strapi_api_tokens USING btree (document_id, locale, published_at);


--
-- TOC entry 3750 (class 1259 OID 41494)
-- Name: strapi_api_tokens_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_api_tokens_updated_by_id_fk ON public.strapi_api_tokens USING btree (updated_by_id);


--
-- TOC entry 3755 (class 1259 OID 41495)
-- Name: strapi_history_versions_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_history_versions_created_by_id_fk ON public.strapi_history_versions USING btree (created_by_id);


--
-- TOC entry 3762 (class 1259 OID 41496)
-- Name: strapi_release_actions_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_release_actions_created_by_id_fk ON public.strapi_release_actions USING btree (created_by_id);


--
-- TOC entry 3763 (class 1259 OID 41497)
-- Name: strapi_release_actions_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_release_actions_documents_idx ON public.strapi_release_actions USING btree (document_id, locale, published_at);


--
-- TOC entry 3767 (class 1259 OID 41498)
-- Name: strapi_release_actions_release_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_release_actions_release_links_fk ON public.strapi_release_actions_release_lnk USING btree (release_action_id);


--
-- TOC entry 3768 (class 1259 OID 41499)
-- Name: strapi_release_actions_release_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_release_actions_release_links_inv_fk ON public.strapi_release_actions_release_lnk USING btree (release_id);


--
-- TOC entry 3769 (class 1259 OID 41500)
-- Name: strapi_release_actions_release_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_release_actions_release_links_order_inv_fk ON public.strapi_release_actions_release_lnk USING btree (release_action_ord);


--
-- TOC entry 3774 (class 1259 OID 41501)
-- Name: strapi_release_actions_release_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_release_actions_release_lnk_fk ON public.strapi_release_actions_release_lnk USING btree (release_action_id);


--
-- TOC entry 3775 (class 1259 OID 41502)
-- Name: strapi_release_actions_release_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_release_actions_release_lnk_ifk ON public.strapi_release_actions_release_lnk USING btree (release_id);


--
-- TOC entry 3776 (class 1259 OID 41503)
-- Name: strapi_release_actions_release_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_release_actions_release_lnk_oifk ON public.strapi_release_actions_release_lnk USING btree (release_action_ord);


--
-- TOC entry 3766 (class 1259 OID 41504)
-- Name: strapi_release_actions_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_release_actions_updated_by_id_fk ON public.strapi_release_actions USING btree (updated_by_id);


--
-- TOC entry 3779 (class 1259 OID 41505)
-- Name: strapi_releases_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_releases_created_by_id_fk ON public.strapi_releases USING btree (created_by_id);


--
-- TOC entry 3780 (class 1259 OID 41506)
-- Name: strapi_releases_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_releases_documents_idx ON public.strapi_releases USING btree (document_id, locale, published_at);


--
-- TOC entry 3783 (class 1259 OID 41507)
-- Name: strapi_releases_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_releases_updated_by_id_fk ON public.strapi_releases USING btree (updated_by_id);


--
-- TOC entry 3784 (class 1259 OID 41508)
-- Name: strapi_transfer_token_permissions_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_token_permissions_created_by_id_fk ON public.strapi_transfer_token_permissions USING btree (created_by_id);


--
-- TOC entry 3785 (class 1259 OID 41509)
-- Name: strapi_transfer_token_permissions_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_token_permissions_documents_idx ON public.strapi_transfer_token_permissions USING btree (document_id, locale, published_at);


--
-- TOC entry 3789 (class 1259 OID 41510)
-- Name: strapi_transfer_token_permissions_token_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_token_permissions_token_links_fk ON public.strapi_transfer_token_permissions_token_lnk USING btree (transfer_token_permission_id);


--
-- TOC entry 3790 (class 1259 OID 41511)
-- Name: strapi_transfer_token_permissions_token_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_token_permissions_token_links_inv_fk ON public.strapi_transfer_token_permissions_token_lnk USING btree (transfer_token_id);


--
-- TOC entry 3791 (class 1259 OID 41512)
-- Name: strapi_transfer_token_permissions_token_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_token_permissions_token_links_order_inv_fk ON public.strapi_transfer_token_permissions_token_lnk USING btree (transfer_token_permission_ord);


--
-- TOC entry 3796 (class 1259 OID 41513)
-- Name: strapi_transfer_token_permissions_token_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_token_permissions_token_lnk_fk ON public.strapi_transfer_token_permissions_token_lnk USING btree (transfer_token_permission_id);


--
-- TOC entry 3797 (class 1259 OID 41514)
-- Name: strapi_transfer_token_permissions_token_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_token_permissions_token_lnk_ifk ON public.strapi_transfer_token_permissions_token_lnk USING btree (transfer_token_id);


--
-- TOC entry 3798 (class 1259 OID 41515)
-- Name: strapi_transfer_token_permissions_token_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_token_permissions_token_lnk_oifk ON public.strapi_transfer_token_permissions_token_lnk USING btree (transfer_token_permission_ord);


--
-- TOC entry 3788 (class 1259 OID 41516)
-- Name: strapi_transfer_token_permissions_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_token_permissions_updated_by_id_fk ON public.strapi_transfer_token_permissions USING btree (updated_by_id);


--
-- TOC entry 3801 (class 1259 OID 41517)
-- Name: strapi_transfer_tokens_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_tokens_created_by_id_fk ON public.strapi_transfer_tokens USING btree (created_by_id);


--
-- TOC entry 3802 (class 1259 OID 41518)
-- Name: strapi_transfer_tokens_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_tokens_documents_idx ON public.strapi_transfer_tokens USING btree (document_id, locale, published_at);


--
-- TOC entry 3805 (class 1259 OID 41519)
-- Name: strapi_transfer_tokens_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_transfer_tokens_updated_by_id_fk ON public.strapi_transfer_tokens USING btree (updated_by_id);


--
-- TOC entry 3808 (class 1259 OID 41520)
-- Name: strapi_workflows_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_created_by_id_fk ON public.strapi_workflows USING btree (created_by_id);


--
-- TOC entry 3809 (class 1259 OID 41521)
-- Name: strapi_workflows_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_documents_idx ON public.strapi_workflows USING btree (document_id, locale, published_at);


--
-- TOC entry 3813 (class 1259 OID 41522)
-- Name: strapi_workflows_stage_required_to_publish_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_stage_required_to_publish_lnk_fk ON public.strapi_workflows_stage_required_to_publish_lnk USING btree (workflow_id);


--
-- TOC entry 3814 (class 1259 OID 41523)
-- Name: strapi_workflows_stage_required_to_publish_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_stage_required_to_publish_lnk_ifk ON public.strapi_workflows_stage_required_to_publish_lnk USING btree (workflow_stage_id);


--
-- TOC entry 3819 (class 1259 OID 41524)
-- Name: strapi_workflows_stages_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_stages_created_by_id_fk ON public.strapi_workflows_stages USING btree (created_by_id);


--
-- TOC entry 3820 (class 1259 OID 41525)
-- Name: strapi_workflows_stages_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_stages_documents_idx ON public.strapi_workflows_stages USING btree (document_id, locale, published_at);


--
-- TOC entry 3824 (class 1259 OID 41526)
-- Name: strapi_workflows_stages_permissions_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_stages_permissions_lnk_fk ON public.strapi_workflows_stages_permissions_lnk USING btree (workflow_stage_id);


--
-- TOC entry 3825 (class 1259 OID 41527)
-- Name: strapi_workflows_stages_permissions_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_stages_permissions_lnk_ifk ON public.strapi_workflows_stages_permissions_lnk USING btree (permission_id);


--
-- TOC entry 3826 (class 1259 OID 41528)
-- Name: strapi_workflows_stages_permissions_lnk_ofk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_stages_permissions_lnk_ofk ON public.strapi_workflows_stages_permissions_lnk USING btree (permission_ord);


--
-- TOC entry 3823 (class 1259 OID 41529)
-- Name: strapi_workflows_stages_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_stages_updated_by_id_fk ON public.strapi_workflows_stages USING btree (updated_by_id);


--
-- TOC entry 3831 (class 1259 OID 41530)
-- Name: strapi_workflows_stages_workflow_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_stages_workflow_lnk_fk ON public.strapi_workflows_stages_workflow_lnk USING btree (workflow_stage_id);


--
-- TOC entry 3832 (class 1259 OID 41531)
-- Name: strapi_workflows_stages_workflow_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_stages_workflow_lnk_ifk ON public.strapi_workflows_stages_workflow_lnk USING btree (workflow_id);


--
-- TOC entry 3833 (class 1259 OID 41532)
-- Name: strapi_workflows_stages_workflow_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_stages_workflow_lnk_oifk ON public.strapi_workflows_stages_workflow_lnk USING btree (workflow_stage_ord);


--
-- TOC entry 3812 (class 1259 OID 41533)
-- Name: strapi_workflows_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX strapi_workflows_updated_by_id_fk ON public.strapi_workflows USING btree (updated_by_id);


--
-- TOC entry 3838 (class 1259 OID 41534)
-- Name: up_permissions_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_permissions_created_by_id_fk ON public.up_permissions USING btree (created_by_id);


--
-- TOC entry 3839 (class 1259 OID 41535)
-- Name: up_permissions_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_permissions_documents_idx ON public.up_permissions USING btree (document_id, locale, published_at);


--
-- TOC entry 3843 (class 1259 OID 41536)
-- Name: up_permissions_role_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_permissions_role_links_fk ON public.up_permissions_role_lnk USING btree (permission_id);


--
-- TOC entry 3844 (class 1259 OID 41537)
-- Name: up_permissions_role_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_permissions_role_links_inv_fk ON public.up_permissions_role_lnk USING btree (role_id);


--
-- TOC entry 3845 (class 1259 OID 41538)
-- Name: up_permissions_role_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_permissions_role_links_order_inv_fk ON public.up_permissions_role_lnk USING btree (permission_ord);


--
-- TOC entry 3850 (class 1259 OID 41539)
-- Name: up_permissions_role_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_permissions_role_lnk_fk ON public.up_permissions_role_lnk USING btree (permission_id);


--
-- TOC entry 3851 (class 1259 OID 41540)
-- Name: up_permissions_role_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_permissions_role_lnk_ifk ON public.up_permissions_role_lnk USING btree (role_id);


--
-- TOC entry 3852 (class 1259 OID 41541)
-- Name: up_permissions_role_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_permissions_role_lnk_oifk ON public.up_permissions_role_lnk USING btree (permission_ord);


--
-- TOC entry 3842 (class 1259 OID 41542)
-- Name: up_permissions_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_permissions_updated_by_id_fk ON public.up_permissions USING btree (updated_by_id);


--
-- TOC entry 3855 (class 1259 OID 41543)
-- Name: up_roles_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_roles_created_by_id_fk ON public.up_roles USING btree (created_by_id);


--
-- TOC entry 3856 (class 1259 OID 41544)
-- Name: up_roles_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_roles_documents_idx ON public.up_roles USING btree (document_id, locale, published_at);


--
-- TOC entry 3859 (class 1259 OID 41545)
-- Name: up_roles_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_roles_updated_by_id_fk ON public.up_roles USING btree (updated_by_id);


--
-- TOC entry 3860 (class 1259 OID 41546)
-- Name: up_users_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_created_by_id_fk ON public.up_users USING btree (created_by_id);


--
-- TOC entry 3861 (class 1259 OID 41547)
-- Name: up_users_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_documents_idx ON public.up_users USING btree (document_id, locale, published_at);


--
-- TOC entry 3865 (class 1259 OID 41548)
-- Name: up_users_organization_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_organization_links_fk ON public.up_users_organization_lnk USING btree (user_id);


--
-- TOC entry 3866 (class 1259 OID 41549)
-- Name: up_users_organization_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_organization_links_inv_fk ON public.up_users_organization_lnk USING btree (organization_id);


--
-- TOC entry 3867 (class 1259 OID 41550)
-- Name: up_users_organization_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_organization_links_order_inv_fk ON public.up_users_organization_lnk USING btree (user_ord);


--
-- TOC entry 3872 (class 1259 OID 41551)
-- Name: up_users_organization_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_organization_lnk_fk ON public.up_users_organization_lnk USING btree (user_id);


--
-- TOC entry 3873 (class 1259 OID 41552)
-- Name: up_users_organization_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_organization_lnk_ifk ON public.up_users_organization_lnk USING btree (organization_id);


--
-- TOC entry 3874 (class 1259 OID 41553)
-- Name: up_users_organization_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_organization_lnk_oifk ON public.up_users_organization_lnk USING btree (user_ord);


--
-- TOC entry 3877 (class 1259 OID 41554)
-- Name: up_users_role_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_role_links_fk ON public.up_users_role_lnk USING btree (user_id);


--
-- TOC entry 3878 (class 1259 OID 41555)
-- Name: up_users_role_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_role_links_inv_fk ON public.up_users_role_lnk USING btree (role_id);


--
-- TOC entry 3879 (class 1259 OID 41556)
-- Name: up_users_role_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_role_links_order_inv_fk ON public.up_users_role_lnk USING btree (user_ord);


--
-- TOC entry 3884 (class 1259 OID 41557)
-- Name: up_users_role_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_role_lnk_fk ON public.up_users_role_lnk USING btree (user_id);


--
-- TOC entry 3885 (class 1259 OID 41558)
-- Name: up_users_role_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_role_lnk_ifk ON public.up_users_role_lnk USING btree (role_id);


--
-- TOC entry 3886 (class 1259 OID 41559)
-- Name: up_users_role_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_role_lnk_oifk ON public.up_users_role_lnk USING btree (user_ord);


--
-- TOC entry 3864 (class 1259 OID 41560)
-- Name: up_users_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX up_users_updated_by_id_fk ON public.up_users USING btree (updated_by_id);


--
-- TOC entry 3583 (class 1259 OID 41561)
-- Name: upload_files_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_files_created_at_index ON public.files USING btree (created_at);


--
-- TOC entry 3584 (class 1259 OID 41562)
-- Name: upload_files_ext_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_files_ext_index ON public.files USING btree (ext);


--
-- TOC entry 3585 (class 1259 OID 41563)
-- Name: upload_files_folder_path_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_files_folder_path_index ON public.files USING btree (folder_path);


--
-- TOC entry 3586 (class 1259 OID 41564)
-- Name: upload_files_name_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_files_name_index ON public.files USING btree (name);


--
-- TOC entry 3587 (class 1259 OID 41565)
-- Name: upload_files_size_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_files_size_index ON public.files USING btree (size);


--
-- TOC entry 3588 (class 1259 OID 41566)
-- Name: upload_files_updated_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_files_updated_at_index ON public.files USING btree (updated_at);


--
-- TOC entry 3889 (class 1259 OID 41567)
-- Name: upload_folders_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_folders_created_by_id_fk ON public.upload_folders USING btree (created_by_id);


--
-- TOC entry 3890 (class 1259 OID 41568)
-- Name: upload_folders_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_folders_documents_idx ON public.upload_folders USING btree (document_id, locale, published_at);


--
-- TOC entry 3898 (class 1259 OID 41569)
-- Name: upload_folders_parent_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_folders_parent_links_fk ON public.upload_folders_parent_lnk USING btree (folder_id);


--
-- TOC entry 3899 (class 1259 OID 41570)
-- Name: upload_folders_parent_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_folders_parent_links_inv_fk ON public.upload_folders_parent_lnk USING btree (inv_folder_id);


--
-- TOC entry 3900 (class 1259 OID 41571)
-- Name: upload_folders_parent_links_order_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_folders_parent_links_order_inv_fk ON public.upload_folders_parent_lnk USING btree (folder_ord);


--
-- TOC entry 3905 (class 1259 OID 41572)
-- Name: upload_folders_parent_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_folders_parent_lnk_fk ON public.upload_folders_parent_lnk USING btree (folder_id);


--
-- TOC entry 3906 (class 1259 OID 41573)
-- Name: upload_folders_parent_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_folders_parent_lnk_ifk ON public.upload_folders_parent_lnk USING btree (inv_folder_id);


--
-- TOC entry 3907 (class 1259 OID 41574)
-- Name: upload_folders_parent_lnk_oifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_folders_parent_lnk_oifk ON public.upload_folders_parent_lnk USING btree (folder_ord);


--
-- TOC entry 3897 (class 1259 OID 41575)
-- Name: upload_folders_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_folders_updated_by_id_fk ON public.upload_folders USING btree (updated_by_id);


--
-- TOC entry 3910 (class 1259 OID 41576)
-- Name: wms_sources_created_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wms_sources_created_by_id_fk ON public.wms_sources USING btree (created_by_id);


--
-- TOC entry 3911 (class 1259 OID 41577)
-- Name: wms_sources_documents_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wms_sources_documents_idx ON public.wms_sources USING btree (document_id, locale, published_at);


--
-- TOC entry 3915 (class 1259 OID 41578)
-- Name: wms_sources_organization_links_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wms_sources_organization_links_fk ON public.wms_sources_organization_lnk USING btree (wms_source_id);


--
-- TOC entry 3916 (class 1259 OID 41579)
-- Name: wms_sources_organization_links_inv_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wms_sources_organization_links_inv_fk ON public.wms_sources_organization_lnk USING btree (organization_id);


--
-- TOC entry 3921 (class 1259 OID 41580)
-- Name: wms_sources_organization_lnk_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wms_sources_organization_lnk_fk ON public.wms_sources_organization_lnk USING btree (wms_source_id);


--
-- TOC entry 3922 (class 1259 OID 41581)
-- Name: wms_sources_organization_lnk_ifk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wms_sources_organization_lnk_ifk ON public.wms_sources_organization_lnk USING btree (organization_id);


--
-- TOC entry 3914 (class 1259 OID 41582)
-- Name: wms_sources_updated_by_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wms_sources_updated_by_id_fk ON public.wms_sources USING btree (updated_by_id);


--
-- TOC entry 3925 (class 2606 OID 41583)
-- Name: accesses accesses_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses
    ADD CONSTRAINT accesses_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3927 (class 2606 OID 41588)
-- Name: accesses_operation_lnk accesses_operation_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses_operation_lnk
    ADD CONSTRAINT accesses_operation_links_fk FOREIGN KEY (access_id) REFERENCES public.accesses(id) ON DELETE CASCADE;


--
-- TOC entry 3928 (class 2606 OID 41593)
-- Name: accesses_operation_lnk accesses_operation_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses_operation_lnk
    ADD CONSTRAINT accesses_operation_links_inv_fk FOREIGN KEY (operation_id) REFERENCES public.operations(id) ON DELETE CASCADE;


--
-- TOC entry 3929 (class 2606 OID 41598)
-- Name: accesses_operation_lnk accesses_operation_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses_operation_lnk
    ADD CONSTRAINT accesses_operation_lnk_fk FOREIGN KEY (access_id) REFERENCES public.accesses(id) ON DELETE CASCADE;


--
-- TOC entry 3930 (class 2606 OID 41603)
-- Name: accesses_operation_lnk accesses_operation_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses_operation_lnk
    ADD CONSTRAINT accesses_operation_lnk_ifk FOREIGN KEY (operation_id) REFERENCES public.operations(id) ON DELETE CASCADE;


--
-- TOC entry 3926 (class 2606 OID 41608)
-- Name: accesses accesses_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesses
    ADD CONSTRAINT accesses_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3931 (class 2606 OID 41613)
-- Name: admin_permissions admin_permissions_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3933 (class 2606 OID 41618)
-- Name: admin_permissions_role_lnk admin_permissions_role_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions_role_lnk
    ADD CONSTRAINT admin_permissions_role_links_fk FOREIGN KEY (permission_id) REFERENCES public.admin_permissions(id) ON DELETE CASCADE;


--
-- TOC entry 3934 (class 2606 OID 41623)
-- Name: admin_permissions_role_lnk admin_permissions_role_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions_role_lnk
    ADD CONSTRAINT admin_permissions_role_links_inv_fk FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON DELETE CASCADE;


--
-- TOC entry 3935 (class 2606 OID 41628)
-- Name: admin_permissions_role_lnk admin_permissions_role_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions_role_lnk
    ADD CONSTRAINT admin_permissions_role_lnk_fk FOREIGN KEY (permission_id) REFERENCES public.admin_permissions(id) ON DELETE CASCADE;


--
-- TOC entry 3936 (class 2606 OID 41633)
-- Name: admin_permissions_role_lnk admin_permissions_role_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions_role_lnk
    ADD CONSTRAINT admin_permissions_role_lnk_ifk FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON DELETE CASCADE;


--
-- TOC entry 3932 (class 2606 OID 41638)
-- Name: admin_permissions admin_permissions_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3937 (class 2606 OID 41643)
-- Name: admin_roles admin_roles_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3938 (class 2606 OID 41648)
-- Name: admin_roles admin_roles_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3939 (class 2606 OID 41653)
-- Name: admin_users admin_users_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3941 (class 2606 OID 41658)
-- Name: admin_users_roles_lnk admin_users_roles_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users_roles_lnk
    ADD CONSTRAINT admin_users_roles_links_fk FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE;


--
-- TOC entry 3942 (class 2606 OID 41663)
-- Name: admin_users_roles_lnk admin_users_roles_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users_roles_lnk
    ADD CONSTRAINT admin_users_roles_links_inv_fk FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON DELETE CASCADE;


--
-- TOC entry 3943 (class 2606 OID 41668)
-- Name: admin_users_roles_lnk admin_users_roles_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users_roles_lnk
    ADD CONSTRAINT admin_users_roles_lnk_fk FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE;


--
-- TOC entry 3944 (class 2606 OID 41673)
-- Name: admin_users_roles_lnk admin_users_roles_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users_roles_lnk
    ADD CONSTRAINT admin_users_roles_lnk_ifk FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON DELETE CASCADE;


--
-- TOC entry 3940 (class 2606 OID 41678)
-- Name: admin_users admin_users_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3945 (class 2606 OID 41683)
-- Name: files files_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3947 (class 2606 OID 41688)
-- Name: files_folder_lnk files_folder_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_folder_lnk
    ADD CONSTRAINT files_folder_links_fk FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;


--
-- TOC entry 3948 (class 2606 OID 41693)
-- Name: files_folder_lnk files_folder_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_folder_lnk
    ADD CONSTRAINT files_folder_links_inv_fk FOREIGN KEY (folder_id) REFERENCES public.upload_folders(id) ON DELETE CASCADE;


--
-- TOC entry 3949 (class 2606 OID 41698)
-- Name: files_folder_lnk files_folder_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_folder_lnk
    ADD CONSTRAINT files_folder_lnk_fk FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;


--
-- TOC entry 3950 (class 2606 OID 41703)
-- Name: files_folder_lnk files_folder_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_folder_lnk
    ADD CONSTRAINT files_folder_lnk_ifk FOREIGN KEY (folder_id) REFERENCES public.upload_folders(id) ON DELETE CASCADE;


--
-- TOC entry 3951 (class 2606 OID 41708)
-- Name: files_related_mph files_related_morphs_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_related_mph
    ADD CONSTRAINT files_related_morphs_fk FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;


--
-- TOC entry 3952 (class 2606 OID 41713)
-- Name: files_related_mph files_related_mph_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_related_mph
    ADD CONSTRAINT files_related_mph_fk FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;


--
-- TOC entry 3946 (class 2606 OID 41718)
-- Name: files files_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3953 (class 2606 OID 41723)
-- Name: i18n_locale i18n_locale_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.i18n_locale
    ADD CONSTRAINT i18n_locale_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3954 (class 2606 OID 41728)
-- Name: i18n_locale i18n_locale_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.i18n_locale
    ADD CONSTRAINT i18n_locale_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3955 (class 2606 OID 41733)
-- Name: journal_entries journal_entries_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3957 (class 2606 OID 41738)
-- Name: journal_entries_operation_lnk journal_entries_operation_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_operation_lnk
    ADD CONSTRAINT journal_entries_operation_links_fk FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- TOC entry 3958 (class 2606 OID 41743)
-- Name: journal_entries_operation_lnk journal_entries_operation_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_operation_lnk
    ADD CONSTRAINT journal_entries_operation_links_inv_fk FOREIGN KEY (operation_id) REFERENCES public.operations(id) ON DELETE CASCADE;


--
-- TOC entry 3959 (class 2606 OID 41748)
-- Name: journal_entries_operation_lnk journal_entries_operation_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_operation_lnk
    ADD CONSTRAINT journal_entries_operation_lnk_fk FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- TOC entry 3960 (class 2606 OID 41753)
-- Name: journal_entries_operation_lnk journal_entries_operation_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_operation_lnk
    ADD CONSTRAINT journal_entries_operation_lnk_ifk FOREIGN KEY (operation_id) REFERENCES public.operations(id) ON DELETE CASCADE;


--
-- TOC entry 3961 (class 2606 OID 41758)
-- Name: journal_entries_organization_lnk journal_entries_organization_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_organization_lnk
    ADD CONSTRAINT journal_entries_organization_links_fk FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- TOC entry 3962 (class 2606 OID 41763)
-- Name: journal_entries_organization_lnk journal_entries_organization_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_organization_lnk
    ADD CONSTRAINT journal_entries_organization_links_inv_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 3963 (class 2606 OID 41768)
-- Name: journal_entries_organization_lnk journal_entries_organization_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_organization_lnk
    ADD CONSTRAINT journal_entries_organization_lnk_fk FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- TOC entry 3964 (class 2606 OID 41773)
-- Name: journal_entries_organization_lnk journal_entries_organization_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries_organization_lnk
    ADD CONSTRAINT journal_entries_organization_lnk_ifk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 3956 (class 2606 OID 41778)
-- Name: journal_entries journal_entries_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3965 (class 2606 OID 41783)
-- Name: map_layers map_layers_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers
    ADD CONSTRAINT map_layers_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3967 (class 2606 OID 41788)
-- Name: map_layers_organization_lnk map_layers_organization_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_organization_lnk
    ADD CONSTRAINT map_layers_organization_links_fk FOREIGN KEY (map_layer_id) REFERENCES public.map_layers(id) ON DELETE CASCADE;


--
-- TOC entry 3968 (class 2606 OID 41793)
-- Name: map_layers_organization_lnk map_layers_organization_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_organization_lnk
    ADD CONSTRAINT map_layers_organization_links_inv_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 3969 (class 2606 OID 41798)
-- Name: map_layers_organization_lnk map_layers_organization_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_organization_lnk
    ADD CONSTRAINT map_layers_organization_lnk_fk FOREIGN KEY (map_layer_id) REFERENCES public.map_layers(id) ON DELETE CASCADE;


--
-- TOC entry 3970 (class 2606 OID 41803)
-- Name: map_layers_organization_lnk map_layers_organization_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_organization_lnk
    ADD CONSTRAINT map_layers_organization_lnk_ifk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 3966 (class 2606 OID 41808)
-- Name: map_layers map_layers_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers
    ADD CONSTRAINT map_layers_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3971 (class 2606 OID 41813)
-- Name: map_layers_wms_source_lnk map_layers_wms_source_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_wms_source_lnk
    ADD CONSTRAINT map_layers_wms_source_links_fk FOREIGN KEY (map_layer_id) REFERENCES public.map_layers(id) ON DELETE CASCADE;


--
-- TOC entry 3972 (class 2606 OID 41818)
-- Name: map_layers_wms_source_lnk map_layers_wms_source_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_wms_source_lnk
    ADD CONSTRAINT map_layers_wms_source_links_inv_fk FOREIGN KEY (wms_source_id) REFERENCES public.wms_sources(id) ON DELETE CASCADE;


--
-- TOC entry 3973 (class 2606 OID 41823)
-- Name: map_layers_wms_source_lnk map_layers_wms_source_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_wms_source_lnk
    ADD CONSTRAINT map_layers_wms_source_lnk_fk FOREIGN KEY (map_layer_id) REFERENCES public.map_layers(id) ON DELETE CASCADE;


--
-- TOC entry 3974 (class 2606 OID 41828)
-- Name: map_layers_wms_source_lnk map_layers_wms_source_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers_wms_source_lnk
    ADD CONSTRAINT map_layers_wms_source_lnk_ifk FOREIGN KEY (wms_source_id) REFERENCES public.wms_sources(id) ON DELETE CASCADE;


--
-- TOC entry 3975 (class 2606 OID 41833)
-- Name: map_snapshots map_snapshots_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots
    ADD CONSTRAINT map_snapshots_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3977 (class 2606 OID 41838)
-- Name: map_snapshots_operation_lnk map_snapshots_operation_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots_operation_lnk
    ADD CONSTRAINT map_snapshots_operation_links_fk FOREIGN KEY (map_snapshot_id) REFERENCES public.map_snapshots(id) ON DELETE CASCADE;


--
-- TOC entry 3978 (class 2606 OID 41843)
-- Name: map_snapshots_operation_lnk map_snapshots_operation_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots_operation_lnk
    ADD CONSTRAINT map_snapshots_operation_links_inv_fk FOREIGN KEY (operation_id) REFERENCES public.operations(id) ON DELETE CASCADE;


--
-- TOC entry 3979 (class 2606 OID 41848)
-- Name: map_snapshots_operation_lnk map_snapshots_operation_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots_operation_lnk
    ADD CONSTRAINT map_snapshots_operation_lnk_fk FOREIGN KEY (map_snapshot_id) REFERENCES public.map_snapshots(id) ON DELETE CASCADE;


--
-- TOC entry 3980 (class 2606 OID 41853)
-- Name: map_snapshots_operation_lnk map_snapshots_operation_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots_operation_lnk
    ADD CONSTRAINT map_snapshots_operation_lnk_ifk FOREIGN KEY (operation_id) REFERENCES public.operations(id) ON DELETE CASCADE;


--
-- TOC entry 3976 (class 2606 OID 41858)
-- Name: map_snapshots map_snapshots_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_snapshots
    ADD CONSTRAINT map_snapshots_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3981 (class 2606 OID 41863)
-- Name: operations operations_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT operations_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3983 (class 2606 OID 41868)
-- Name: operations_organization_lnk operations_organization_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations_organization_lnk
    ADD CONSTRAINT operations_organization_links_fk FOREIGN KEY (operation_id) REFERENCES public.operations(id) ON DELETE CASCADE;


--
-- TOC entry 3984 (class 2606 OID 41873)
-- Name: operations_organization_lnk operations_organization_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations_organization_lnk
    ADD CONSTRAINT operations_organization_links_inv_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 3985 (class 2606 OID 41878)
-- Name: operations_organization_lnk operations_organization_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations_organization_lnk
    ADD CONSTRAINT operations_organization_lnk_fk FOREIGN KEY (operation_id) REFERENCES public.operations(id) ON DELETE CASCADE;


--
-- TOC entry 3986 (class 2606 OID 41883)
-- Name: operations_organization_lnk operations_organization_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations_organization_lnk
    ADD CONSTRAINT operations_organization_lnk_ifk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 3982 (class 2606 OID 41888)
-- Name: operations operations_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT operations_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3987 (class 2606 OID 41893)
-- Name: organizations organizations_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3989 (class 2606 OID 41898)
-- Name: organizations_map_layer_favorites_lnk organizations_map_layer_favorites_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_map_layer_favorites_lnk
    ADD CONSTRAINT organizations_map_layer_favorites_links_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 3990 (class 2606 OID 41903)
-- Name: organizations_map_layer_favorites_lnk organizations_map_layer_favorites_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_map_layer_favorites_lnk
    ADD CONSTRAINT organizations_map_layer_favorites_links_inv_fk FOREIGN KEY (map_layer_id) REFERENCES public.map_layers(id) ON DELETE CASCADE;


--
-- TOC entry 3991 (class 2606 OID 41908)
-- Name: organizations_map_layer_favorites_lnk organizations_map_layer_favorites_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_map_layer_favorites_lnk
    ADD CONSTRAINT organizations_map_layer_favorites_lnk_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 3992 (class 2606 OID 41913)
-- Name: organizations_map_layer_favorites_lnk organizations_map_layer_favorites_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_map_layer_favorites_lnk
    ADD CONSTRAINT organizations_map_layer_favorites_lnk_ifk FOREIGN KEY (map_layer_id) REFERENCES public.map_layers(id) ON DELETE CASCADE;


--
-- TOC entry 3988 (class 2606 OID 41918)
-- Name: organizations organizations_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3993 (class 2606 OID 41923)
-- Name: organizations_wms_sources_lnk organizations_wms_sources_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_wms_sources_lnk
    ADD CONSTRAINT organizations_wms_sources_links_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 3994 (class 2606 OID 41928)
-- Name: organizations_wms_sources_lnk organizations_wms_sources_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_wms_sources_lnk
    ADD CONSTRAINT organizations_wms_sources_links_inv_fk FOREIGN KEY (wms_source_id) REFERENCES public.wms_sources(id) ON DELETE CASCADE;


--
-- TOC entry 3995 (class 2606 OID 41933)
-- Name: organizations_wms_sources_lnk organizations_wms_sources_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_wms_sources_lnk
    ADD CONSTRAINT organizations_wms_sources_lnk_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 3996 (class 2606 OID 41938)
-- Name: organizations_wms_sources_lnk organizations_wms_sources_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations_wms_sources_lnk
    ADD CONSTRAINT organizations_wms_sources_lnk_ifk FOREIGN KEY (wms_source_id) REFERENCES public.wms_sources(id) ON DELETE CASCADE;


--
-- TOC entry 3997 (class 2606 OID 41943)
-- Name: strapi_api_token_permissions strapi_api_token_permissions_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions
    ADD CONSTRAINT strapi_api_token_permissions_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 3999 (class 2606 OID 41948)
-- Name: strapi_api_token_permissions_token_lnk strapi_api_token_permissions_token_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions_token_lnk
    ADD CONSTRAINT strapi_api_token_permissions_token_links_fk FOREIGN KEY (api_token_permission_id) REFERENCES public.strapi_api_token_permissions(id) ON DELETE CASCADE;


--
-- TOC entry 4000 (class 2606 OID 41953)
-- Name: strapi_api_token_permissions_token_lnk strapi_api_token_permissions_token_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions_token_lnk
    ADD CONSTRAINT strapi_api_token_permissions_token_links_inv_fk FOREIGN KEY (api_token_id) REFERENCES public.strapi_api_tokens(id) ON DELETE CASCADE;


--
-- TOC entry 4001 (class 2606 OID 41958)
-- Name: strapi_api_token_permissions_token_lnk strapi_api_token_permissions_token_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions_token_lnk
    ADD CONSTRAINT strapi_api_token_permissions_token_lnk_fk FOREIGN KEY (api_token_permission_id) REFERENCES public.strapi_api_token_permissions(id) ON DELETE CASCADE;


--
-- TOC entry 4002 (class 2606 OID 41963)
-- Name: strapi_api_token_permissions_token_lnk strapi_api_token_permissions_token_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions_token_lnk
    ADD CONSTRAINT strapi_api_token_permissions_token_lnk_ifk FOREIGN KEY (api_token_id) REFERENCES public.strapi_api_tokens(id) ON DELETE CASCADE;


--
-- TOC entry 3998 (class 2606 OID 41968)
-- Name: strapi_api_token_permissions strapi_api_token_permissions_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_token_permissions
    ADD CONSTRAINT strapi_api_token_permissions_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4003 (class 2606 OID 41973)
-- Name: strapi_api_tokens strapi_api_tokens_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_tokens
    ADD CONSTRAINT strapi_api_tokens_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4004 (class 2606 OID 41978)
-- Name: strapi_api_tokens strapi_api_tokens_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_api_tokens
    ADD CONSTRAINT strapi_api_tokens_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4005 (class 2606 OID 41983)
-- Name: strapi_history_versions strapi_history_versions_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_history_versions
    ADD CONSTRAINT strapi_history_versions_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4006 (class 2606 OID 41988)
-- Name: strapi_release_actions strapi_release_actions_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions
    ADD CONSTRAINT strapi_release_actions_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4008 (class 2606 OID 41993)
-- Name: strapi_release_actions_release_lnk strapi_release_actions_release_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions_release_lnk
    ADD CONSTRAINT strapi_release_actions_release_links_fk FOREIGN KEY (release_action_id) REFERENCES public.strapi_release_actions(id) ON DELETE CASCADE;


--
-- TOC entry 4009 (class 2606 OID 41998)
-- Name: strapi_release_actions_release_lnk strapi_release_actions_release_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions_release_lnk
    ADD CONSTRAINT strapi_release_actions_release_links_inv_fk FOREIGN KEY (release_id) REFERENCES public.strapi_releases(id) ON DELETE CASCADE;


--
-- TOC entry 4010 (class 2606 OID 42003)
-- Name: strapi_release_actions_release_lnk strapi_release_actions_release_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions_release_lnk
    ADD CONSTRAINT strapi_release_actions_release_lnk_fk FOREIGN KEY (release_action_id) REFERENCES public.strapi_release_actions(id) ON DELETE CASCADE;


--
-- TOC entry 4011 (class 2606 OID 42008)
-- Name: strapi_release_actions_release_lnk strapi_release_actions_release_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions_release_lnk
    ADD CONSTRAINT strapi_release_actions_release_lnk_ifk FOREIGN KEY (release_id) REFERENCES public.strapi_releases(id) ON DELETE CASCADE;


--
-- TOC entry 4007 (class 2606 OID 42013)
-- Name: strapi_release_actions strapi_release_actions_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_release_actions
    ADD CONSTRAINT strapi_release_actions_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4012 (class 2606 OID 42018)
-- Name: strapi_releases strapi_releases_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_releases
    ADD CONSTRAINT strapi_releases_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4013 (class 2606 OID 42023)
-- Name: strapi_releases strapi_releases_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_releases
    ADD CONSTRAINT strapi_releases_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4014 (class 2606 OID 42028)
-- Name: strapi_transfer_token_permissions strapi_transfer_token_permissions_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions
    ADD CONSTRAINT strapi_transfer_token_permissions_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4016 (class 2606 OID 42033)
-- Name: strapi_transfer_token_permissions_token_lnk strapi_transfer_token_permissions_token_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions_token_lnk
    ADD CONSTRAINT strapi_transfer_token_permissions_token_links_fk FOREIGN KEY (transfer_token_permission_id) REFERENCES public.strapi_transfer_token_permissions(id) ON DELETE CASCADE;


--
-- TOC entry 4017 (class 2606 OID 42038)
-- Name: strapi_transfer_token_permissions_token_lnk strapi_transfer_token_permissions_token_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions_token_lnk
    ADD CONSTRAINT strapi_transfer_token_permissions_token_links_inv_fk FOREIGN KEY (transfer_token_id) REFERENCES public.strapi_transfer_tokens(id) ON DELETE CASCADE;


--
-- TOC entry 4018 (class 2606 OID 42043)
-- Name: strapi_transfer_token_permissions_token_lnk strapi_transfer_token_permissions_token_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions_token_lnk
    ADD CONSTRAINT strapi_transfer_token_permissions_token_lnk_fk FOREIGN KEY (transfer_token_permission_id) REFERENCES public.strapi_transfer_token_permissions(id) ON DELETE CASCADE;


--
-- TOC entry 4019 (class 2606 OID 42048)
-- Name: strapi_transfer_token_permissions_token_lnk strapi_transfer_token_permissions_token_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions_token_lnk
    ADD CONSTRAINT strapi_transfer_token_permissions_token_lnk_ifk FOREIGN KEY (transfer_token_id) REFERENCES public.strapi_transfer_tokens(id) ON DELETE CASCADE;


--
-- TOC entry 4015 (class 2606 OID 42053)
-- Name: strapi_transfer_token_permissions strapi_transfer_token_permissions_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_token_permissions
    ADD CONSTRAINT strapi_transfer_token_permissions_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4020 (class 2606 OID 42058)
-- Name: strapi_transfer_tokens strapi_transfer_tokens_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_tokens
    ADD CONSTRAINT strapi_transfer_tokens_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4021 (class 2606 OID 42063)
-- Name: strapi_transfer_tokens strapi_transfer_tokens_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_transfer_tokens
    ADD CONSTRAINT strapi_transfer_tokens_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4022 (class 2606 OID 42068)
-- Name: strapi_workflows strapi_workflows_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows
    ADD CONSTRAINT strapi_workflows_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4024 (class 2606 OID 42073)
-- Name: strapi_workflows_stage_required_to_publish_lnk strapi_workflows_stage_required_to_publish_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stage_required_to_publish_lnk
    ADD CONSTRAINT strapi_workflows_stage_required_to_publish_lnk_fk FOREIGN KEY (workflow_id) REFERENCES public.strapi_workflows(id) ON DELETE CASCADE;


--
-- TOC entry 4025 (class 2606 OID 42078)
-- Name: strapi_workflows_stage_required_to_publish_lnk strapi_workflows_stage_required_to_publish_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stage_required_to_publish_lnk
    ADD CONSTRAINT strapi_workflows_stage_required_to_publish_lnk_ifk FOREIGN KEY (workflow_stage_id) REFERENCES public.strapi_workflows_stages(id) ON DELETE CASCADE;


--
-- TOC entry 4026 (class 2606 OID 42083)
-- Name: strapi_workflows_stages strapi_workflows_stages_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages
    ADD CONSTRAINT strapi_workflows_stages_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4028 (class 2606 OID 42088)
-- Name: strapi_workflows_stages_permissions_lnk strapi_workflows_stages_permissions_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages_permissions_lnk
    ADD CONSTRAINT strapi_workflows_stages_permissions_lnk_fk FOREIGN KEY (workflow_stage_id) REFERENCES public.strapi_workflows_stages(id) ON DELETE CASCADE;


--
-- TOC entry 4029 (class 2606 OID 42093)
-- Name: strapi_workflows_stages_permissions_lnk strapi_workflows_stages_permissions_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages_permissions_lnk
    ADD CONSTRAINT strapi_workflows_stages_permissions_lnk_ifk FOREIGN KEY (permission_id) REFERENCES public.admin_permissions(id) ON DELETE CASCADE;


--
-- TOC entry 4027 (class 2606 OID 42098)
-- Name: strapi_workflows_stages strapi_workflows_stages_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages
    ADD CONSTRAINT strapi_workflows_stages_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4030 (class 2606 OID 42103)
-- Name: strapi_workflows_stages_workflow_lnk strapi_workflows_stages_workflow_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages_workflow_lnk
    ADD CONSTRAINT strapi_workflows_stages_workflow_lnk_fk FOREIGN KEY (workflow_stage_id) REFERENCES public.strapi_workflows_stages(id) ON DELETE CASCADE;


--
-- TOC entry 4031 (class 2606 OID 42108)
-- Name: strapi_workflows_stages_workflow_lnk strapi_workflows_stages_workflow_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows_stages_workflow_lnk
    ADD CONSTRAINT strapi_workflows_stages_workflow_lnk_ifk FOREIGN KEY (workflow_id) REFERENCES public.strapi_workflows(id) ON DELETE CASCADE;


--
-- TOC entry 4023 (class 2606 OID 42113)
-- Name: strapi_workflows strapi_workflows_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strapi_workflows
    ADD CONSTRAINT strapi_workflows_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4032 (class 2606 OID 42118)
-- Name: up_permissions up_permissions_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions
    ADD CONSTRAINT up_permissions_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4034 (class 2606 OID 42123)
-- Name: up_permissions_role_lnk up_permissions_role_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions_role_lnk
    ADD CONSTRAINT up_permissions_role_links_fk FOREIGN KEY (permission_id) REFERENCES public.up_permissions(id) ON DELETE CASCADE;


--
-- TOC entry 4035 (class 2606 OID 42128)
-- Name: up_permissions_role_lnk up_permissions_role_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions_role_lnk
    ADD CONSTRAINT up_permissions_role_links_inv_fk FOREIGN KEY (role_id) REFERENCES public.up_roles(id) ON DELETE CASCADE;


--
-- TOC entry 4036 (class 2606 OID 42133)
-- Name: up_permissions_role_lnk up_permissions_role_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions_role_lnk
    ADD CONSTRAINT up_permissions_role_lnk_fk FOREIGN KEY (permission_id) REFERENCES public.up_permissions(id) ON DELETE CASCADE;


--
-- TOC entry 4037 (class 2606 OID 42138)
-- Name: up_permissions_role_lnk up_permissions_role_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions_role_lnk
    ADD CONSTRAINT up_permissions_role_lnk_ifk FOREIGN KEY (role_id) REFERENCES public.up_roles(id) ON DELETE CASCADE;


--
-- TOC entry 4033 (class 2606 OID 42143)
-- Name: up_permissions up_permissions_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_permissions
    ADD CONSTRAINT up_permissions_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4038 (class 2606 OID 42148)
-- Name: up_roles up_roles_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_roles
    ADD CONSTRAINT up_roles_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4039 (class 2606 OID 42153)
-- Name: up_roles up_roles_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_roles
    ADD CONSTRAINT up_roles_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4040 (class 2606 OID 42158)
-- Name: up_users up_users_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users
    ADD CONSTRAINT up_users_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4042 (class 2606 OID 42163)
-- Name: up_users_organization_lnk up_users_organization_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_organization_lnk
    ADD CONSTRAINT up_users_organization_links_fk FOREIGN KEY (user_id) REFERENCES public.up_users(id) ON DELETE CASCADE;


--
-- TOC entry 4043 (class 2606 OID 42168)
-- Name: up_users_organization_lnk up_users_organization_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_organization_lnk
    ADD CONSTRAINT up_users_organization_links_inv_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4044 (class 2606 OID 42173)
-- Name: up_users_organization_lnk up_users_organization_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_organization_lnk
    ADD CONSTRAINT up_users_organization_lnk_fk FOREIGN KEY (user_id) REFERENCES public.up_users(id) ON DELETE CASCADE;


--
-- TOC entry 4045 (class 2606 OID 42178)
-- Name: up_users_organization_lnk up_users_organization_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_organization_lnk
    ADD CONSTRAINT up_users_organization_lnk_ifk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4046 (class 2606 OID 42183)
-- Name: up_users_role_lnk up_users_role_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_role_lnk
    ADD CONSTRAINT up_users_role_links_fk FOREIGN KEY (user_id) REFERENCES public.up_users(id) ON DELETE CASCADE;


--
-- TOC entry 4047 (class 2606 OID 42188)
-- Name: up_users_role_lnk up_users_role_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_role_lnk
    ADD CONSTRAINT up_users_role_links_inv_fk FOREIGN KEY (role_id) REFERENCES public.up_roles(id) ON DELETE CASCADE;


--
-- TOC entry 4048 (class 2606 OID 42193)
-- Name: up_users_role_lnk up_users_role_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_role_lnk
    ADD CONSTRAINT up_users_role_lnk_fk FOREIGN KEY (user_id) REFERENCES public.up_users(id) ON DELETE CASCADE;


--
-- TOC entry 4049 (class 2606 OID 42198)
-- Name: up_users_role_lnk up_users_role_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users_role_lnk
    ADD CONSTRAINT up_users_role_lnk_ifk FOREIGN KEY (role_id) REFERENCES public.up_roles(id) ON DELETE CASCADE;


--
-- TOC entry 4041 (class 2606 OID 42203)
-- Name: up_users up_users_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.up_users
    ADD CONSTRAINT up_users_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4050 (class 2606 OID 42208)
-- Name: upload_folders upload_folders_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders
    ADD CONSTRAINT upload_folders_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4052 (class 2606 OID 42213)
-- Name: upload_folders_parent_lnk upload_folders_parent_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders_parent_lnk
    ADD CONSTRAINT upload_folders_parent_links_fk FOREIGN KEY (folder_id) REFERENCES public.upload_folders(id) ON DELETE CASCADE;


--
-- TOC entry 4053 (class 2606 OID 42218)
-- Name: upload_folders_parent_lnk upload_folders_parent_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders_parent_lnk
    ADD CONSTRAINT upload_folders_parent_links_inv_fk FOREIGN KEY (inv_folder_id) REFERENCES public.upload_folders(id) ON DELETE CASCADE;


--
-- TOC entry 4054 (class 2606 OID 42223)
-- Name: upload_folders_parent_lnk upload_folders_parent_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders_parent_lnk
    ADD CONSTRAINT upload_folders_parent_lnk_fk FOREIGN KEY (folder_id) REFERENCES public.upload_folders(id) ON DELETE CASCADE;


--
-- TOC entry 4055 (class 2606 OID 42228)
-- Name: upload_folders_parent_lnk upload_folders_parent_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders_parent_lnk
    ADD CONSTRAINT upload_folders_parent_lnk_ifk FOREIGN KEY (inv_folder_id) REFERENCES public.upload_folders(id) ON DELETE CASCADE;


--
-- TOC entry 4051 (class 2606 OID 42233)
-- Name: upload_folders upload_folders_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_folders
    ADD CONSTRAINT upload_folders_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4056 (class 2606 OID 42238)
-- Name: wms_sources wms_sources_created_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources
    ADD CONSTRAINT wms_sources_created_by_id_fk FOREIGN KEY (created_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- TOC entry 4058 (class 2606 OID 42243)
-- Name: wms_sources_organization_lnk wms_sources_organization_links_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources_organization_lnk
    ADD CONSTRAINT wms_sources_organization_links_fk FOREIGN KEY (wms_source_id) REFERENCES public.wms_sources(id) ON DELETE CASCADE;


--
-- TOC entry 4059 (class 2606 OID 42248)
-- Name: wms_sources_organization_lnk wms_sources_organization_links_inv_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources_organization_lnk
    ADD CONSTRAINT wms_sources_organization_links_inv_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4060 (class 2606 OID 42253)
-- Name: wms_sources_organization_lnk wms_sources_organization_lnk_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources_organization_lnk
    ADD CONSTRAINT wms_sources_organization_lnk_fk FOREIGN KEY (wms_source_id) REFERENCES public.wms_sources(id) ON DELETE CASCADE;


--
-- TOC entry 4061 (class 2606 OID 42258)
-- Name: wms_sources_organization_lnk wms_sources_organization_lnk_ifk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources_organization_lnk
    ADD CONSTRAINT wms_sources_organization_lnk_ifk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 4057 (class 2606 OID 42263)
-- Name: wms_sources wms_sources_updated_by_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wms_sources
    ADD CONSTRAINT wms_sources_updated_by_id_fk FOREIGN KEY (updated_by_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


-- Completed on 2025-01-23 15:13:22 UTC

--
-- PostgreSQL database dump complete
--

