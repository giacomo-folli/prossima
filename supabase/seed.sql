-- Deterministic local-only fixtures used by policy and browser tests.
-- These credentials are intentionally public and must never be used outside the
-- disposable Supabase stack created by `pnpm db:start` / `pnpm db:reset`.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'owner-a@prossima.test',
    extensions.crypt('Prossima-test-1', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Owner A"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'owner-b@prossima.test',
    extensions.crypt('Prossima-test-2', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Owner B"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    '{"sub":"11111111-1111-4111-8111-111111111111","email":"owner-a@prossima.test"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    '{"sub":"22222222-2222-4222-8222-222222222222","email":"owner-b@prossima.test"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  );

insert into public.exercises (id, user_id, name, icon, type, current_step_index)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'Fixture Owner A',
    'dumbbell',
    'exercise',
    0
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'Fixture Owner B',
    'dumbbell',
    'exercise',
    0
  );

insert into public.steps (
  id,
  exercise_id,
  description,
  completed,
  completed_at,
  step_index
)
values
  (
    'aaaaaaaa-0000-4000-8000-000000000001',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '3 serie da 5 ripetizioni',
    false,
    null,
    0
  ),
  (
    'bbbbbbbb-0000-4000-8000-000000000001',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '3 serie da 8 ripetizioni',
    false,
    null,
    0
  );

-- -- Insert into the auth table first to satisfy the foreign key constraint
-- -- INSERT INTO auth.users (id, email) VALUES ('87f763b2-03ee-4421-bf22-00d753dc8fb8', 'giacomofolli01@gmail.com');

-- -- Now your original insert will work perfectly
-- -- INSERT INTO profiles (id, display_name, full_name, email) 
-- -- VALUES ('87f763b2-03ee-4421-bf22-00d753dc8fb8', 'Lilli', 'Alice Chiozza', 'alice.chiozza@gmail.com');

-- -- Seed data for exercises
-- -- INSERT INTO exercises (id, user_id, name, type, current_step_index) VALUES ('1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', '87f763b2-03ee-4421-bf22-00d753dc8fb8', 'Pistol Squat', 'exercise', 0);
-- -- INSERT INTO exercises (id, user_id, name, type, current_step_index) VALUES ('3cf8631d-9586-4c3e-baa7-1559ee792ee0', '87f763b2-03ee-4421-bf22-00d753dc8fb8', 'Plank', 'exercise', 0);
-- -- INSERT INTO exercises (id, user_id, name, type, current_step_index) VALUES ('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', '87f763b2-03ee-4421-bf22-00d753dc8fb8', 'Push-up', 'exercise', 0);
-- -- INSERT INTO exercises (id, user_id, name, type, current_step_index) VALUES ('93ea6b66-af0d-4113-a573-2692624d9dd1', '87f763b2-03ee-4421-bf22-00d753dc8fb8', 'Tirata e Dorsali', 'exercise', 0);
-- -- INSERT INTO exercises (id, user_id, name, type, current_step_index) VALUES ('a695d693-b89c-443a-96e4-5f46360db901', '87f763b2-03ee-4421-bf22-00d753dc8fb8', 'Burpees', 'exercise', 0);
-- -- INSERT INTO exercises (id, user_id, name, type, current_step_index) VALUES ('b367735e-f30b-4520-b5f1-5a542e5e4f87', '87f763b2-03ee-4421-bf22-00d753dc8fb8', 'Hollow Body Hold', 'exercise', 0);

-- -- Seed data for exercise steps
-- -- Push-up
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 0, 'Kneeling push-ups: 3 serie da 5 reps', TRUE, '2026-05-17 10:27:21.200');
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 1, 'Kneeling push-ups: 3 serie da 8 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 2, 'Floor Press con manubri (pesanti): 3 serie da 8 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 3, 'Kneeling push-ups: 3 serie da 12 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 4, 'Push-ups completi (eccentrica lenta, 4 sec a scendere): 3 serie da 4 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 5, 'Incline push-ups (mani su rialzo basso): 3 serie da 8 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 6, 'Push-ups completi standard: 3 serie da 5 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 7, 'Push-ups completi standard: 3 serie da 8 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 8, 'Push-ups completi con zavorra (es. zaino con pesi): 3 serie da 6 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00', 9, 'Target raggiunto: 1 serie da 12 Push-ups completi standard', FALSE, NULL);

