SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict MsKyGJdOwlNKSEQqgrwxcCcWEgVdXLvEmKST2uDTjC1W3UckdOH44xyFxAEUbFw

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'c3297b62-9eca-4f06-ba5a-32d490c35039', 'authenticated', 'authenticated', 'alice.chiozza@gmail.com', '$2a$10$17a7l3AygaL6bh00NCeaLeIYyZFdZW8g5wihaGUgfXmokUPnTta6y', '2026-05-23 15:38:15.851435+00', NULL, '', '2026-05-23 15:37:59.920747+00', '', NULL, '', '', NULL, '2026-05-23 15:38:44.483859+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "c3297b62-9eca-4f06-ba5a-32d490c35039", "email": "alice.chiozza@gmail.com", "display_name": "Lilli", "email_verified": true, "phone_verified": false}', NULL, '2026-05-23 15:37:59.878937+00', '2026-05-24 08:56:06.486426+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1e22ff0c-237a-4dc2-b47e-749ada9fab3a', 'authenticated', 'authenticated', 'alber.ajol@gmail.com', '$2a$10$w4Yv6R0yVzPHO0J7drD42OSdSx3zouWMLMjn7gFLooaKRGwKcnLpi', '2026-05-28 19:48:52.146142+00', NULL, '', '2026-05-28 19:48:28.84474+00', '', NULL, '', '', NULL, '2026-05-28 19:48:52.152409+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "1e22ff0c-237a-4dc2-b47e-749ada9fab3a", "email": "alber.ajol@gmail.com", "display_name": "Alberto", "email_verified": true, "phone_verified": false}', NULL, '2026-05-28 19:48:28.810588+00', '2026-05-28 19:48:52.167791+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a54ff891-421c-4086-b3ad-f1021632c312', 'authenticated', 'authenticated', 'rastellidiego01@gmail.com', '$2a$10$wr1.FbhljIS2Gx0KNhd0r.mdhakHV296EdzUAK0sC0H65fF00Smxu', '2026-05-28 19:44:30.034032+00', NULL, '', '2026-05-28 19:44:15.426458+00', '', NULL, '', '', NULL, '2026-05-28 19:44:54.244557+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "a54ff891-421c-4086-b3ad-f1021632c312", "email": "rastellidiego01@gmail.com", "display_name": "Sbiego", "email_verified": true, "phone_verified": false}', NULL, '2026-05-28 19:44:15.382616+00', '2026-06-10 15:27:13.19036+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'daaaf367-185c-43c5-965d-1e1cb4999e97', 'authenticated', 'authenticated', 'giacomofolli01@gmail.com', '$2a$10$qfziP6i5EdytboQBOXIxjuLLyQKRtLbh8kGB3RPOJOAw.us0vy02G', '2026-05-23 13:32:10.792974+00', NULL, '', '2026-05-23 13:31:40.012709+00', '', NULL, '', '', NULL, '2026-06-09 12:06:51.063655+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "daaaf367-185c-43c5-965d-1e1cb4999e97", "email": "giacomofolli01@gmail.com", "full_name": "AIOOO ZIVERI", "display_name": "AIOOO", "email_verified": true, "phone_verified": false}', NULL, '2026-05-23 13:31:39.970556+00', '2026-06-10 17:27:35.358253+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('daaaf367-185c-43c5-965d-1e1cb4999e97', 'daaaf367-185c-43c5-965d-1e1cb4999e97', '{"sub": "daaaf367-185c-43c5-965d-1e1cb4999e97", "email": "giacomofolli01@gmail.com", "full_name": "AIOOO ZIVERI", "display_name": "AIOOO", "email_verified": true, "phone_verified": false}', 'email', '2026-05-23 13:31:40.004429+00', '2026-05-23 13:31:40.00448+00', '2026-05-23 13:31:40.00448+00', '8f3caae6-0773-40f0-b7ff-390930593e59'),
	('c3297b62-9eca-4f06-ba5a-32d490c35039', 'c3297b62-9eca-4f06-ba5a-32d490c35039', '{"sub": "c3297b62-9eca-4f06-ba5a-32d490c35039", "email": "alice.chiozza@gmail.com", "display_name": "Lilli", "email_verified": true, "phone_verified": false}', 'email', '2026-05-23 15:37:59.915516+00', '2026-05-23 15:37:59.915562+00', '2026-05-23 15:37:59.915562+00', '06c9c658-a7af-45da-a6f4-64036ee7294e'),
	('a54ff891-421c-4086-b3ad-f1021632c312', 'a54ff891-421c-4086-b3ad-f1021632c312', '{"sub": "a54ff891-421c-4086-b3ad-f1021632c312", "email": "rastellidiego01@gmail.com", "display_name": "Sbiego", "email_verified": true, "phone_verified": false}', 'email', '2026-05-28 19:44:15.418245+00', '2026-05-28 19:44:15.418828+00', '2026-05-28 19:44:15.418828+00', '384f893d-29e0-483d-97dd-8b20f3b3d8e5'),
	('1e22ff0c-237a-4dc2-b47e-749ada9fab3a', '1e22ff0c-237a-4dc2-b47e-749ada9fab3a', '{"sub": "1e22ff0c-237a-4dc2-b47e-749ada9fab3a", "email": "alber.ajol@gmail.com", "display_name": "Alberto", "email_verified": true, "phone_verified": false}', 'email', '2026-05-28 19:48:28.836585+00', '2026-05-28 19:48:28.836644+00', '2026-05-28 19:48:28.836644+00', 'b1ebca4d-7794-447d-8db0-144cd3f09918');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('2c9c0290-a67b-41a3-964b-2f37c1003a64', 'c3297b62-9eca-4f06-ba5a-32d490c35039', '2026-05-23 15:38:15.857647+00', '2026-05-23 15:38:15.857647+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1', '84.227.250.217', NULL, NULL, NULL, NULL, NULL),
	('1498f5dd-c660-4292-b02f-829b19fb2b50', 'c3297b62-9eca-4f06-ba5a-32d490c35039', '2026-05-23 15:38:44.483983+00', '2026-05-24 08:56:06.497101+00', NULL, 'aal1', NULL, '2026-05-24 08:56:06.496999', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1', '194.230.158.93', NULL, NULL, NULL, NULL, NULL),
	('304b8129-372a-4f8e-aeaf-3c82afc8e768', 'daaaf367-185c-43c5-965d-1e1cb4999e97', '2026-05-25 10:33:34.158303+00', '2026-05-25 10:33:34.158303+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.121.0 Chrome/142.0.7444.265 Electron/39.8.8 Safari/537.36', '151.41.245.124', NULL, NULL, NULL, NULL, NULL),
	('5e84e82c-f175-4677-b714-3e797cc579e6', 'daaaf367-185c-43c5-965d-1e1cb4999e97', '2026-06-09 12:06:51.064863+00', '2026-06-09 12:06:51.064863+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '37.103.87.112', NULL, NULL, NULL, NULL, NULL),
	('0dd0bf87-b1f8-455f-8301-3ddc893bddb0', 'daaaf367-185c-43c5-965d-1e1cb4999e97', '2026-05-24 07:24:02.935981+00', '2026-06-09 12:08:06.940324+00', NULL, 'aal1', NULL, '2026-06-09 12:08:06.940226', 'Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0', '37.103.87.112', NULL, NULL, NULL, NULL, NULL),
	('ec3afb12-eca9-44c2-8bda-4e424acd809c', 'a54ff891-421c-4086-b3ad-f1021632c312', '2026-05-28 19:44:30.040924+00', '2026-05-28 19:44:30.040924+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/148.0.7778.166 Mobile/15E148 Safari/604.1', '31.221.160.182', NULL, NULL, NULL, NULL, NULL),
	('bc57465d-cd78-4e06-9fb8-8cd43eee2c12', '1e22ff0c-237a-4dc2-b47e-749ada9fab3a', '2026-05-28 19:48:52.156895+00', '2026-05-28 19:48:52.156895+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/148.0.7778.166 Mobile/15E148 Safari/604.1', '193.207.170.243', NULL, NULL, NULL, NULL, NULL),
	('4271a469-59c8-45f9-9599-9427542a6407', 'a54ff891-421c-4086-b3ad-f1021632c312', '2026-05-28 19:44:54.247699+00', '2026-06-10 15:27:13.200009+00', NULL, 'aal1', NULL, '2026-06-10 15:27:13.199888', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '46.6.153.176', NULL, NULL, NULL, NULL, NULL),
	('0e04fc45-c55f-4233-a65d-65523430bbe5', 'daaaf367-185c-43c5-965d-1e1cb4999e97', '2026-05-24 07:18:52.689648+00', '2026-06-10 17:27:35.370919+00', NULL, 'aal1', NULL, '2026-06-10 17:27:35.370811', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', '151.34.60.172', NULL, NULL, NULL, NULL, NULL),
	('cf3c3dc2-c2a7-4665-b039-7bb6c5312c87', 'daaaf367-185c-43c5-965d-1e1cb4999e97', '2026-05-25 13:11:21.282516+00', '2026-05-31 07:26:36.55497+00', NULL, 'aal1', NULL, '2026-05-31 07:26:36.554853', 'Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0', '151.42.76.244', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('2c9c0290-a67b-41a3-964b-2f37c1003a64', '2026-05-23 15:38:15.882804+00', '2026-05-23 15:38:15.882804+00', 'otp', '1632208d-2458-4d15-b6a2-b244f7575810'),
	('1498f5dd-c660-4292-b02f-829b19fb2b50', '2026-05-23 15:38:44.486737+00', '2026-05-23 15:38:44.486737+00', 'password', 'a43689bf-f4d9-4765-b3ed-24ed2298f8e2'),
	('0e04fc45-c55f-4233-a65d-65523430bbe5', '2026-05-24 07:18:52.706906+00', '2026-05-24 07:18:52.706906+00', 'password', '7c229bc8-7de7-42a5-a1b8-c0c7febe3000'),
	('0dd0bf87-b1f8-455f-8301-3ddc893bddb0', '2026-05-24 07:24:02.945657+00', '2026-05-24 07:24:02.945657+00', 'password', 'bf8b5f44-7110-46c5-bf25-dcee79a0aa7d'),
	('304b8129-372a-4f8e-aeaf-3c82afc8e768', '2026-05-25 10:33:34.195782+00', '2026-05-25 10:33:34.195782+00', 'password', '7b499ee3-fe14-4af8-b5b0-1557e79559a0'),
	('cf3c3dc2-c2a7-4665-b039-7bb6c5312c87', '2026-05-25 13:11:21.325565+00', '2026-05-25 13:11:21.325565+00', 'password', '71306d9a-a9b1-418e-8ef1-9a9899e7f0e6'),
	('ec3afb12-eca9-44c2-8bda-4e424acd809c', '2026-05-28 19:44:30.0539+00', '2026-05-28 19:44:30.0539+00', 'otp', '68887ca7-84b4-4095-aa2b-e4bc201dd508'),
	('4271a469-59c8-45f9-9599-9427542a6407', '2026-05-28 19:44:54.261959+00', '2026-05-28 19:44:54.261959+00', 'password', '75dc69f6-e57c-476e-8418-c8c7906d02b1'),
	('bc57465d-cd78-4e06-9fb8-8cd43eee2c12', '2026-05-28 19:48:52.168316+00', '2026-05-28 19:48:52.168316+00', 'otp', 'cc1578d3-3827-460b-9803-82fb4e64204b'),
	('5e84e82c-f175-4677-b714-3e797cc579e6', '2026-06-09 12:06:51.096707+00', '2026-06-09 12:06:51.096707+00', 'password', '3e27b558-dbd6-488b-88f4-2e97d3e22338');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 7, 'f5vd3ylcrsyl', 'c3297b62-9eca-4f06-ba5a-32d490c35039', false, '2026-05-23 15:38:15.870634+00', '2026-05-23 15:38:15.870634+00', NULL, '2c9c0290-a67b-41a3-964b-2f37c1003a64'),
	('00000000-0000-0000-0000-000000000000', 13, 'sbbcwmvysztc', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-24 07:24:02.943028+00', '2026-05-24 08:22:38.094722+00', NULL, '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 12, 'va46sjzudfrc', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-24 07:18:52.696635+00', '2026-05-24 08:34:11.530845+00', NULL, '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 8, 'lbdasqm7akxn', 'c3297b62-9eca-4f06-ba5a-32d490c35039', true, '2026-05-23 15:38:44.485262+00', '2026-05-24 08:56:06.477672+00', NULL, '1498f5dd-c660-4292-b02f-829b19fb2b50'),
	('00000000-0000-0000-0000-000000000000', 16, 'e7lkppq4nehz', 'c3297b62-9eca-4f06-ba5a-32d490c35039', false, '2026-05-24 08:56:06.484348+00', '2026-05-24 08:56:06.484348+00', 'lbdasqm7akxn', '1498f5dd-c660-4292-b02f-829b19fb2b50'),
	('00000000-0000-0000-0000-000000000000', 15, '7ul34h6ri5pr', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-24 08:34:11.535774+00', '2026-05-25 09:58:43.109018+00', 'va46sjzudfrc', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 14, 'uoxfrwriojuq', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-24 08:22:38.107895+00', '2026-05-25 10:01:20.456283+00', 'sbbcwmvysztc', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 19, 'nyhsc4dbnu3j', 'daaaf367-185c-43c5-965d-1e1cb4999e97', false, '2026-05-25 10:33:34.180184+00', '2026-05-25 10:33:34.180184+00', NULL, '304b8129-372a-4f8e-aeaf-3c82afc8e768'),
	('00000000-0000-0000-0000-000000000000', 17, 'rg35gaw4yezt', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-25 09:58:43.131977+00', '2026-05-25 10:57:42.548617+00', '7ul34h6ri5pr', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 20, 'oc6ev6rnu2aq', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-25 10:57:42.559634+00', '2026-05-25 12:00:26.342879+00', 'rg35gaw4yezt', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 21, 'qggqrqwtmruf', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-25 12:00:26.357931+00', '2026-05-25 18:15:55.060807+00', 'oc6ev6rnu2aq', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 23, 'xgrfsfw22upd', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-25 18:15:55.08624+00', '2026-05-26 12:44:31.626837+00', 'qggqrqwtmruf', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 24, 'gtwbbdicshyh', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-26 12:44:31.648023+00', '2026-05-27 06:18:45.362055+00', 'xgrfsfw22upd', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 25, 'cgziqh45ilku', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-27 06:18:45.380105+00', '2026-05-27 18:56:26.298407+00', 'gtwbbdicshyh', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 26, '5nkwxgyvh3cp', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-27 18:56:26.315996+00', '2026-05-28 19:38:23.321826+00', 'cgziqh45ilku', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 28, '3z6fvrwlst7z', 'a54ff891-421c-4086-b3ad-f1021632c312', false, '2026-05-28 19:44:30.051186+00', '2026-05-28 19:44:30.051186+00', NULL, 'ec3afb12-eca9-44c2-8bda-4e424acd809c'),
	('00000000-0000-0000-0000-000000000000', 30, 'ybu6x6lu5prs', '1e22ff0c-237a-4dc2-b47e-749ada9fab3a', false, '2026-05-28 19:48:52.165145+00', '2026-05-28 19:48:52.165145+00', NULL, 'bc57465d-cd78-4e06-9fb8-8cd43eee2c12'),
	('00000000-0000-0000-0000-000000000000', 27, 'aciohg3gmz7c', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-28 19:38:23.33659+00', '2026-05-28 21:40:42.450075+00', '5nkwxgyvh3cp', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 31, 'imh746digpxx', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-28 21:40:42.475001+00', '2026-05-29 09:35:12.254245+00', 'aciohg3gmz7c', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 18, 'stlsmli4dblb', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-25 10:01:20.462413+00', '2026-05-29 09:57:34.323408+00', 'uoxfrwriojuq', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 33, 'ngtsszsjhe2q', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-29 09:57:34.329594+00', '2026-05-29 10:58:42.758318+00', 'stlsmli4dblb', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 34, 'a3hfx6nayhge', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-29 10:58:42.766129+00', '2026-05-29 11:56:58.6774+00', 'ngtsszsjhe2q', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 22, 'z7usdb52mzm2', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-25 13:11:21.303588+00', '2026-05-29 12:12:40.910002+00', NULL, 'cf3c3dc2-c2a7-4665-b039-7bb6c5312c87'),
	('00000000-0000-0000-0000-000000000000', 32, 'adhcmwpq3bvu', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-29 09:35:12.280509+00', '2026-05-29 12:14:58.015231+00', 'imh746digpxx', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 35, 'x3dztrc4qlfi', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-29 11:56:58.688278+00', '2026-05-29 12:56:01.579321+00', 'a3hfx6nayhge', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 37, 'j55rqfva4n6k', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-29 12:14:58.023392+00', '2026-05-29 13:37:59.102302+00', 'adhcmwpq3bvu', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 38, 'ewvd6366olfl', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-29 12:56:01.594371+00', '2026-05-29 13:54:41.28718+00', 'x3dztrc4qlfi', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 39, '6ztpxdikyr3x', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-29 13:37:59.111923+00', '2026-05-29 14:54:15.609405+00', 'j55rqfva4n6k', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 41, 'qfvt26m7j366', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-29 14:54:15.615993+00', '2026-05-29 21:47:42.678232+00', '6ztpxdikyr3x', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 42, 'nivwueoqupst', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-29 21:47:42.696846+00', '2026-05-30 20:21:04.334514+00', 'qfvt26m7j366', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 40, 'jkknauj5tuld', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-29 13:54:41.296671+00', '2026-05-30 20:29:46.625372+00', 'ewvd6366olfl', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 44, 'xzjmmk4pb322', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-30 20:29:46.631089+00', '2026-05-30 21:27:56.86987+00', 'jkknauj5tuld', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 43, 'ukfuja6e5557', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-30 20:21:04.352464+00', '2026-05-30 21:31:06.200856+00', 'nivwueoqupst', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 45, 'knqyp6pnxzxa', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-30 21:27:56.881676+00', '2026-05-31 07:01:17.523647+00', 'xzjmmk4pb322', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 36, 'vz342vmfhnzx', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-29 12:12:40.916191+00', '2026-05-31 07:26:36.532276+00', 'z7usdb52mzm2', 'cf3c3dc2-c2a7-4665-b039-7bb6c5312c87'),
	('00000000-0000-0000-0000-000000000000', 48, 'mkxmtf2cdgsk', 'daaaf367-185c-43c5-965d-1e1cb4999e97', false, '2026-05-31 07:26:36.541205+00', '2026-05-31 07:26:36.541205+00', 'vz342vmfhnzx', 'cf3c3dc2-c2a7-4665-b039-7bb6c5312c87'),
	('00000000-0000-0000-0000-000000000000', 46, 'v4m7nspqp2ye', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-30 21:31:06.204742+00', '2026-05-31 07:43:10.671179+00', 'ukfuja6e5557', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 47, 'w7zy2vyjuy4r', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-31 07:01:17.538894+00', '2026-05-31 08:00:12.553196+00', 'knqyp6pnxzxa', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 49, '6mm2c34cye7n', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-31 07:43:10.675225+00', '2026-05-31 11:34:48.444203+00', 'v4m7nspqp2ye', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 51, 'i4fzlofutwza', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-31 11:34:48.457347+00', '2026-05-31 13:33:51.388276+00', '6mm2c34cye7n', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 52, 'lcl2dqjrstr5', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-31 13:33:51.406392+00', '2026-05-31 17:33:15.968902+00', 'i4fzlofutwza', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 53, '6gbdeopzvksz', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-31 17:33:15.986665+00', '2026-06-02 14:28:30.227967+00', 'lcl2dqjrstr5', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 54, 'gglamy23tr7p', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-06-02 14:28:30.240326+00', '2026-06-03 16:52:15.405669+00', '6gbdeopzvksz', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 29, 'sqxqhkls437k', 'a54ff891-421c-4086-b3ad-f1021632c312', true, '2026-05-28 19:44:54.258615+00', '2026-06-06 08:24:49.264049+00', NULL, '4271a469-59c8-45f9-9599-9427542a6407'),
	('00000000-0000-0000-0000-000000000000', 56, 'hf2w2wwfi5st', 'a54ff891-421c-4086-b3ad-f1021632c312', true, '2026-06-06 08:24:49.27748+00', '2026-06-06 13:24:00.675172+00', 'sqxqhkls437k', '4271a469-59c8-45f9-9599-9427542a6407'),
	('00000000-0000-0000-0000-000000000000', 55, 'fyo7nfweybfr', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-06-03 16:52:15.419519+00', '2026-06-06 20:00:42.002063+00', 'gglamy23tr7p', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 50, 'gw4hesfmeciq', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-05-31 08:00:12.562371+00', '2026-06-08 17:30:13.298608+00', 'w7zy2vyjuy4r', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 58, 'ueecm3voqo4y', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-06-06 20:00:42.019937+00', '2026-06-08 17:47:54.255977+00', 'fyo7nfweybfr', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 59, 'zkuthpx33ayq', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-06-08 17:30:13.309322+00', '2026-06-09 09:01:15.244329+00', 'gw4hesfmeciq', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 57, 'pe5uixbx43su', 'a54ff891-421c-4086-b3ad-f1021632c312', true, '2026-06-06 13:24:00.690169+00', '2026-06-09 13:38:07.620805+00', 'hf2w2wwfi5st', '4271a469-59c8-45f9-9599-9427542a6407'),
	('00000000-0000-0000-0000-000000000000', 68, 'h2ihf77y6ylu', 'a54ff891-421c-4086-b3ad-f1021632c312', true, '2026-06-09 15:18:39.988427+00', '2026-06-10 14:24:02.003784+00', 'tvprcroeztsk', '4271a469-59c8-45f9-9599-9427542a6407'),
	('00000000-0000-0000-0000-000000000000', 60, 'hr2lhclstuxo', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-06-08 17:47:54.260903+00', '2026-06-09 08:57:36.686626+00', 'ueecm3voqo4y', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 69, 'irnzvqdf5al4', 'a54ff891-421c-4086-b3ad-f1021632c312', true, '2026-06-10 14:24:02.020698+00', '2026-06-10 15:27:13.167467+00', 'h2ihf77y6ylu', '4271a469-59c8-45f9-9599-9427542a6407'),
	('00000000-0000-0000-0000-000000000000', 70, 'tyg7mbtmqcqn', 'a54ff891-421c-4086-b3ad-f1021632c312', false, '2026-06-10 15:27:13.181999+00', '2026-06-10 15:27:13.181999+00', 'irnzvqdf5al4', '4271a469-59c8-45f9-9599-9427542a6407'),
	('00000000-0000-0000-0000-000000000000', 61, 'ly37z3tqlhjt', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-06-09 08:57:36.703354+00', '2026-06-09 12:05:17.19432+00', 'hr2lhclstuxo', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 66, 'ocannri2wwjg', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-06-09 13:07:53.080844+00', '2026-06-10 17:27:35.339378+00', '37nci2aa4oan', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 64, 'j24dix2p4jix', 'daaaf367-185c-43c5-965d-1e1cb4999e97', false, '2026-06-09 12:06:51.086012+00', '2026-06-09 12:06:51.086012+00', NULL, '5e84e82c-f175-4677-b714-3e797cc579e6'),
	('00000000-0000-0000-0000-000000000000', 62, '4udh3tlyzbei', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-06-09 09:01:15.249755+00', '2026-06-09 12:08:06.931539+00', 'zkuthpx33ayq', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 65, 'ketforppkuj2', 'daaaf367-185c-43c5-965d-1e1cb4999e97', false, '2026-06-09 12:08:06.935508+00', '2026-06-09 12:08:06.935508+00', '4udh3tlyzbei', '0dd0bf87-b1f8-455f-8301-3ddc893bddb0'),
	('00000000-0000-0000-0000-000000000000', 63, '37nci2aa4oan', 'daaaf367-185c-43c5-965d-1e1cb4999e97', true, '2026-06-09 12:05:17.207993+00', '2026-06-09 13:07:53.072867+00', 'ly37z3tqlhjt', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 71, 'q7axz3iujlkz', 'daaaf367-185c-43c5-965d-1e1cb4999e97', false, '2026-06-10 17:27:35.349599+00', '2026-06-10 17:27:35.349599+00', 'ocannri2wwjg', '0e04fc45-c55f-4233-a65d-65523430bbe5'),
	('00000000-0000-0000-0000-000000000000', 67, 'tvprcroeztsk', 'a54ff891-421c-4086-b3ad-f1021632c312', true, '2026-06-09 13:38:07.628565+00', '2026-06-09 15:18:39.979875+00', 'pe5uixbx43su', '4271a469-59c8-45f9-9599-9427542a6407');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."exercises" ("id", "user_id", "name", "icon", "type", "current_step_index") VALUES
	('1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 'c3297b62-9eca-4f06-ba5a-32d490c35039', 'Pistol Squat', NULL, 'exercise', 0),
	('3cf8631d-9586-4c3e-baa7-1559ee792ee0', 'c3297b62-9eca-4f06-ba5a-32d490c35039', 'Plank', NULL, 'exercise', 0),
	('93ea6b66-af0d-4113-a573-2692624d9dd1', 'c3297b62-9eca-4f06-ba5a-32d490c35039', 'Tirata e Dorsali', NULL, 'exercise', 0),
	('b367735e-f30b-4520-b5f1-5a542e5e4f87', 'c3297b62-9eca-4f06-ba5a-32d490c35039', 'Hollow Body Hold', NULL, 'exercise', 0),
	('17fa1453-5111-485f-87e1-5a9a52d67cb6', 'a54ff891-421c-4086-b3ad-f1021632c312', 'Pulley', NULL, 'exercise', 0),
	('1f923e12-2b98-404b-9b1b-42f32b9eca96', 'a54ff891-421c-4086-b3ad-f1021632c312', 'Chest Press', NULL, 'exercise', 0),
	('92dcb518-ff31-4876-b7fa-041fece1d006', 'daaaf367-185c-43c5-965d-1e1cb4999e97', 'Burpees', NULL, 'exercise', 0),
	('940ef579-117d-4f08-a9f4-188bb13cdfe2', 'a54ff891-421c-4086-b3ad-f1021632c312', 'Lat Machine', NULL, 'exercise', 0),
	('16dc3763-06ac-48dd-be35-fcf995dbec16', 'a54ff891-421c-4086-b3ad-f1021632c312', 'Shoulder press', NULL, 'exercise', 0),
	('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 'c3297b62-9eca-4f06-ba5a-32d490c35039', 'Push-up', NULL, 'exercise', 1),
	('a695d693-b89c-443a-96e4-5f46360db901', 'c3297b62-9eca-4f06-ba5a-32d490c35039', 'Burpees', NULL, 'exercise', 1),
	('f1b97a4c-b96f-4097-9fde-d6e8f8061bec', 'a54ff891-421c-4086-b3ad-f1021632c312', 'Leg Press', NULL, 'exercise', 0),
	('1b57c390-3bf6-4161-8e5f-131493850684', 'a54ff891-421c-4086-b3ad-f1021632c312', 'Leg Extension', NULL, 'exercise', 0),
	('5a73dfa1-8818-42e8-9e47-adc35b9af1c1', 'a54ff891-421c-4086-b3ad-f1021632c312', 'Leg curl', NULL, 'exercise', 0),
	('22f14f09-30bf-4cc9-b7bf-8225b6672eec', 'a54ff891-421c-4086-b3ad-f1021632c312', 'Calf raises', NULL, 'exercise', 0),
	('df0380b4-f316-42c3-bdb9-6739e9d168b0', 'a54ff891-421c-4086-b3ad-f1021632c312', 'Dip', NULL, 'exercise', 0),
	('9eb968b8-1db5-4992-a2ba-1fd8fa17ffa1', 'a54ff891-421c-4086-b3ad-f1021632c312', 'Trazioni', NULL, 'exercise', 0),
	('5840a6cd-0391-454e-8074-c73c537cf1a9', 'a54ff891-421c-4086-b3ad-f1021632c312', 'Affondi con sacco', NULL, 'exercise', 0),
	('b2a8d167-27b2-4d2b-bb6a-df181829e001', 'daaaf367-185c-43c5-965d-1e1cb4999e97', 'Push-Ups', NULL, 'exercise', 3),
	('f4b6d81a-63d1-4cb7-bc91-236b5cc0e003', 'daaaf367-185c-43c5-965d-1e1cb4999e97', 'American Pull-Ups', NULL, 'exercise', 4),
	('e39c8412-110f-48db-84b2-cb7db301a005', 'daaaf367-185c-43c5-965d-1e1cb4999e97', 'Flying Leg Raises', NULL, 'exercise', 3),
	('c7e8490a-fbbf-4375-971c-30c8bb26d002', 'daaaf367-185c-43c5-965d-1e1cb4999e97', 'Pull-Ups', NULL, 'exercise', 4),
	('a12b93cf-8d4e-4f04-877a-e490fc68b004', 'daaaf367-185c-43c5-965d-1e1cb4999e97', 'Hollow Body Hold', NULL, 'exercise', 3),
	('86b20fc3-1259-450a-9d7a-1fc14723e008', 'daaaf367-185c-43c5-965d-1e1cb4999e97', 'Calf Raises', NULL, 'exercise', 1),
	('d5e6178a-c024-4903-a120-d4cf3e47e007', 'daaaf367-185c-43c5-965d-1e1cb4999e97', 'Squats', NULL, 'exercise', 1);


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "updated_at", "display_name", "full_name", "avatar_url") VALUES
	('c3297b62-9eca-4f06-ba5a-32d490c35039', '2026-05-23 15:37:59.877907+00', 'Lilli', '', ''),
	('1e22ff0c-237a-4dc2-b47e-749ada9fab3a', '2026-05-28 19:48:28.810262+00', 'Alberto', '', ''),
	('daaaf367-185c-43c5-965d-1e1cb4999e97', '2026-05-23 13:31:39.969514+00', 'Paco', '', '/prossima/avatars/avatar_1.png'),
	('a54ff891-421c-4086-b3ad-f1021632c312', '2026-05-28 19:44:15.380813+00', 'Sbiego', 'Diego Rastelli', '/prossima/avatars/avatar_1.png');


--
-- Data for Name: steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."steps" ("id", "exercise_id", "description", "completed", "completed_at", "step_index") VALUES
	('97a9796c-4485-40a6-b13e-519ee3ba6570', '4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 'Kneeling push-ups: 3 serie da 5 reps', true, '2026-05-17 10:27:21.2+00', 0),
	('0126f187-55bf-4160-85c5-527bad3e4869', '4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 'Kneeling push-ups: 3 serie da 8 reps', false, NULL, 1),
	('3338efce-8308-46cf-9a53-79cca662a0f6', '4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 'Floor Press con manubri (pesanti): 3 serie da 8 reps', false, NULL, 2),
	('bccd50c1-d98e-4a04-86e4-4b45a01ee319', '4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 'Kneeling push-ups: 3 serie da 12 reps', false, NULL, 3),
	('f20c7937-df24-4878-9a60-73b229e74b15', '4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 'Push-ups completi (eccentrica lenta, 4 sec a scendere): 3 serie da 4 reps', false, NULL, 4),
	('57479d3f-30f7-4312-ba5a-b030e37b5df9', '4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 'Incline push-ups (mani su rialzo basso): 3 serie da 8 reps', false, NULL, 5),
	('20d565b1-192e-4b98-99f7-c01e6a6f8e8e', '4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 'Push-ups completi standard: 3 serie da 5 reps', false, NULL, 6),
	('80d3c310-846f-43a1-8b89-ece3f5b2839b', '4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 'Push-ups completi standard: 3 serie da 8 reps', false, NULL, 7),
	('9d1610cf-70aa-4dd6-b55e-00de8c915f2c', '4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 'Push-ups completi con zavorra (es. zaino con pesi): 3 serie da 6 reps', false, NULL, 8),
	('d975ffef-3aeb-4873-b4e0-cdaa63d68d9f', '4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 'Target raggiunto: 1 serie da 12 Push-ups completi standard', false, NULL, 9),
	('1fb3728c-6fb5-465c-81d7-6b5bdce8f53f', '93ea6b66-af0d-4113-a573-2692624d9dd1', 'Rematore con manubri (singolo o doppio): 3 serie da 10 reps', false, NULL, 0),
	('bea1aa48-e8b8-44a6-8e34-af35d3fb61a1', '93ea6b66-af0d-4113-a573-2692624d9dd1', 'Rematore invertito sotto il tavolo (gambe piegate): 3 serie da 8 reps', false, NULL, 1),
	('6a66fcf9-f5f1-44bd-a146-f614c79a65ad', '93ea6b66-af0d-4113-a573-2692624d9dd1', 'Rematore con manubri (incrementando il peso): 3 serie da 8 reps', false, NULL, 2),
	('c8467c3c-112e-45b5-bad4-78196d8c5a0b', '93ea6b66-af0d-4113-a573-2692624d9dd1', 'Towel Door Rows (rematore alla porta con asciugamano): 3 serie da 12 reps', false, NULL, 3),
	('cd9f6d74-8605-45bf-ba97-342d5ef984c7', '93ea6b66-af0d-4113-a573-2692624d9dd1', 'Rematore invertito sotto il tavolo (gambe tese): 3 serie da 8 reps', false, NULL, 4),
	('8bfdc2fd-8369-440b-8842-94cded390582', '93ea6b66-af0d-4113-a573-2692624d9dd1', 'Pullover con manubrio (su panca o pavimento): 3 serie da 10 reps', false, NULL, 5),
	('3ea1513c-9c2b-4160-9200-ca3e8d4e8b0a', '93ea6b66-af0d-4113-a573-2692624d9dd1', 'Rematore invertito sotto il tavolo (piedi su sedia/rialzo): 3 serie da 6 reps', false, NULL, 6),
	('b9d1e11e-ba34-4d19-9d0f-cf3229413482', '93ea6b66-af0d-4113-a573-2692624d9dd1', 'Rematore con manubri pesante (carico vicino al peso corporeo totale diviso due): 3 serie da 6 reps', false, NULL, 7),
	('aefa5b38-d54e-4134-979f-4ddce538fa90', '93ea6b66-af0d-4113-a573-2692624d9dd1', 'Target raggiunto: 3 serie da 10 reps di Rematore invertito a gambe tese', false, NULL, 8),
	('a7a45c6f-66c3-4ba4-8614-72b3d067074d', '1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 'Bulgarian Split Squat: 3 serie da 10 reps per gamba', false, NULL, 0),
	('2a2eab94-4034-41af-84f0-f7d8d23de69a', '1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 'Bulgarian Split Squat con manubri: 3 serie da 8 reps per gamba', false, NULL, 1),
	('fbe3401c-9e4d-4404-ac42-667d92173f73', '1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 'Step-up alti con manubri: 3 serie da 8 reps per gamba', false, NULL, 2),
	('ffd197ae-d88b-4846-b563-7ebb0951645d', '1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 'Discesa eccentrica su una gamba (fino a terra): 3 serie da 5 reps per gamba', false, NULL, 3),
	('c3fa65c8-a910-48b4-8307-7fcd3ca4d2db', '1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 'Pistol squat assistito (appoggio mano leggero): 3 serie da 6 reps', false, NULL, 4),
	('4ca41b09-f784-4e2a-bf61-bf842cbef841', '1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 'Pistol squat su box (gamba libera esterna): 3 serie da 5 reps', false, NULL, 5),
	('a7cdeb66-ce62-4d08-beee-aee150d64245', '1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 'Pistol squat con contrappeso avanti (manubrio leggero 4-6kg): 3 serie da 5 reps', false, NULL, 6),
	('2663d60e-1e43-43b4-8e42-bd86a1eff5d5', '1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 'Pistol squat con tallone rialzato: 3 serie da 3 reps', false, NULL, 7),
	('a74b8024-d43e-4601-953f-38f5531683c6', '1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 'Target raggiunto: 1 Pistol Squat completo a corpo libero', false, NULL, 8),
	('808c06d4-863e-4574-94a2-80707e981609', 'b367735e-f30b-4520-b5f1-5a542e5e4f87', 'Hollow hold completo (corpo libero): 3 serie da 40 sec', false, NULL, 0),
	('28050f5b-1c38-4513-8b4c-19eb83d1387d', 'b367735e-f30b-4520-b5f1-5a542e5e4f87', 'Hollow hold completo (corpo libero): 3 serie da 50 sec', false, NULL, 1),
	('21493b12-528f-4ec9-bac0-4d24ee4d952b', 'b367735e-f30b-4520-b5f1-5a542e5e4f87', 'Hollow hold completo (corpo libero): 2 serie da 60 sec', false, NULL, 2),
	('30b11ccb-8581-430d-852d-323e3ad8f7b7', 'b367735e-f30b-4520-b5f1-5a542e5e4f87', 'Hollow hold con manubrio leggero tra le mani (1-3kg, braccia tese dietro): 3 serie da 30 sec', false, NULL, 3),
	('64ce66bb-d956-424d-aa86-14501f90b36c', 'b367735e-f30b-4520-b5f1-5a542e5e4f87', 'Hollow hold con cavigliere pesanti (o piccolo peso tra i piedi): 3 serie da 30 sec', false, NULL, 4),
	('b8232c29-237b-4182-bf52-5b22253f0cd8', 'b367735e-f30b-4520-b5f1-5a542e5e4f87', 'Hollow Rock (oscillazioni in posizione di hollow hold): 3 serie da 20 oscillazioni', false, NULL, 5),
	('1b6aa75d-9787-4b27-a8f0-540306fe7684', 'b367735e-f30b-4520-b5f1-5a542e5e4f87', 'Hollow hold con sovraccarico combinato (manubrio + cavigliere): 3 serie da 30 sec', false, NULL, 6),
	('0780d4fa-6c10-429a-95c3-94d9ee524972', 'b367735e-f30b-4520-b5f1-5a542e5e4f87', 'Hollow hold completo (corpo libero): 2 serie da 80 sec', false, NULL, 7),
	('999f7a27-f550-4bf8-a603-679c35593118', 'b367735e-f30b-4520-b5f1-5a542e5e4f87', 'Hollow hold completo (corpo libero): 2 serie da 100 sec', false, NULL, 8),
	('f86396e4-9f53-48f4-ba64-e01b0c5b858f', 'b367735e-f30b-4520-b5f1-5a542e5e4f87', 'Target raggiunto: 2 minuti ininterrotti a corpo libero', false, NULL, 9),
	('46676a0b-0015-42d7-8053-7e8dbcb3c836', '3cf8631d-9586-4c3e-baa7-1559ee792ee0', 'Plank standard: 3 serie da 45 sec', false, NULL, 0),
	('0e1b9385-509c-4561-b4a0-072c9082ec5d', '3cf8631d-9586-4c3e-baa7-1559ee792ee0', 'Plank standard: 3 serie da 60 sec', false, NULL, 1),
	('f415150a-3053-46b1-853d-7a6a2dc9fd6d', '3cf8631d-9586-4c3e-baa7-1559ee792ee0', 'Plank con shoulder taps: 3 serie da 16 reps', false, NULL, 2),
	('4f49b026-d0d4-4e7e-9bc2-880c08f4765a', '3cf8631d-9586-4c3e-baa7-1559ee792ee0', 'Plank standard con zavorra sulla schiena (disco o zaino): 3 serie da 45 sec', false, NULL, 3),
	('9184854a-9c4f-45fc-b5a4-ccccfa897901', '3cf8631d-9586-4c3e-baa7-1559ee792ee0', 'Plank a 3 appoggi (sollevando una gamba alternata): 3 serie da 45 sec', false, NULL, 4),
	('e90d8c89-7f37-46c4-9ed9-910bd32e73f2', '3cf8631d-9586-4c3e-baa7-1559ee792ee0', 'Plank standard con zavorra aumentata: 3 serie da 60 sec', false, NULL, 5),
	('552ee8d8-a974-4f92-940f-0646ed84dddf', '3cf8631d-9586-4c3e-baa7-1559ee792ee0', 'Plank standard: 2 serie da 90 sec', false, NULL, 6),
	('a87dcecf-da8b-49ca-918e-33c0aaf1592a', '3cf8631d-9586-4c3e-baa7-1559ee792ee0', 'Plank RKC (contrazione massima attiva): 3 serie da 20 sec', false, NULL, 7),
	('2af54e59-d6e6-4e95-9ecb-f0eab5eb5af3', '3cf8631d-9586-4c3e-baa7-1559ee792ee0', 'Target raggiunto: Plank standard con zavorra (es. 10kg) per 60 secondi', false, NULL, 8),
	('fe0f4f3b-51d8-4bc3-8766-c9ec10bd5a2f', 'a695d693-b89c-443a-96e4-5f46360db901', 'Squat thrust (senza salto): 10 reps', true, '2026-05-17 10:53:45.211+00', 0),
	('7a99ee17-3311-49e0-bc0d-ed2134e79e6b', 'a695d693-b89c-443a-96e4-5f46360db901', 'Burpees lenti senza salto: 10 reps', false, NULL, 1),
	('e5222503-3567-408c-b01f-7ed324b17cf1', 'a695d693-b89c-443a-96e4-5f46360db901', 'Burpees lenti con salto: 10 reps', false, NULL, 2),
	('fccf73d2-5342-4c37-97de-e4deb55b4a38', 'a695d693-b89c-443a-96e4-5f46360db901', '5 Burpees veloci: max velocità', false, NULL, 3),
	('86245274-2d94-4712-a26f-2954dcc38409', 'a695d693-b89c-443a-96e4-5f46360db901', '8 Burpees in 45 secondi', false, NULL, 4),
	('f125cdd8-3e75-48f5-9974-b58098e831c2', 'a695d693-b89c-443a-96e4-5f46360db901', 'Burpees con manubri leggeri in mano (es. 2-3kg, eliminando il salto in alto): 3 serie da 6 reps', false, NULL, 5),
	('a79f85d9-92c9-42a5-9c4c-5b58e76dae8d', 'a695d693-b89c-443a-96e4-5f46360db901', '12 Burpees in 60 secondi', false, NULL, 6),
	('41740490-6fb1-4ce4-92c6-c29dc1c3b8a6', 'a695d693-b89c-443a-96e4-5f46360db901', '2 serie da 8 Burpees con gilet zavorrato o zaino leggero (30 sec riposo)', false, NULL, 7),
	('6b303bdd-2a7a-4939-8e30-452d307f1de4', 'a695d693-b89c-443a-96e4-5f46360db901', '14 Burpees in 60 secondi', false, NULL, 8),
	('d0e2c54b-fe67-4e22-8206-a11d03f012de', 'a695d693-b89c-443a-96e4-5f46360db901', 'Target raggiunto: 15 Burpees in 1 minuto a corpo libero', false, NULL, 9),
	('7034ed48-9a35-47e3-b536-fa3e1bf1d151', 'b2a8d167-27b2-4d2b-bb6a-df181829e001', '3 sets of 10 reps (Bend knees)', true, '2026-05-18 09:01:16.121+00', 0),
	('2c4c98f7-5ac6-4c55-b8ef-9bc617a8ca8a', 'b2a8d167-27b2-4d2b-bb6a-df181829e001', '3 sets of 10 reps', false, NULL, 3),
	('83635eb3-e783-4525-92bc-99332c09e9aa', 'b2a8d167-27b2-4d2b-bb6a-df181829e001', '3 sets of 12 reps', false, NULL, 4),
	('e8f04ff0-3c6d-4fb7-8216-53ed15693f87', 'b2a8d167-27b2-4d2b-bb6a-df181829e001', '3 sets: 14, 12, and 10 reps', false, NULL, 5),
	('a156141d-c568-4a8f-b754-e21ce7efa0c3', 'b2a8d167-27b2-4d2b-bb6a-df181829e001', '3 sets: 16, 14, and 12 reps', false, NULL, 6),
	('ba993d5d-cfca-4e89-b649-1cf00f0d0002', 'b2a8d167-27b2-4d2b-bb6a-df181829e001', '3 sets of 16 reps', false, NULL, 7),
	('104927c4-d618-4d57-a8bb-8d5794df0358', 'b2a8d167-27b2-4d2b-bb6a-df181829e001', '3 sets of 20 reps (Long rest)', false, NULL, 8),
	('b7c715ed-9265-4dd2-8f18-94d2b9bb6075', 'c7e8490a-fbbf-4375-971c-30c8bb26d002', '5 sets of 1 negative rep', true, '2026-05-17 11:04:28.089+00', 0),
	('d243c844-ffbf-4a1b-b3ec-79760e05b9c5', '1f923e12-2b98-404b-9b1b-42f32b9eca96', '4x8 50kg', false, NULL, 0),
	('39f67795-3b78-4d12-9423-63c6495c29ed', '940ef579-117d-4f08-a9f4-188bb13cdfe2', '4x6 80kg', false, NULL, 0),
	('9695e84c-179f-4449-9048-499d6f50084c', 'c7e8490a-fbbf-4375-971c-30c8bb26d002', '3 sets of 2 reps', false, NULL, 4),
	('8f3544ca-d725-41d6-9dac-2d3ea0430ef9', 'c7e8490a-fbbf-4375-971c-30c8bb26d002', '3 sets: 3, 2, and 2 reps (With resistance bands)', false, NULL, 5),
	('8ceb4517-ce49-4b9f-8c27-34b07e7afeb4', 'c7e8490a-fbbf-4375-971c-30c8bb26d002', '4 sets: 3, 2, 2 reps, and 1 set to failure', false, NULL, 6),
	('8791c2e0-c3fa-402b-9121-d3aa12138b9b', 'c7e8490a-fbbf-4375-971c-30c8bb26d002', '4 sets: 4, 3, 2 reps, and 1 set to failure', false, NULL, 7),
	('b60e1e23-4d40-4659-aa96-c2d2b2470f87', 'c7e8490a-fbbf-4375-971c-30c8bb26d002', '3 sets of 6 reps (With resistance bands)', false, NULL, 8),
	('5080bf1d-984e-4722-93ea-1dd99bba450d', 'f4b6d81a-63d1-4cb7-bc91-236b5cc0e003', '3 sets of 6 at easy angle', true, '2026-05-15 09:18:17.963+00', 0),
	('87b1a6d7-7489-4fb7-84e8-900da8de6af9', 'f4b6d81a-63d1-4cb7-bc91-236b5cc0e003', '3 sets of 8 at medium angle', false, NULL, 4),
	('d5a68fb3-75bd-4311-8632-94a097c16b89', 'f4b6d81a-63d1-4cb7-bc91-236b5cc0e003', '3 sets of 10 at medium angle', false, NULL, 5),
	('93cf97ce-213f-43ec-bb04-3d440abdb218', 'f4b6d81a-63d1-4cb7-bc91-236b5cc0e003', '3 sets of 6 at hard angle', false, NULL, 6),
	('799604e4-5b2d-487d-bef7-e0d27402d720', 'f4b6d81a-63d1-4cb7-bc91-236b5cc0e003', '3 sets of 8 at hard angle', false, NULL, 7),
	('4cfff86d-8d20-451d-884d-b7ab80cc3b6f', 'f4b6d81a-63d1-4cb7-bc91-236b5cc0e003', '3 sets of 10 at hard angle', false, NULL, 8),
	('51e524ba-86c9-4be8-9d6d-3a3e955ba6e6', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '3 sets of 30 sec (Tuck hold)', true, '2026-05-15 11:05:53.777+00', 0),
	('b8bb18f5-dfdd-496a-a0bf-c2283c181305', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '3 sets of 40 sec (Tuck hold)', true, '2026-05-19 12:47:42.695+00', 1),
	('e66fdfb5-ba01-4299-9e47-2348829cfd9c', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '3 sets of 50 sec (Tuck hold)', false, NULL, 3),
	('21b6ed64-bf58-468e-a1a4-f2ba4ebbcad7', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '3 sets of 30 sec (Single-leg hold, per leg)', false, NULL, 4),
	('9fe19972-f66c-4aaa-813f-3fbe0c1403d0', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '3 sets of 40 sec (Single-leg hold, per leg)', false, NULL, 5),
	('9ab4ad2d-ca18-42fe-8129-d24c14b7e14d', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '3 sets of 30 sec (Full hold, arms by sides)', false, NULL, 6),
	('c052a2e4-8a7f-432e-89d0-d09407a2f84e', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '3 sets of 40 sec (Full hold, arms by sides)', false, NULL, 7),
	('2a7cf8cf-1fd6-472e-8566-c04b34824f45', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '3 sets of 50 sec (Full hold, arms by sides)', false, NULL, 8),
	('a2bab7e7-2601-4b4c-9d72-1dd0d5505a5e', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '3 sets of 1 min (Full hold, arms by sides)', false, NULL, 9),
	('008828b1-65aa-481d-a184-c6bbabf09ec2', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '3 sets of 30 sec (Full hold)', false, NULL, 10),
	('b74dfff3-9e54-49ec-8235-e8aa23621134', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '1 set of 2 min (Full hold)', false, NULL, 11),
	('2aef8661-7bb9-4228-93de-724f8bee1b57', 'e39c8412-110f-48db-84b2-cb7db301a005', '2 sets of 30 reps on the floor (Bent knees)', true, '2026-05-19 12:46:50.218+00', 0),
	('92c3a42b-58e6-47b6-b272-cd31f52ef2eb', 'e39c8412-110f-48db-84b2-cb7db301a005', '2 sets of 30 reps on the floor (Knees bent at 45°)', true, '2026-05-19 12:48:33.615+00', 1),
	('85829d4a-dcb8-419b-9a36-4679ff906e81', 'e39c8412-110f-48db-84b2-cb7db301a005', '2 sets of 25 reps on the floor', false, NULL, 3),
	('a0317d79-3313-4d44-a6d7-4bcc3e25a809', 'e39c8412-110f-48db-84b2-cb7db301a005', '2 sets of 20 reps on the floor (Full range of motion with lockout)', false, NULL, 4),
	('d635de0c-419e-4e54-b358-07f3ec16d991', 'e39c8412-110f-48db-84b2-cb7db301a005', '2 sets of 20 reps on the floor (Feet touching the floor)', false, NULL, 5),
	('036f2b6a-3e2d-485b-adf4-fad032212312', 'e39c8412-110f-48db-84b2-cb7db301a005', '2 sets of 15 reps (Bent knees) + 2 sets of Plow Raises', false, NULL, 6),
	('9276450e-7c5a-467d-bb4a-c1e055931dd3', 'e39c8412-110f-48db-84b2-cb7db301a005', '2 sets of 15 reps (Knees bent at 45°) + 2 sets of Plow Raises', false, NULL, 7),
	('12d82eb3-d7d3-4be3-bb74-bb154ef71d0e', 'e39c8412-110f-48db-84b2-cb7db301a005', '2 sets of 15 reps + 2 sets of Plow Raises', false, NULL, 8),
	('1330a150-5e63-40ba-9bdd-0282d58ecfbe', 'e39c8412-110f-48db-84b2-cb7db301a005', '2 sets of 20 reps + 2 sets of Plow Raises', false, NULL, 9),
	('5470304d-b153-4a1f-93f3-b700a7bfa783', 'e39c8412-110f-48db-84b2-cb7db301a005', '2 sets of 15 reps (Toes touching hands)', false, NULL, 10),
	('e8b106df-cf94-48dd-90c9-3b9f66b996bb', '92dcb518-ff31-4876-b7fa-041fece1d006', '3 sets of 1.5 mins', false, NULL, 1),
	('00559e6c-740e-4d87-8bba-9e0bdaa8e13b', '92dcb518-ff31-4876-b7fa-041fece1d006', '3 sets of 2 mins', false, NULL, 2),
	('a9c57766-b97b-4b41-aa97-c9a420ab38d0', '92dcb518-ff31-4876-b7fa-041fece1d006', '3 sets of 1 min + 2 sets of 6 reps in 30 sec', false, NULL, 3),
	('54f17212-91f5-4dc6-b6ea-d40a0c064e26', '92dcb518-ff31-4876-b7fa-041fece1d006', '3 sets of 1 min + 2 sets of 8 reps in 40 sec', false, NULL, 4),
	('e5e66cea-4f70-48b5-9e8e-65fb968f9b51', '92dcb518-ff31-4876-b7fa-041fece1d006', '3 sets of 1 min + 2 sets of 10 reps in 50 sec', false, NULL, 5),
	('ae5a0e7d-7e26-4c0e-a4c2-8d228c731d32', '92dcb518-ff31-4876-b7fa-041fece1d006', '3 sets of 12 reps (Within 1 min)', false, NULL, 6),
	('5040608e-6d59-40ca-9f91-e00b709aaa16', '92dcb518-ff31-4876-b7fa-041fece1d006', '3 sets of 15 reps (Within 1 min)', false, NULL, 7),
	('b45692d7-b991-4372-ad4b-dbcddbde50be', '86b20fc3-1259-450a-9d7a-1fc14723e008', '3 sets of 6 reps (40 kg)', true, '2026-05-15 09:18:44.965+00', 0),
	('5ceaa23d-b431-4cb6-985e-3aad263ac2da', 'f4b6d81a-63d1-4cb7-bc91-236b5cc0e003', '3 sets of 10 at easy angle', true, '2026-05-31 13:34:25.197+00', 2),
	('8645a416-d87e-4f87-81e7-c85bf3205474', 'f4b6d81a-63d1-4cb7-bc91-236b5cc0e003', '3 sets of 6 at medium angle', true, '2026-05-31 13:34:33.259+00', 3),
	('7fd8aa74-fdfb-4fa0-9c05-b55f51b6bae9', '92dcb518-ff31-4876-b7fa-041fece1d006', '3 sets of 1 min', false, NULL, 0),
	('9869d3c1-91b8-4ec9-b8ff-5cb65affa42d', 'c7e8490a-fbbf-4375-971c-30c8bb26d002', '3 sets of 2 negative reps', true, '2026-05-25 10:07:12.262+00', 1),
	('e8c442d9-f2ec-46e8-ab4a-aea4d0259b9b', 'e39c8412-110f-48db-84b2-cb7db301a005', '2 sets of 25 reps on the floor (Bending knees only on the way up)', true, '2026-05-31 13:34:43.961+00', 2),
	('02565399-8113-428d-972c-1ffa2ae340d1', 'b2a8d167-27b2-4d2b-bb6a-df181829e001', '3 sets of 6 reps', true, '2026-05-25 11:18:49.143+00', 1),
	('9543d1f7-0f8d-4790-b0ce-62ed3d3e99a1', 'c7e8490a-fbbf-4375-971c-30c8bb26d002', '3 sets of 2 assisted negative reps', true, '2026-05-25 12:01:15.442+00', 2),
	('7d271d55-a758-4a15-be5a-06ee3805a008', 'f4b6d81a-63d1-4cb7-bc91-236b5cc0e003', '3 sets of 8 at easy angle', true, '2026-05-27 18:56:57.924+00', 1),
	('f2bfadea-6185-42de-843d-534462d3b5be', '16dc3763-06ac-48dd-be35-fcf995dbec16', '4x8 40kg', false, NULL, 0),
	('1f5e2f78-4d08-4d0f-82ec-c55e61ac138a', '5a73dfa1-8818-42e8-9e47-adc35b9af1c1', '4x8 45kg', false, NULL, 0),
	('d6b88a73-18c3-4d27-97ad-95a5948581c6', 'df0380b4-f316-42c3-bdb9-6739e9d168b0', '1x5 16kg; 1x5 24kg; 2x4 35kg', false, NULL, 0),
	('a9291a87-e3da-4ec5-ba78-c1b791c1a9f5', '5840a6cd-0391-454e-8074-c73c537cf1a9', '3x10 +25kg', false, NULL, 0),
	('9d95e5f9-f2b7-4eff-979e-36b7548de8d6', 'b2a8d167-27b2-4d2b-bb6a-df181829e001', '3 sets of 8 reps', true, '2026-06-10 18:08:45.632+00', 2),
	('dbb03870-cf45-4d93-9e2e-1bc44704e328', 'c7e8490a-fbbf-4375-971c-30c8bb26d002', '4 sets of 4 negative reps', true, '2026-05-31 13:35:10.453+00', 3),
	('a63c5c52-7a0b-411c-9657-36c44cabcdeb', 'a12b93cf-8d4e-4f04-877a-e490fc68b004', '3 sets of 30 sec (Advanced tuck hold)', true, '2026-05-31 13:35:30.759+00', 2),
	('cc62b6ef-5bd1-4933-802c-744155d2cff7', '86b20fc3-1259-450a-9d7a-1fc14723e008', '3 sets of 8 reps (40 kg)', true, '2026-06-03 17:15:59.012+00', 1),
	('1c4b2c2b-b6f8-40ea-88f9-48965c458c8b', 'd5e6178a-c024-4903-a120-d4cf3e47e007', '6 sets of 8 reps (40 kg)', true, '2026-05-15 09:18:51.499+00', 0),
	('fc5ea586-043d-4f03-be10-4697ac757976', 'd5e6178a-c024-4903-a120-d4cf3e47e007', '5 sets of 10 reps (40 kg)', false, NULL, 1),
	('bfeec582-6235-48e1-a2c8-c646a20cdf87', 'd5e6178a-c024-4903-a120-d4cf3e47e007', '5 sets of 10 reps (44 kg)', false, NULL, 2),
	('9ed302f9-01c0-4786-b6f0-87deb7b80c72', 'd5e6178a-c024-4903-a120-d4cf3e47e007', '5 sets of 10 reps (48 kg)', false, NULL, 3),
	('1924304f-3607-4de3-be2e-312cc078a844', 'd5e6178a-c024-4903-a120-d4cf3e47e007', '3 sets of 10 reps (50 kg)', false, NULL, 4),
	('d47908e7-5828-490b-aeeb-c2c09c0e0acb', '17fa1453-5111-485f-87e1-5a9a52d67cb6', '3x8/10 30kg', false, NULL, 0),
	('24d9c4b1-01a6-444f-8f12-1081015594b9', 'f1b97a4c-b96f-4097-9fde-d6e8f8061bec', '4x8 90kg', false, NULL, 0),
	('0743abce-42df-40de-8ca1-9273ad6484f5', '1b57c390-3bf6-4161-8e5f-131493850684', '4x8 70kg', false, NULL, 0),
	('296e6fa3-0db0-496f-a2a1-fdc6f10ad562', '22f14f09-30bf-4cc9-b7bf-8225b6672eec', '4x12 35kg', false, NULL, 0),
	('2ae9a406-fb69-4cf9-8b9e-9483bbbd7c19', '9eb968b8-1db5-4992-a2ba-1fd8fa17ffa1', '1x5 10kg; 1x4 20kg; 2x3 30kg', false, NULL, 0),
	('f83ad120-10df-4364-bc8b-bcf56a9fd9fe', 'd5e6178a-c024-4903-a120-d4cf3e47e007', '3 sets of 8 reps (52 kg)', false, NULL, 5);


--
-- Data for Name: training_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."training_sessions" ("id", "user_id", "completed_at", "exercises", "notes", "liked") VALUES
	('1d7fc2eb-d547-45c5-bb48-b605af66dd44', 'c3297b62-9eca-4f06-ba5a-32d490c35039', '2026-05-19 18:13:48.835+00', '[{"id": "4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00", "name": "Progressione Push-up (Forza e Spinta)", "type": "exercise", "step_lable": "Kneeling push-ups: 3 serie da 8 reps"}, {"id": "93ea6b66-af0d-4113-a573-2692624d9dd1", "name": "Tirata e Dorsali (Variante senza Sbarra)", "type": "exercise", "step_label": "Rematore con manubri (singolo o doppio): 3 serie da 10 reps"}, {"id": "1aa2b5e6-5884-41cc-9f20-a52ef526d3b1", "name": "Pistol Squat & Gambe (con sovraccarico)", "type": "exercise", "step_label": "Bulgarian Split Squat: 3 serie da 10 reps per gamba"}, {"id": "b367735e-f30b-4520-b5f1-5a542e5e4f87", "name": "Hollow Body Hold (Core Reattivo Avanzato)", "type": "exercise", "step_label": "Hollow hold completo (corpo libero): 3 serie da 40 sec"}, {"id": "3cf8631d-9586-4c3e-baa7-1559ee792ee0", "name": "Plank (Stabilità e Sovraccarico)", "type": "exercise", "step_label": "Plank standard: 3 serie da 45 sec"}, {"id": "a695d693-b89c-443a-96e4-5f46360db901", "name": "Burpees (Condizionamento e Potenza)", "type": "exercise", "step_label": "Burpees lenti senza salto: 10 reps"}]', NULL, false),
	('6add7a15-4a15-4348-973e-7fc4abb0fc12', 'c3297b62-9eca-4f06-ba5a-32d490c35039', '2026-05-17 11:19:25.897+00', '[{"id": "4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00", "name": "Progressione Push-up (Forza e Spinta)", "type": "exercise", "step_label": "Kneeling push-ups: 3 serie da 8 reps"}, {"id": "93ea6b66-af0d-4113-a573-2692624d9dd1", "name": "Tirata e Dorsali (Variante senza Sbarra)", "type": "exercise", "step_label": "Rematore con manubri (singolo o doppio): 3 serie da 10 reps"}, {"id": "1aa2b5e6-5884-41cc-9f20-a52ef526d3b1", "name": "Pistol Squat & Gambe (con sovraccarico)", "type": "exercise", "step_label": "Bulgarian Split Squat: 3 serie da 10 reps per gamba"}, {"id": "b367735e-f30b-4520-b5f1-5a542e5e4f87", "name": "Hollow Body Hold (Core Reattivo Avanzato)", "type": "exercise", "step_label": "Hollow hold completo (corpo libero): 3 serie da 40 sec"}, {"id": "3cf8631d-9586-4c3e-baa7-1559ee792ee0", "name": "Plank (Stabilità e Sovraccarico)", "type": "exercise", "step_label": "Plank standard: 3 serie da 45 sec"}, {"id": "a695d693-b89c-443a-96e4-5f46360db901", "name": "Burpees (Condizionamento e Potenza)", "type": "exercise", "step_label": "Burpees lenti senza salto: 10 reps"}]', NULL, false),
	('5a6635b6-8b45-447b-8acb-3269e7306558', 'c3297b62-9eca-4f06-ba5a-32d490c35039', '2026-05-17 08:12:41.742+00', '[{"id": "4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00", "name": "Progressione Push-up (Forza e Spinta)", "type": "exercise", "step_label": "Kneeling push-ups: 3 serie da 5 reps"}, {"id": "93ea6b66-af0d-4113-a573-2692624d9dd1", "name": "Tirata e Dorsali (Variante senza Sbarra)", "type": "exercise", "step_label": "Rematore con manubri (singolo o doppio): 3 serie da 10 reps"}, {"id": "1aa2b5e6-5884-41cc-9f20-a52ef526d3b1", "name": "Pistol Squat & Gambe (con sovraccarico)", "type": "exercise", "step_label": "Bulgarian Split Squat: 3 serie da 10 reps per gamba"}, {"id": "b367735e-f30b-4520-b5f1-5a542e5e4f87", "name": "Hollow Body Hold (Core Reattivo Avanzato)", "type": "exercise", "step_label": "Hollow hold completo (corpo libero): 3 serie da 40 sec"}, {"id": "3cf8631d-9586-4c3e-baa7-1559ee792ee0", "name": "Plank (Stabilità e Sovraccarico)", "type": "exercise", "step_label": "Plank standard: 3 serie da 45 sec"}, {"id": "a695d693-b89c-443a-96e4-5f46360db901", "name": "Burpees (Condizionamento e Potenza)", "type": "exercise", "step_label": "Squat thrust (senza salto): 10 reps"}]', NULL, false),
	('f624762d-52d2-4caa-b05b-d0da4f93e98b', 'c3297b62-9eca-4f06-ba5a-32d490c35039', '2026-05-16 14:31:14.72+00', '[{"id": "4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00", "name": "Progressione Push-up (Forza e Spinta)", "type": "exercise", "step_label": "Kneeling push-ups: 3 serie da 5 reps"}, {"id": "93ea6b66-af0d-4113-a573-2692624d9dd1", "name": "Tirata e Dorsali (Variante senza Sbarra)", "type": "exercise", "step_label": "Rematore con manubri (singolo o doppio): 3 serie da 10 reps"}, {"id": "1aa2b5e6-5884-41cc-9f20-a52ef526d3b1", "name": "Pistol Squat & Gambe (con sovraccarico)", "type": "exercise", "step_label": "Bulgarian Split Squat: 3 serie da 10 reps per gamba"}, {"id": "b367735e-f30b-4520-b5f1-5a542e5e4f87", "name": "Hollow Body Hold (Core Reattivo Avanzato)", "type": "exercise", "step_label": "Hollow hold completo (corpo libero): 3 serie da 40 sec"}, {"id": "3cf8631d-9586-4c3e-baa7-1559ee792ee0", "name": "Plank (Stabilità e Sovraccarico)", "type": "exercise", "step_label": "Plank standard: 3 serie da 45 sec"}, {"id": "a695d693-b89c-443a-96e4-5f46360db901", "name": "Burpees (Condizionamento e Potenza)", "type": "exercise", "step_label": "Squat thrust (senza salto): 10 reps"}]', NULL, false),
	('dd05eda0-7d53-4c5f-8572-cb9c74580345', 'c3297b62-9eca-4f06-ba5a-32d490c35039', '2026-05-16 10:59:53.349+00', '[{"id": "4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00", "name": "Progressione Push-up (Forza e Spinta)", "step_label": "Kneeling push-ups: 3 serie da 5 reps"}, {"id": "93ea6b66-af0d-4113-a573-2692624d9dd1", "name": "Tirata e Dorsali (Variante senza Sbarra)", "step_label": "Rematore con manubri (singolo o doppio): 3 serie da 10 reps"}, {"id": "b367735e-f30b-4520-b5f1-5a542e5e4f87", "name": "Hollow Body Hold (Core Reattivo Avanzato)", "step_label": "Hollow hold completo (corpo libero): 3 serie da 40 sec"}, {"id": "3cf8631d-9586-4c3e-baa7-1559ee792ee0", "name": "Plank (Stabilità e Sovraccarico)", "step_label": "Plank standard: 3 serie da 45 sec"}]', NULL, false),
	('6e14673c-ebf5-4c34-8456-444f5ca7a097', 'daaaf367-185c-43c5-965d-1e1cb4999e97', '2026-06-03 17:20:31.362582+00', '[{"id": "d5e6178a-c024-4903-a120-d4cf3e47e007", "name": "Squats", "type": "exercise"}, {"id": "86b20fc3-1259-450a-9d7a-1fc14723e008", "name": "Calf Raises", "type": "exercise"}]', NULL, false),
	('32ef3d8c-ffad-4f38-9aad-44ead0d176d5', 'a54ff891-421c-4086-b3ad-f1021632c312', '2026-06-10 15:27:20.07311+00', '[{"id": "f1b97a4c-b96f-4097-9fde-d6e8f8061bec", "name": "Leg Press", "type": "exercise", "logged_sets": [{"reps": 8, "completed": true, "set_index": 0}, {"reps": 8, "completed": true, "set_index": 1}, {"reps": 8, "completed": true, "set_index": 2}, {"reps": 8, "completed": true, "set_index": 3}]}, {"id": "5a73dfa1-8818-42e8-9e47-adc35b9af1c1", "name": "Leg curl", "type": "exercise", "logged_sets": [{"reps": 8, "completed": true, "set_index": 0}, {"reps": 8, "completed": true, "set_index": 1}, {"reps": 8, "completed": true, "set_index": 2}, {"reps": 8, "completed": true, "set_index": 3}]}, {"id": "22f14f09-30bf-4cc9-b7bf-8225b6672eec", "name": "Calf raises", "type": "exercise", "logged_sets": [{"reps": 12, "completed": true, "set_index": 0}, {"reps": 12, "completed": true, "set_index": 1}, {"reps": 12, "completed": true, "set_index": 2}, {"reps": 12, "completed": true, "set_index": 3}]}, {"id": "5840a6cd-0391-454e-8074-c73c537cf1a9", "name": "Affondi con sacco", "type": "exercise", "logged_sets": [{"reps": 10, "completed": true, "set_index": 0}, {"reps": 10, "completed": true, "set_index": 1}, {"reps": 10, "completed": true, "set_index": 2}]}]', NULL, false),
	('f2037aa9-5f9d-4a8f-a502-1e1e70e518a9', 'daaaf367-185c-43c5-965d-1e1cb4999e97', '2026-06-10 18:08:36.221263+00', '[{"id": "b2a8d167-27b2-4d2b-bb6a-df181829e001", "name": "Push-Ups", "type": "exercise", "logged_sets": [{"reps": 8, "completed": true, "set_index": 0}, {"reps": 8, "completed": true, "set_index": 1}, {"reps": 8, "completed": true, "set_index": 2}]}, {"id": "c7e8490a-fbbf-4375-971c-30c8bb26d002", "name": "Pull-Ups", "type": "exercise", "logged_sets": [{"reps": 2, "completed": true, "set_index": 0}, {"reps": 2, "completed": true, "set_index": 1}, {"reps": 2, "completed": true, "set_index": 2}]}]', NULL, false),
	('c68cc14f-989e-489b-ac1b-efb1641d33f7', 'daaaf367-185c-43c5-965d-1e1cb4999e97', '2026-05-25 12:00:36.615553+00', '[{"id": "b2a8d167-27b2-4d2b-bb6a-df181829e001", "name": "Push-Ups", "type": "exercise"}, {"id": "c7e8490a-fbbf-4375-971c-30c8bb26d002", "name": "Pull-Ups", "type": "exercise"}, {"id": "a12b93cf-8d4e-4f04-877a-e490fc68b004", "name": "Hollow Body Hold", "type": "exercise"}, {"id": "e39c8412-110f-48db-84b2-cb7db301a005", "name": "Flying Leg Raises", "type": "exercise"}]', NULL, false),
	('440be14f-1566-43bb-92d1-af60cc3987a4', 'daaaf367-185c-43c5-965d-1e1cb4999e97', '2026-05-27 18:56:43.785193+00', '[{"id": "e39c8412-110f-48db-84b2-cb7db301a005", "name": "Flying Leg Raises", "type": "exercise"}, {"id": "f4b6d81a-63d1-4cb7-bc91-236b5cc0e003", "name": "American Pull-Ups", "type": "exercise"}, {"id": "c7e8490a-fbbf-4375-971c-30c8bb26d002", "name": "Pull-Ups", "type": "exercise"}]', NULL, false),
	('7efc9ccb-177a-44ff-8c26-960308405984', 'daaaf367-185c-43c5-965d-1e1cb4999e97', '2026-05-31 13:34:04.868116+00', '[{"id": "e39c8412-110f-48db-84b2-cb7db301a005", "name": "Flying Leg Raises", "type": "exercise"}, {"id": "a12b93cf-8d4e-4f04-877a-e490fc68b004", "name": "Hollow Body Hold", "type": "exercise"}, {"id": "c7e8490a-fbbf-4375-971c-30c8bb26d002", "name": "Pull-Ups", "type": "exercise"}, {"id": "f4b6d81a-63d1-4cb7-bc91-236b5cc0e003", "name": "American Pull-Ups", "type": "exercise"}]', NULL, false);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 71, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict MsKyGJdOwlNKSEQqgrwxcCcWEgVdXLvEmKST2uDTjC1W3UckdOH44xyFxAEUbFw

RESET ALL;