-- -- Tirata e Dorsali
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('93ea6b66-af0d-4113-a573-2692624d9dd1', 0, 'Rematore con manubri (singolo o doppio): 3 serie da 10 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('93ea6b66-af0d-4113-a573-2692624d9dd1', 1, 'Rematore invertito sotto il tavolo (gambe piegate): 3 serie da 8 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('93ea6b66-af0d-4113-a573-2692624d9dd1', 2, 'Rematore con manubri (incrementando il peso): 3 serie da 8 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('93ea6b66-af0d-4113-a573-2692624d9dd1', 3, 'Towel Door Rows (rematore alla porta con asciugamano): 3 serie da 12 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('93ea6b66-af0d-4113-a573-2692624d9dd1', 4, 'Rematore invertito sotto il tavolo (gambe tese): 3 serie da 8 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('93ea6b66-af0d-4113-a573-2692624d9dd1', 5, 'Pullover con manubrio (su panca o pavimento): 3 serie da 10 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('93ea6b66-af0d-4113-a573-2692624d9dd1', 6, 'Rematore invertito sotto il tavolo (piedi su sedia/rialzo): 3 serie da 6 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('93ea6b66-af0d-4113-a573-2692624d9dd1', 7, 'Rematore con manubri pesante (carico vicino al peso corporeo totale diviso due): 3 serie da 6 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('93ea6b66-af0d-4113-a573-2692624d9dd1', 8, 'Target raggiunto: 3 serie da 10 reps di Rematore invertito a gambe tese', FALSE, NULL);

-- -- Pistol Squat
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 0, 'Bulgarian Split Squat: 3 serie da 10 reps per gamba', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 1, 'Bulgarian Split Squat con manubri: 3 serie da 8 reps per gamba', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 2, 'Step-up alti con manubri: 3 serie da 8 reps per gamba', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 3, 'Discesa eccentrica su una gamba (fino a terra): 3 serie da 5 reps per gamba', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 4, 'Pistol squat assistito (appoggio mano leggero): 3 serie da 6 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 5, 'Pistol squat su box (gamba libera esterna): 3 serie da 5 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 6, 'Pistol squat con contrappeso avanti (manubrio leggero 4-6kg): 3 serie da 5 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 7, 'Pistol squat con tallone rialzato: 3 serie da 3 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('1aa2b5e6-5884-41cc-9f20-a52ef526d3b1', 8, 'Target raggiunto: 1 Pistol Squat completo a corpo libero', FALSE, NULL);

-- -- Hollow Body Hold
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('b367735e-f30b-4520-b5f1-5a542e5e4f87', 0, 'Hollow hold completo (corpo libero): 3 serie da 40 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('b367735e-f30b-4520-b5f1-5a542e5e4f87', 1, 'Hollow hold completo (corpo libero): 3 serie da 50 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('b367735e-f30b-4520-b5f1-5a542e5e4f87', 2, 'Hollow hold completo (corpo libero): 2 serie da 60 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('b367735e-f30b-4520-b5f1-5a542e5e4f87', 3, 'Hollow hold con manubrio leggero tra le mani (1-3kg, braccia tese dietro): 3 serie da 30 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('b367735e-f30b-4520-b5f1-5a542e5e4f87', 4, 'Hollow hold con cavigliere pesanti (o piccolo peso tra i piedi): 3 serie da 30 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('b367735e-f30b-4520-b5f1-5a542e5e4f87', 5, 'Hollow Rock (oscillazioni in posizione di hollow hold): 3 serie da 20 oscillazioni', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('b367735e-f30b-4520-b5f1-5a542e5e4f87', 6, 'Hollow hold con sovraccarico combinato (manubrio + cavigliere): 3 serie da 30 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('b367735e-f30b-4520-b5f1-5a542e5e4f87', 7, 'Hollow hold completo (corpo libero): 2 serie da 80 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('b367735e-f30b-4520-b5f1-5a542e5e4f87', 8, 'Hollow hold completo (corpo libero): 2 serie da 100 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('b367735e-f30b-4520-b5f1-5a542e5e4f87', 9, 'Target raggiunto: 2 minuti ininterrotti a corpo libero', FALSE, NULL);

-- -- Plank
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('3cf8631d-9586-4c3e-baa7-1559ee792ee0', 0, 'Plank standard: 3 serie da 45 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('3cf8631d-9586-4c3e-baa7-1559ee792ee0', 1, 'Plank standard: 3 serie da 60 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('3cf8631d-9586-4c3e-baa7-1559ee792ee0', 2, 'Plank con shoulder taps: 3 serie da 16 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('3cf8631d-9586-4c3e-baa7-1559ee792ee0', 3, 'Plank standard con zavorra sulla schiena (disco o zaino): 3 serie da 45 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('3cf8631d-9586-4c3e-baa7-1559ee792ee0', 4, 'Plank a 3 appoggi (sollevando una gamba alternata): 3 serie da 45 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('3cf8631d-9586-4c3e-baa7-1559ee792ee0', 5, 'Plank standard con zavorra aumentata: 3 serie da 60 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('3cf8631d-9586-4c3e-baa7-1559ee792ee0', 6, 'Plank standard: 2 serie da 90 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('3cf8631d-9586-4c3e-baa7-1559ee792ee0', 7, 'Plank RKC (contrazione massima attiva): 3 serie da 20 sec', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('3cf8631d-9586-4c3e-baa7-1559ee792ee0', 8, 'Target raggiunto: Plank standard con zavorra (es. 10kg) per 60 secondi', FALSE, NULL);

-- -- Burpees
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('a695d693-b89c-443a-96e4-5f46360db901', 0, 'Squat thrust (senza salto): 10 reps', TRUE, '2026-05-17 10:53:45.211');
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('a695d693-b89c-443a-96e4-5f46360db901', 1, 'Burpees lenti senza salto: 10 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('a695d693-b89c-443a-96e4-5f46360db901', 2, 'Burpees lenti con salto: 10 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('a695d693-b89c-443a-96e4-5f46360db901', 3, '5 Burpees veloci: max velocità', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('a695d693-b89c-443a-96e4-5f46360db901', 4, '8 Burpees in 45 secondi', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('a695d693-b89c-443a-96e4-5f46360db901', 5, 'Burpees con manubri leggeri in mano (es. 2-3kg, eliminando il salto in alto): 3 serie da 6 reps', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('a695d693-b89c-443a-96e4-5f46360db901', 6, '12 Burpees in 60 secondi', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('a695d693-b89c-443a-96e4-5f46360db901', 7, '2 serie da 8 Burpees con gilet zavorrato o zaino leggero (30 sec riposo)', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('a695d693-b89c-443a-96e4-5f46360db901', 8, '14 Burpees in 60 secondi', FALSE, NULL);
-- -- INSERT INTO steps (exercise_id, step_index, description, completed, completed_at) VALUES ('a695d693-b89c-443a-96e4-5f46360db901', 9, 'Target raggiunto: 15 Burpees in 1 minuto a corpo libero', FALSE, NULL);

-- -- 2. Insert the seed data
-- INSERT INTO training_sessions (user_id, completed_at, exercises) VALUES
-- (
--     '87f763b2-03ee-4421-bf22-00d753dc8fb8', 
--     '2026-05-19T18:13:48.835Z', 
--     $$[
--         {"id": "4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00", "name": "Progressione Push-up (Forza e Spinta)", "step_lable": "Kneeling push-ups: 3 serie da 8 reps", "type": "exercise"},
--         {"id": "93ea6b66-af0d-4113-a573-2692624d9dd1", "name": "Tirata e Dorsali (Variante senza Sbarra)", "step_label": "Rematore con manubri (singolo o doppio): 3 serie da 10 reps", "type": "exercise"},
--         {"id": "1aa2b5e6-5884-41cc-9f20-a52ef526d3b1", "name": "Pistol Squat & Gambe (con sovraccarico)", "step_label": "Bulgarian Split Squat: 3 serie da 10 reps per gamba", "type": "exercise"},
--         {"id": "b367735e-f30b-4520-b5f1-5a542e5e4f87", "name": "Hollow Body Hold (Core Reattivo Avanzato)", "step_label": "Hollow hold completo (corpo libero): 3 serie da 40 sec", "type": "exercise"},
--         {"id": "3cf8631d-9586-4c3e-baa7-1559ee792ee0", "name": "Plank (Stabilità e Sovraccarico)", "step_label": "Plank standard: 3 serie da 45 sec", "type": "exercise"},
--         {"id": "a695d693-b89c-443a-96e4-5f46360db901", "name": "Burpees (Condizionamento e Potenza)", "step_label": "Burpees lenti senza salto: 10 reps", "type": "exercise"}
--     ]$$
-- ),
-- (
--     '87f763b2-03ee-4421-bf22-00d753dc8fb8', 
--     '2026-05-17T11:19:25.897Z', 
--     $$[
--         {"id": "4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00", "name": "Progressione Push-up (Forza e Spinta)", "step_label": "Kneeling push-ups: 3 serie da 8 reps", "type": "exercise"},
--         {"id": "93ea6b66-af0d-4113-a573-2692624d9dd1", "name": "Tirata e Dorsali (Variante senza Sbarra)", "step_label": "Rematore con manubri (singolo o doppio): 3 serie da 10 reps", "type": "exercise"},
--         {"id": "1aa2b5e6-5884-41cc-9f20-a52ef526d3b1", "name": "Pistol Squat & Gambe (con sovraccarico)", "step_label": "Bulgarian Split Squat: 3 serie da 10 reps per gamba", "type": "exercise"},
--         {"id": "b367735e-f30b-4520-b5f1-5a542e5e4f87", "name": "Hollow Body Hold (Core Reattivo Avanzato)", "step_label": "Hollow hold completo (corpo libero): 3 serie da 40 sec", "type": "exercise"},
--         {"id": "3cf8631d-9586-4c3e-baa7-1559ee792ee0", "name": "Plank (Stabilità e Sovraccarico)", "step_label": "Plank standard: 3 serie da 45 sec", "type": "exercise"},
--         {"id": "a695d693-b89c-443a-96e4-5f46360db901", "name": "Burpees (Condizionamento e Potenza)", "step_label": "Burpees lenti senza salto: 10 reps", "type": "exercise"}
--     ]$$
-- ),
-- (
--     '87f763b2-03ee-4421-bf22-00d753dc8fb8', 
--     '2026-05-17T08:12:41.742Z', 
--     $$[
--         {"id": "4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00", "name": "Progressione Push-up (Forza e Spinta)", "step_label": "Kneeling push-ups: 3 serie da 5 reps", "type": "exercise"},
--         {"id": "93ea6b66-af0d-4113-a573-2692624d9dd1", "name": "Tirata e Dorsali (Variante senza Sbarra)", "step_label": "Rematore con manubri (singolo o doppio): 3 serie da 10 reps", "type": "exercise"},
--         {"id": "1aa2b5e6-5884-41cc-9f20-a52ef526d3b1", "name": "Pistol Squat & Gambe (con sovraccarico)", "step_label": "Bulgarian Split Squat: 3 serie da 10 reps per gamba", "type": "exercise"},
--         {"id": "b367735e-f30b-4520-b5f1-5a542e5e4f87", "name": "Hollow Body Hold (Core Reattivo Avanzato)", "step_label": "Hollow hold completo (corpo libero): 3 serie da 40 sec", "type": "exercise"},
--         {"id": "3cf8631d-9586-4c3e-baa7-1559ee792ee0", "name": "Plank (Stabilità e Sovraccarico)", "step_label": "Plank standard: 3 serie da 45 sec", "type": "exercise"},
--         {"id": "a695d693-b89c-443a-96e4-5f46360db901", "name": "Burpees (Condizionamento e Potenza)", "step_label": "Squat thrust (senza salto): 10 reps", "type": "exercise"}
--     ]$$
-- ),
-- (
--     '87f763b2-03ee-4421-bf22-00d753dc8fb8', 
--     '2026-05-16T14:31:14.720Z', 
--     $$[
--         {"id": "4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00", "name": "Progressione Push-up (Forza e Spinta)", "step_label": "Kneeling push-ups: 3 serie da 5 reps", "type": "exercise"},
--         {"id": "93ea6b66-af0d-4113-a573-2692624d9dd1", "name": "Tirata e Dorsali (Variante senza Sbarra)", "step_label": "Rematore con manubri (singolo o doppio): 3 serie da 10 reps", "type": "exercise"},
--         {"id": "1aa2b5e6-5884-41cc-9f20-a52ef526d3b1", "name": "Pistol Squat & Gambe (con sovraccarico)", "step_label": "Bulgarian Split Squat: 3 serie da 10 reps per gamba", "type": "exercise"},
--         {"id": "b367735e-f30b-4520-b5f1-5a542e5e4f87", "name": "Hollow Body Hold (Core Reattivo Avanzato)", "step_label": "Hollow hold completo (corpo libero): 3 serie da 40 sec", "type": "exercise"},
--         {"id": "3cf8631d-9586-4c3e-baa7-1559ee792ee0", "name": "Plank (Stabilità e Sovraccarico)", "step_label": "Plank standard: 3 serie da 45 sec", "type": "exercise"},
--         {"id": "a695d693-b89c-443a-96e4-5f46360db901", "name": "Burpees (Condizionamento e Potenza)", "step_label": "Squat thrust (senza salto): 10 reps", "type": "exercise"}
--     ]$$
-- ),
-- (
--     '87f763b2-03ee-4421-bf22-00d753dc8fb8', 
--     '2026-05-16T10:59:53.349Z', 
--     $$[
--         {"id": "4a6871bb-4b22-4dee-9e6f-6cd1f7c37f00", "name": "Progressione Push-up (Forza e Spinta)", "step_label": "Kneeling push-ups: 3 serie da 5 reps"},
--         {"id": "93ea6b66-af0d-4113-a573-2692624d9dd1", "name": "Tirata e Dorsali (Variante senza Sbarra)", "step_label": "Rematore con manubri (singolo o doppio): 3 serie da 10 reps"},
--         {"id": "b367735e-f30b-4520-b5f1-5a542e5e4f87", "name": "Hollow Body Hold (Core Reattivo Avanzato)", "step_label": "Hollow hold completo (corpo libero): 3 serie da 40 sec"},
--         {"id": "3cf8631d-9586-4c3e-baa7-1559ee792ee0", "name": "Plank (Stabilità e Sovraccarico)", "step_label": "Plank standard: 3 serie da 45 sec"}
--     ]$$
-- );
