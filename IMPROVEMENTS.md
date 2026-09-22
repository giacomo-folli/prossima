# Prossima implementation backlog

This document is the source of truth for the improvements identified in the
product and codebase review. It replaces the earlier findings-only document
with an ordered, implementation-ready backlog.

The central product change is to make plan progression and workout logging one
coherent workflow. Completing a workout must save what the user actually did
and, in the same committed operation, record the user's progression decision.

## How to use this document

- Treat each task's `Depends on` field as authoritative. Milestones describe
  outcome groups; a shared foundation task may be pulled forward when a later
  milestone depends on it.
- Keep task IDs in pull-request titles and commits. One pull request should
  contain only a small, reviewable set of tightly related tasks.
- Check a task only after all of its implementation and acceptance checkboxes
  pass.
- Add newly discovered work beneath the task that exposed it. Do not silently
  expand scope in code.
- Migrations that may already have run must be corrected with a new migration;
  do not edit an applied migration.

Status markers:

- `[ ]` not started
- `[-]` in progress
- `[x]` complete and verified
- `[!]` blocked; add the blocker and owner on the following line

## Current baseline

Verified on 2026-09-02:

- `pnpm check` passes with 0 errors and 4 warnings. One warning is an empty
  heading in `AiRecapDrawer.svelte`; three are missing standard `appearance`
  declarations.
- `pnpm build` passes. Workbox reports that
  `prerendered/**/*.html` matches no files.
- No automated unit, module, browser, accessibility, worker, or database-policy
  tests are present.
- Deployment runs a locked install and production build only. It does not run
  `pnpm check`, tests, migration validation, or smoke tests.

## Product and technical **decisions**

These decisions remove ambiguity from the backlog. Change one only through a
documented decision and update every dependent task before implementation.

1. **Feed:** remove the cross-user feed and `get_admin_sessions` RPC for now.
   A future community feature requires an explicit sharing and consent design.
2. **Language:** Italian is the primary UI language. Persisted enum values and
   code identifiers remain English; all user-facing copy and errors are Italian.
3. **Progression:** progression changes happen during workout review. The user
   explicitly chooses `repeat`, `advance`, `regress`, or `manual`. A
   recommendation may preselect a choice but never commits it automatically.
4. **History:** completed workouts are immutable snapshots of the target and
   actual performance. Editing session metadata does not rewrite the plan that
   was active at completion.
5. **Storage model:** normalize workouts, workout exercises, and performed sets.
   Retain a versioned JSON snapshot on each completed workout for durable
   historical rendering and export.
6. **Offline scope:** ship an installable, online-first PWA first. Workout drafts
   survive refresh, suspension, and app restarts, but final completion requires
   a connection. A visible offline outbox is a later, separate task.
7. **AI:** AI features are optional enhancements. They stay disabled in
   production until the worker is authenticated, bounded, and disclosed.
8. **Analytics:** store instants in UTC and derive calendar days in the user's
   IANA timezone. Default to the browser timezone until the user chooses one.
9. **Compatibility:** migrate readable legacy data. Unparseable progression
   descriptions are flagged for review and are never converted silently to
   `3 x 10`.
10. **Quick exercises:** remove `quick exercise` as a separate domain type.
    Migrate each one to a plan exercise with `completion` measurement and one
    repeatable set. “Quick” may remain a UI filter or template label only.

## Target domain model

Use these terms consistently in schema, TypeScript, UI copy, tests, and
analytics:

- **Training plan:** the active ordered collection of exercise prescriptions.
- **Exercise definition:** stable exercise identity and metadata such as name,
  movement, equipment, instructions, and media.
- **Plan exercise:** an exercise definition placed in a plan, with ordering and
  progression levels.
- **Progression level:** one structured target prescription the user can work
  at. This replaces the current overloaded `Step` concept.
- **Workout draft:** an in-progress attempt derived from a versioned plan
  snapshot.
- **Completed workout:** a committed workout with immutable target snapshots,
  performed exercises, performed sets, and optional notes.
- **Progression decision:** `repeat`, `advance`, `regress`, or `manual`, recorded
  against a completed workout and reversible through an audit event.
- **Performed set:** observed reps, duration, distance, load, completion, and
  optional RPE/RIR or pain flag.

`completed` must not be reused across unrelated concepts. Use explicit fields
such as `workout.status`, `performed_set.is_completed`, and
`progression_event.decision`.

## Target module seams

Routes and Svelte stores must not coordinate database statement ordering or
interpret raw JSON. Put that behavior behind these deep module interfaces; the
interfaces are also the primary module-test surfaces.

```ts
interface PlanModule {
  getActive(): Promise<Result<TrainingPlan>>;
  previewImport(source: PlanSource): Promise<Result<PlanImportPreview>>;
  replace(command: ReplacePlan): Promise<Result<PlanChange>>;
  export(planId: PlanId): Promise<Result<PlanExport>>;
}

interface WorkoutModule {
  getActiveDraft(): Promise<Result<WorkoutDraft | null>>;
  start(command: StartWorkout): Promise<Result<WorkoutDraft>>;
  apply(command: DraftCommand): Promise<Result<WorkoutDraft>>;
  finish(command: FinishWorkout): Promise<Result<CompletedWorkout>>;
  discard(draftId: WorkoutId): Promise<Result<void>>;
}

interface HistoryModule {
  list(query: HistoryQuery): Promise<Result<HistoryPage>>;
  get(id: WorkoutId): Promise<Result<CompletedWorkout>>;
  updateMetadata(command: UpdateWorkoutMetadata): Promise<Result<CompletedWorkout>>;
  remove(id: WorkoutId): Promise<Result<void>>;
  clear(command: ClearHistory): Promise<Result<void>>;
}

interface ProgressReviewModule {
  summarize(range: DateRange): Promise<Result<ProgressSummary>>;
}
```

Implementation rules:

- Supabase and in-memory adapters make the persistence seam real. Module tests
  use the in-memory adapter; integration tests exercise the Supabase adapter.
- Keep parsing, transaction ordering, retries, cache reconciliation, and raw
  table/JSON shapes inside the module implementation.
- Return typed results; do not return `null` or `boolean` for failures.
- Tests assert observable behavior through module interfaces rather than
  Supabase call sequences or private store state.
- Do not add pass-through wrappers. If deleting a module would not redistribute
  meaningful complexity into callers, deepen or remove it.

## Definition of done for every task

A task is complete only when all applicable statements are true:

- [ ] The implementation and all acceptance criteria in the task are complete.
- [ ] New external inputs are runtime-validated and no new `any` is introduced.
- [ ] Loading, empty, stale/offline, success, permission, and recoverable-error
  behavior is implemented where applicable.
- [ ] Mutations are awaited, prevent double submission, preserve user input on
  failure, and update local state only after a committed result.
- [ ] User-facing copy is Italian, actionable, and does not expose provider or
  database errors.
- [ ] Keyboard, screen-reader, touch-target, contrast, and reduced-motion
  behavior has been checked for changed UI.
- [ ] Relevant unit/module/integration/browser tests are added or updated.
- [ ] `pnpm check`, the relevant tests, and `pnpm build` pass locally.
- [ ] Schema, environment variables, operational behavior, and user-facing
  changes are documented where applicable.

---

# Milestone 0 — Stop trust and data-loss failures

Nothing in later milestones should be released until this milestone is done.

## [ ] SEC-001 — Remove cross-user workout access

**Priority:** P0
**Depends on:** ARCH-001
**Primary touchpoints:**
`supabase/migrations/20260610180900_create_admin_sessions_rpc.sql`, a new
Supabase migration, `src/routes/feed/+page.svelte`,
`src/routes/home/+page.svelte`

Implementation:

- [ ] Add a new migration that revokes execute on
  `public.get_admin_sessions()` from `PUBLIC`, `anon`, and `authenticated`, then
  drops the function.
- [ ] Remove the `/feed` route and every feed link/icon from normal navigation.
- [ ] Search for all direct and RPC reads of `training_sessions` and `profiles`;
  confirm they are scoped to `auth.uid()`.
- [ ] Add database authorization tests covering select, insert, update, and
  delete for two users across `profiles`, `exercises`, progression data, and
  workout data.
- [ ] Add an explicit denied test proving user A cannot retrieve user B's
  workout or profile through any remaining RPC/view.

Acceptance:

- [ ] `get_admin_sessions` is absent in a freshly migrated database.
- [ ] Requests made as `anon` or an ordinary authenticated user cannot read
  another user's private data.
- [ ] The built app contains no route or affordance for the removed feed.

Verification: database policy suite, route smoke test, `rg "get_admin_sessions|/feed"`.

## [ ] SEC-002 — Authenticate and bound the AI worker

**Priority:** P0
**Depends on:** ARCH-001
**Primary touchpoints:** `groq-worker/src/index.ts`,
`groq-worker/wrangler.toml`, `src/lib/groq.ts`, deployment secrets

Implementation:

- [ ] Require `Authorization: Bearer <Supabase access token>` and validate the
  token before parsing or forwarding a request.
- [ ] Allow only the exact production origin and an explicit development-origin
  list; remove the wildcard `*.github.io` rule.
- [ ] Include `Authorization` in allowed CORS headers and reject requests with a
  missing or unapproved `Origin`.
- [ ] Define one server-owned model, temperature range, response format, and
  maximum output-token limit. Remove client control of the model and hard cap
  all numeric options.
- [ ] Limit request bytes, prompt length, history item count, per-item length,
  and accepted content types before calling Groq.
- [ ] Add per-user and per-IP rate limiting with documented window and quota.
- [ ] Add an upstream timeout and cancellation. Retry only bounded, retryable
  failures and honor backoff without exceeding the total request deadline.
- [ ] Return stable public error codes such as `UNAUTHENTICATED`, `RATE_LIMITED`,
  `INVALID_REQUEST`, `UPSTREAM_TIMEOUT`, and `UPSTREAM_UNAVAILABLE`; do not
  return upstream messages.
- [ ] Log request ID, user ID hash, latency, response status, model, and token
  usage when available. Never log prompts, history, workout data, email, or raw
  tokens.
- [ ] Send the current Supabase token from `src/lib/groq.ts`; handle an expired
  session as a localized auth error.
- [ ] Keep production AI UI disabled behind configuration until this task and
  TRUST-002 are complete.
- [ ] Add worker tests for auth, origin, body limits, model override attempts,
  rate limiting, timeout, retry, stable errors, and streaming cancellation.

Acceptance:

- [ ] An invalid token, unapproved origin, oversized body, or unsupported option
  never reaches Groq.
- [ ] One user cannot exceed the configured quota.
- [ ] No response or log contains an upstream error detail or workout content.

Verification: `pnpm --dir groq-worker test` and deployed-worker smoke tests from
allowed and denied origins.

## [ ] TRUST-001 — Make existing mutations truthful

**Priority:** P0
**Depends on:** ARCH-001
**Primary touchpoints:** `src/lib/stores/sessions.ts`,
`src/lib/stores/exercises.ts`, `src/lib/utils/storage.ts`,
`src/lib/components/AddExerciseModal.svelte`,
`src/routes/settings/+page.svelte`, `src/routes/training/[id]/+page.svelte`

Implementation:

- [ ] Introduce a shared `Result<T, AppError>` type with stable error codes and
  optional retryability; convert touched persistence functions from
  `null`/`boolean` to this result.
- [ ] Remove the local-only fallback in `sessions.logSession`.
- [ ] Update session edit/delete/clear to change store state only after a
  successful database result.
- [ ] Fix `exercises.remove` so it returns and displays the real result.
- [ ] Await add-exercise submission; keep the modal and entered fields open on
  failure and disable repeat submission while saving.
- [ ] Replace native `confirm`/`alert` usage with the accessible confirmation and
  notification UI delivered in UX-001, or add a minimal accessible version here
  and consolidate it in UX-001.
- [ ] Persist progression reset through a transaction/RPC; do not clear only the
  Svelte store.
- [ ] Require explicit text confirmation for clearing all workout history.
- [ ] Add `pending` and error UI to every touched mutation.

Acceptance:

- [ ] A failed create, edit, delete, reset, or clear leaves local and remote data
  unchanged and explains how to retry.
- [ ] Reloading after a confirmed action shows the same state.
- [ ] Double-clicking a pending action does not duplicate or repeat it.

Verification: module/interaction tests with forced database failures and a
manual reload after each destructive action.

## [ ] TRUST-002 — Remove unsafe release copy and disclose data flows

**Priority:** P0
**Depends on:** ARCH-001
**Primary touchpoints:** `src/routes/settings/+page.svelte`,
`src/routes/auth/+page.svelte`, new terms/privacy/support routes,
`src/hooks.client.ts`, PostHog configuration

Implementation:

- [ ] Remove the offensive placeholder support alert immediately.
- [ ] Add a real support destination or remove the support row until one exists.
- [ ] Add and link Terms and Privacy pages from authentication and Settings.
- [ ] Document what workout/profile data Supabase stores, what AI sends to Groq,
  what PostHog captures, retention periods, deletion behavior, and support
  contact.
- [ ] Decide the lawful consent/opt-out behavior with the product owner. Record
  the approved choice and effective date in the repository.
- [ ] Disable PostHog autocapture and exception payload fields that can include
  form values, URLs with private data, workout content, or email.
- [ ] Stop identifying analytics users by email; use the opaque auth user ID if
  identification is necessary.
- [ ] Add Analytics and AI controls in Settings when consent or opt-out is
  required; make defaults match the approved policy.
- [ ] Wire account/history deletion behavior to the published policy.

Acceptance:

- [ ] Every legal/support link resolves in the production base path.
- [ ] A user can understand and control optional third-party processing before
  data is sent.
- [ ] No placeholder, discriminatory, or undisclosed tracking content ships.

Verification: broken-link test, analytics event inspection, policy-owner signoff.

## [ ] BUG-001 — Repair current session snapshot and notes behavior

**Priority:** P0
**Depends on:** TRUST-001
**Primary touchpoints:** `src/routes/training/+page.svelte`,
`src/routes/training/[id]/+page.svelte`, `src/lib/types.ts`,
`src/lib/utils/storage.ts`

Implementation:

- [ ] Include the current progression label and identifier in newly created
  legacy snapshots until the normalized model replaces this path.
- [ ] Read and write `notes` consistently; remove `(session as any).note`.
- [ ] Render all logged sets and their actual values in session detail.
- [ ] Sort the session store after load, insert, and date edit.
- [ ] Ensure editing a date or note awaits persistence and retains form values on
  failure.
- [ ] Add a one-time read adapter for old snapshots that lack `step_label`, and
  display “Dati obiettivo non disponibili” instead of inventing a target.

Acceptance:

- [ ] A newly logged legacy session reopens with its target, performed sets, and
  notes exactly as entered.
- [ ] Changing a session date reorders every list that consumes session data.
- [ ] Malformed legacy data produces a review state, not a crash or fake values.

Verification: interaction test for log/open/edit/reload and legacy fixtures.

---

# Milestone 1 — Domain, data, and module foundation

This milestone creates the contracts that every core feature uses. Avoid adding
feature-specific Supabase calls after it begins.

## [-] ARCH-001 — Add test tooling and generated database types

**Priority:** P0
**Depends on:** none
**Primary touchpoints:** `package.json`, `groq-worker/package.json`, new test
configuration, generated Supabase types

Implementation:

- [x] Add a fast unit/module runner with DOM support for Svelte interaction
  tests and coverage reporting.
- [x] Add Playwright with authenticated test fixtures and mobile viewports.
- [x] Add axe integration for rendered-route checks.
- [x] Add a local Supabase policy/integration test command and deterministic
  seed fixtures for at least two users.
- [x] Add worker test tooling using a Cloudflare-compatible runtime.
- [x] Generate TypeScript types from the current Supabase schema and document
  the regeneration command.
- [x] Add scripts for `test:unit`, `test:integration`, `test:e2e`, `test:a11y`,
  `test:worker`, and aggregate `test`.
- [ ] Add one passing smoke test in each layer so CI wiring can be verified.

Acceptance:

- [ ] Every test command runs from a clean checkout with documented prerequisites.
- [ ] At least one allowed owner read and one denied cross-user read are
  exercised against an owner-scoped table in local Supabase; SEC-001 extends
  this to the vulnerable RPC and all private tables.
- [x] Generated database types are consumed by the Supabase client.

Verification: run every new script once from a reset local database.

## [ ] DOMAIN-001 — Implement strict, versioned contracts

**Priority:** P0
**Depends on:** ARCH-001
**Primary touchpoints:** `src/lib/types.ts`, new `src/lib/domain/` and
`src/lib/contracts/` modules, `src/lib/constants/enums.ts`

Implementation:

- [ ] Replace `Step` with `ProgressionLevel` in new code and add the domain types
  defined above.
- [ ] Define structured prescriptions for `completion`, `reps`, `duration`, and
  `distance`, including set count, optional load, unit, rest, and per-side
  behavior.
- [ ] Define branded IDs or otherwise distinct types for plan, plan exercise,
  progression level, workout, workout exercise, and performed set IDs.
- [ ] Define `ResourceState<T>` with `idle`, `loading`, `ready`, `refreshing`,
  `empty`, `offline`, `error`, and freshness metadata.
- [ ] Implement runtime validators for YAML input, database JSON snapshots,
  exercise catalog JSON, IndexedDB/localStorage values, and every AI response.
- [ ] Add schema-version discriminators and readers for all immutable snapshots.
- [ ] Unify divergent enum literals such as `quick-exercise` and
  `quick_exercise`; add explicit database-to-domain mapping.
- [ ] Remove `any` from session, feed-removal, and AI paths.
- [ ] Add fixture builders for valid, legacy, and invalid contracts.

Acceptance:

- [ ] Invalid external data returns a typed validation error with a field path.
- [ ] Versioned readers can render supported old snapshots without weakening the
  current contract.
- [ ] Domain logic does not consume generated Supabase row types directly.

Verification: contract tests for valid, boundary, malformed, and old-version
fixtures.

## [ ] DATA-001 — Add the normalized plan, workout, and progression schema

**Priority:** P0
**Depends on:** DOMAIN-001
**Primary touchpoints:** new Supabase migrations, generated database types,
`supabase/seed.sql`

Implementation:

- [ ] Add `training_plans` with owner, name, schema version, status, created and
  updated timestamps. Enforce at most one active plan per user.
- [ ] Add owner-scoped user preferences for IANA timezone, unit system, weekly
  target, onboarding completion, goal/equipment inputs, and approved analytics
  and AI controls. Keep policy/legal versions alongside captured consent when
  required by TRUST-002.
- [ ] Add `exercise_definitions` with owner, stable metadata, instructions,
  measurement type, catalog source ID, and media fields.
- [ ] Add `plan_exercises` with plan, exercise definition, position, current
  progression-level reference, and an optional schedule rule.
- [ ] Add `progression_levels` with plan exercise, unique ordered position, and
  validated structured prescription.
- [ ] Add `workouts` with owner, optional plan, `draft|completed|discarded`
  status, UTC start/completion instants, timezone, notes, schema version,
  immutable snapshot, and client idempotency key.
- [ ] Add `workout_exercises` with workout, source IDs where available, order,
  target snapshot, and progression decision.
- [ ] Add `performed_sets` with workout exercise, unique set index, completion,
  reps, load, duration, distance, unit, RPE/RIR, and pain flag.
- [ ] Add `progression_events` with plan exercise, prior/new level, decision,
  workout, timestamp, and reversal link.
- [ ] Add foreign keys with intentional delete behavior, ownership requirements,
  status/type checks, non-negative numeric checks, valid current-level checks,
  and unique ordering/idempotency constraints.
- [ ] Add indexes for owner plus completion time, active draft lookup, plan
  ordering, exercise history, and all foreign keys used by policies/selectors.
- [ ] Enable RLS and add owner-scoped policies for every table.
- [ ] For every `security definer` function, set an explicit safe `search_path`,
  revoke execute from `PUBLIC` and unintended roles, and grant only the role
  needed by the calling path.
- [ ] Add `updated_at` handling where mutable records need it.
- [ ] Regenerate database types.

Acceptance:

- [ ] The database rejects invalid status, ownership, duplicate positions,
  negative measurements, duplicate idempotency keys, and cross-user references.
- [ ] Every user-owned table has explicit allow and deny policy tests.
- [ ] A completed workout remains renderable after its source plan is changed or
  deleted according to the chosen retention rule.

Verification: reset migration, constraint tests, RLS tests, query-plan review for
history and active-draft queries.

## [ ] DATA-002 — Migrate legacy exercises, steps, and sessions

**Priority:** P0
**Depends on:** DATA-001
**Primary touchpoints:** new Supabase migration/RPC, migration fixtures,
temporary legacy parser

Implementation:

- [ ] Write a deterministic parser for recognized legacy descriptions; cover
  existing Italian and English formats with fixtures.
- [ ] Create one active plan per existing user and migrate `exercises` and
  `steps` into exercise definitions, plan exercises, and progression levels.
- [ ] Preserve completion history as progression events where the source data is
  unambiguous.
- [ ] Migrate readable `training_sessions.exercises` snapshots into workouts,
  workout exercises, and performed sets.
- [ ] Preserve every original legacy snapshot in the versioned workout snapshot
  or an audit table until migration is verified.
- [ ] Mark unparseable prescriptions and malformed sessions as `needs_review`;
  never substitute default sets/reps.
- [ ] Add an idempotent migration report with counts for migrated, skipped,
  review-needed, and failed records.
- [ ] Keep compatibility readers during one release window, then remove legacy
  writes after production counts are verified.
- [ ] Document rollback/recovery and when old tables may be dropped.

Acceptance:

- [ ] Running the migration twice does not duplicate data.
- [ ] Source and destination counts reconcile for all fixture cases.
- [ ] Users with review-needed data see a clear correction workflow.

Verification: representative migration fixtures, local reset, staging dry run,
and before/after count report.

## [ ] MOD-001 — Implement the Plan module

**Priority:** P0
**Depends on:** DATA-002
**Primary touchpoints:** new `src/lib/modules/plan/`, Supabase and in-memory
adapters, replacement transaction/RPC

Implementation:

- [ ] Implement the `PlanModule` interface and keep Supabase row mapping,
  validation, ordering, and transaction details inside it.
- [ ] Implement active-plan loading with an explicit no-plan result.
- [ ] Implement YAML/form import preview without writing data.
- [ ] Implement transactional plan replacement with an explicit strategy to
  preserve, map, archive, or reset progress for each affected exercise.
- [ ] Implement deterministic, versioned export.
- [ ] Implement duplicate exercise and invalid progression-order checks.
- [ ] Provide an in-memory adapter and module tests through the same interface.
- [ ] Prevent callers from mutating returned plan snapshots.

Acceptance:

- [ ] A plan is either fully replaced or unchanged after any injected failure.
- [ ] Export followed by preview/import preserves domain meaning.
- [ ] Routes need no knowledge of Supabase tables or YAML object shapes.

Verification: Plan module suite against in-memory and Supabase adapters.

## [ ] MOD-002 — Implement atomic workout completion

**Priority:** P0
**Depends on:** DATA-002
**Primary touchpoints:** new `src/lib/modules/workout/`, new transactional
Supabase RPC/backend operation, Supabase and in-memory adapters

Implementation:

- [ ] Implement the `WorkoutModule` interface for start, load active draft,
  apply draft command, finish, and discard.
- [ ] Define `DraftCommand` variants for set completion/value edits, exercise
  notes, session notes, and optional fields.
- [ ] Validate the draft and snapshot version before every write.
- [ ] Implement one database transaction that completes the workout, inserts or
  finalizes performed exercises/sets, records progression decisions/events, and
  returns the committed aggregate.
- [ ] Require a client-generated idempotency key and return the original
  committed workout for safe retries.
- [ ] Reject stale plan/progression references with a typed conflict that
  preserves the draft for review.
- [ ] Ensure only the owner can finish or discard a draft.
- [ ] Implement reversal of a progression event with audit history; do not edit
  completed workout snapshots.
- [ ] Set a safe `search_path` and explicit execute grants on the finish/reversal
  functions; validate `auth.uid()` inside each function as defense in depth.
- [ ] Provide an in-memory adapter and failure injection for each transaction
  stage.

Acceptance:

- [ ] No failure can create a partial workout or partial progression change.
- [ ] Repeating the same finish command produces exactly one completed workout.
- [ ] A failure keeps the draft intact and returns a retryable or conflict result.
- [ ] The committed result includes exact target and actual sets plus progression
  changes.

Verification: module tests with failure injection, RPC integration tests, RLS
tests, concurrent duplicate-submit test.

## [ ] MOD-003 — Make exercise authoring transactional

**Priority:** P0
**Depends on:** DATA-002
**Primary touchpoints:** new exercise-definition/plan mutation module, new
Supabase RPCs, `src/lib/utils/storage.ts`

Implementation:

- [ ] Replace multi-statement client creation with one transaction that creates
  the exercise definition, plan placement, and progression levels.
- [ ] Replace edit/reorder/delete/upsert sequencing with one version-checked
  transaction.
- [ ] Define behavior when editing or deleting an exercise referenced by
  completed workouts; preserve snapshot history.
- [ ] Detect stale concurrent edits and return a conflict instead of overwriting.
- [ ] Remove superseded exercise mutation functions from `storage.ts` after
  callers migrate.
- [ ] Apply the same safe `security definer`, `search_path`, ownership, and
  execute-grant rules as MOD-002 to every authoring function.

Acceptance:

- [ ] Failure at any statement leaves the exercise and plan unchanged.
- [ ] Completed workout history survives exercise edits and deletion.
- [ ] Concurrent edits cannot silently lose data.

Verification: module/integration tests for create, replace, reorder, delete,
failure injection, and stale versions.

## [ ] STATE-001 — Centralize auth bootstrap and resource state

**Priority:** P0
**Depends on:** MOD-001, MOD-002
**Primary touchpoints:** `src/routes/+layout.svelte`, `src/lib/stores/*`, new app
bootstrap/state modules

Implementation:

- [ ] Introduce explicit auth states: `checking`, `signed_out`, `signed_in`, and
  `error`.
- [ ] Load profile, active plan, active draft, and initial history only after auth
  resolves successfully.
- [ ] Remove async work performed during store module import.
- [ ] Replace bare-array stores with typed resource states containing data,
  status, error, freshness, and retry.
- [ ] Keep persistence in modules; stores expose reactive state and invoke module
  commands without duplicating write logic.
- [ ] Do not mark a resource initialized after failed loading; allow retry.
- [ ] Cancel or ignore stale requests after sign-out, account change, or newer
  request completion.
- [ ] Clear account-scoped memory and local caches on sign-out.
- [ ] Prevent signed-out profile/session calls and permission-error noise.

Acceptance:

- [ ] Cold start shows auth checking rather than a false empty/not-found state.
- [ ] Failed resources can retry without reloading the app.
- [ ] Signing from user A into user B cannot show user A's cached data.

Verification: bootstrap race tests, sign-out/in account-switch test, forced load
failure and retry interaction test.

---

# Milestone 2 — Rebuild the effortless workout loop

## [ ] WORKOUT-001 — Replace description parsing with structured set logging

**Priority:** P1
**Depends on:** MOD-002, STATE-001
**Primary touchpoints:** `src/routes/training/+page.svelte`, Workout module,
shared set editor components

Implementation:

- [ ] Delete runtime `parseSetsAndReps` use for current data.
- [ ] Build the training screen from the workout draft's structured target
  snapshot.
- [ ] Prefill every set from its target and complete it with one tap.
- [ ] Allow inline editing of reps, load, duration, or distance according to the
  exercise measurement type.
- [ ] Support kg/lb preference and convert display values without rewriting
  immutable historical values incorrectly.
- [ ] Offer previous-session values when comparable data exists.
- [ ] Add optional rest timer, RPE/RIR, workout note, and pain flag without
  blocking the one-tap path.
- [ ] Make exercise rows real buttons with `aria-expanded`; keep primary controls
  reachable and at least 44 x 44 CSS pixels.
- [ ] Show unknown migrated prescriptions as review-required and exclude them
  from silent completion.

Acceptance:

- [ ] Target values are retained unless the user edits them, and actual values
  round-trip exactly.
- [ ] Completion-only, reps-only, weighted, duration, and distance exercises
  each render and save correctly.
- [ ] No arbitrary text is converted to `3 x 10`.

Verification: Svelte interaction tests for every measurement type and a mobile
manual test during a full workout.

## [ ] WORKOUT-002 — Persist and resume workout drafts

**Priority:** P1
**Depends on:** WORKOUT-001
**Primary touchpoints:** Workout module, IndexedDB adapter,
`src/routes/training/+page.svelte`, Home

Implementation:

- [ ] Start a draft explicitly when the user taps Start, or on the first edit if
  entering through a compatible legacy path.
- [ ] Autosave locally to versioned IndexedDB after every command and debounce
  remote draft persistence where appropriate.
- [ ] Show `saving`, `saved`, `offline/local`, `error`, and `conflict` status.
- [ ] Restore the latest confirmed edit after refresh, process death, and PWA
  restart.
- [ ] Display start time and elapsed time based on timestamps, not an interval
  counter that drifts in the background.
- [ ] Add explicit cancel/discard confirmation and remove both local and remote
  draft only after success.
- [ ] Warn on navigation only when an edit has not reached durable local storage.
- [ ] Reconcile local and remote versions deterministically after reconnect; ask
  the user when neither version strictly supersedes the other.
- [ ] Remove the local draft after an acknowledged successful finish; retain it
  after any failure.

Acceptance:

- [ ] Refreshing or killing the app restores the last durable edit.
- [ ] Finishing after restore creates one workout and removes the matching draft.
- [ ] Switching accounts never exposes or uploads the previous user's draft.

Verification: browser tests for refresh, restart simulation, offline edits,
reconnect conflict, discard, and duplicate finish.

## [ ] WORKOUT-003 — Add explicit progression review and reversal

**Priority:** P1
**Depends on:** WORKOUT-002
**Primary touchpoints:** workout review UI, Workout module,
`src/routes/exercises/[id]/+page.svelte`

Implementation:

- [ ] Show target versus actual performance for every performed plan exercise
  before finishing.
- [ ] Present `Ripeti`, `Avanza`, `Regredisci`, and manual level selection with an
  optional recommendation and its plain-language reason.
- [ ] Validate that the selected level exists and belongs to the same plan
  exercise.
- [ ] Include all decisions in the atomic finish command.
- [ ] Remove direct progression completion from exercise detail, or redirect it
  into a logged workout flow so progression never changes without an event.
- [ ] Display progression changes in workout detail and exercise history.
- [ ] Add undo that records a reversal event and restores the appropriate current
  level without changing the original workout snapshot.
- [ ] Handle first/last-level boundaries explicitly.

Acceptance:

- [ ] Workout completion and progression changes appear everywhere from one
  committed result.
- [ ] A user can repeat a level even after meeting the target.
- [ ] Undo is auditable and cannot create an invalid progression index.

Verification: module and browser tests for all decisions, boundaries, retry, and
undo.

## [ ] HOME-001 — Redesign Home around the next action

**Priority:** P1
**Depends on:** STATE-001, WORKOUT-002
**Primary touchpoints:** `src/routes/home/+page.svelte`,
`src/lib/components/home/*`

Implementation:

- [ ] Implement mutually exclusive primary states: no plan, active draft, ready
  to start, already trained today, and all progression goals complete.
- [ ] Route each state to one clear action: create/import, resume, start, log
  another/review, or update the plan.
- [ ] Never remove the ability to train twice in one day.
- [ ] Add `Ciao`/`Bentornato` fallback when display name is blank.
- [ ] Label every secondary icon action with visible text or an unambiguous
  accessible name.
- [ ] Add a useful recent-history empty state and “Vedi tutto”.
- [ ] Decide whether `HomeStats` is the dashboard implementation; reuse it or
  delete it to avoid competing dead concepts.

Acceptance:

- [ ] Every resource combination resolves to one correct primary state without
  flashing a false one while loading.
- [ ] Users can always start another workout after training today.
- [ ] Resume returns to the exact durable draft.

Verification: state-table unit test and browser tests for each primary state.

## [ ] HISTORY-001 — Build complete personal history and review

**Priority:** P1
**Depends on:** MOD-002, WORKOUT-003
**Primary touchpoints:** new `/history` route, Nav/Home/Analytics links,
`src/routes/training/[id]/+page.svelte`, History module

Implementation:

- [ ] Implement the `HistoryModule` interface and keep pagination cursors,
  Supabase row mapping, snapshot validation, and cache reconciliation inside it.
- [ ] Implement paginated list and calendar views sorted by completed instant.
- [ ] Add date-range and exercise filters plus useful empty/no-results states.
- [ ] Show duration, target snapshots, actual sets, volume where meaningful,
  notes, pain flags, and progression changes.
- [ ] Make a newly completed workout available immediately without a full reload.
- [ ] Restrict edits to supported metadata such as completion time and notes;
  document which aggregates will recalculate.
- [ ] Recalculate selectors after date edits and invalidate AI/analytics caches.
- [ ] Implement typed not-found, permission, loading, and malformed-snapshot
  states.
- [ ] Add deletion with accessible confirmation, pending state, and post-success
  navigation.

Acceptance:

- [ ] All data entered during a workout is visible in its detail screen.
- [ ] Notes and dates round-trip, and a date change reorders history immediately.
- [ ] Filters and pagination do not leak or duplicate workouts.

Verification: History module tests plus browser log/open/edit/filter/delete flow.

---

# Milestone 3 — Plans, onboarding, and useful insight

## [ ] PLAN-001 — Build the visual plan and exercise editor

**Priority:** P1
**Depends on:** MOD-001, MOD-003, UX-001
**Primary touchpoints:** new plan settings route,
`src/lib/components/AddExerciseModal.svelte`,
`src/routes/exercises/[id]/edit/+page.svelte`, exercise-library utilities

Implementation:

- [ ] Build one shared create/edit form for exercise metadata, instructions,
  measurement type, and ordered progression levels.
- [ ] Add structured fields for sets, reps/load/time/distance, rest, and per-side
  behavior; keep instructions separate.
- [ ] Populate metadata and sensible editable prescription defaults when a
  catalog exercise is selected.
- [ ] Add duplicate detection and keyboard-friendly catalog autocomplete.
- [ ] Support drag/reorder plus accessible move-up/move-down controls for plan
  exercises and progression levels.
- [ ] Validate non-empty names, measurement-specific prescriptions, unique
  ordering, and a valid current level.
- [ ] Add unsaved-change protection that does not fire after a successful save.
- [ ] Preserve entered values and focus when AI/catalog lookup fails.

Acceptance:

- [ ] Create and edit share validation and behavior.
- [ ] Catalog selection creates a complete editable draft, not only a name/GIF.
- [ ] Keyboard-only users can add, reorder, save, and cancel.

Verification: interaction tests for create/edit/catalog/duplicate/reorder/failure
and a manual keyboard pass.

## [ ] PLAN-002 — Add versioned YAML import and export

**Priority:** P1
**Depends on:** PLAN-001
**Primary touchpoints:** plan settings route, Plan module,
`src/lib/utils/parsing.ts`, `static/training_plan.yaml`, `README.md`

Implementation:

- [ ] Publish a versioned YAML schema matching the domain contract.
- [ ] Support paste, editor, and file upload with file-size limits.
- [ ] Return line/column and field-path errors for invalid YAML or schema values.
- [ ] Show a semantic preview/diff: additions, removals, reorderings,
  prescription changes, and progress mapping/reset effects.
- [ ] Require explicit confirmation before transactional replacement.
- [ ] Provide deterministic download/export and a known-good example generated
  from the same schema.
- [ ] Test forward-version rejection and supported old-version migration.
- [ ] Remove commented legacy parsing and update README claims to match shipped
  behavior.

Acceptance:

- [ ] Invalid YAML performs no writes.
- [ ] The user sees the exact effect on plan and progress before applying.
- [ ] Export/import round-trip preserves meaning and stable ordering.

Verification: golden-file validator tests, module failure tests, and browser
paste/upload/preview/apply/download round-trip.

## [ ] AUTH-001 — Complete authentication and first-run onboarding

**Priority:** P1
**Depends on:** STATE-001, PLAN-001, PLAN-002
**Primary touchpoints:** `src/routes/auth/+page.svelte`, new recovery/confirmation
states, onboarding routes, profile module

Implementation:

- [ ] Use real form submission with labels, autocomplete attributes, disabled
  pending state, and field-associated errors.
- [ ] Replace the non-interactive auth mode `span` with button/link semantics.
- [ ] Add localized client validation and map known Supabase auth errors to
  stable Italian messages.
- [ ] Add password guidance, reset request, reset completion, resend
  confirmation, and expired-link states.
- [ ] Replace signup `alert` with an inline confirmation state.
- [ ] After first sign-in, collect goal, available equipment, weekly frequency,
  timezone, and unit preference with skip/back support.
- [ ] Offer a starter plan, visual creation, or YAML import as the final step.
- [ ] Persist onboarding completion and resume an interrupted onboarding flow.
- [ ] Add a safe demo/preview route only if it can remain isolated from real user
  data; otherwise document its deferral rather than adding a fake account.

Acceptance:

- [ ] Sign-up, confirmation, sign-in, reset, sign-out, and expired-session flows
  work with keyboard and screen reader.
- [ ] Raw Supabase errors never appear in the UI.
- [ ] A new user reaches Home with a chosen plan path and correct locale settings.

Verification: browser auth suite using test inbox/link fixtures and manual mobile
screen-reader pass.

## [ ] TIME-001 — Centralize dates, ordering, timezone, and identifiers

**Priority:** P1
**Depends on:** DOMAIN-001, AUTH-001
**Primary touchpoints:** `src/lib/utils/activity.ts`,
`src/lib/utils/sessions-stats.ts`, new time module, all date selectors

Implementation:

- [ ] Add one time module that converts UTC instants to calendar-day keys in the
  configured IANA timezone.
- [ ] Replace UTC string slicing and mixed local/UTC calculations in activity,
  streak, cadence, “today,” and latest-session logic.
- [ ] Sort within selectors rather than relying on store insertion order.
- [ ] Inject a clock/timezone into pure tests; do not depend directly on
  `Date.now()` in domain calculations.
- [ ] Define behavior for missing/invalid timezone and timezone changes.
- [ ] Reject empty route IDs before module calls.
- [ ] Use the domain ID types from DOMAIN-001 throughout touched routes/modules.

Acceptance:

- [ ] The same configured timezone defines Home, History, Analytics, and streaks.
- [ ] Results are correct around midnight, daylight-saving transitions, date
  edits, and unsorted input.

Verification: table-driven tests for Europe/Rome DST, non-DST zones, midnight,
timezone changes, invalid dates, and unsorted sessions.

## [ ] ANALYTICS-001 — Replace configuration metrics with performance metrics

**Priority:** P1
**Depends on:** HISTORY-001, TIME-001
**Primary touchpoints:** `src/routes/analytics/+page.svelte`, ProgressReview
module, chart components

Implementation:

- [ ] Remove “overall progress” based on checked progression levels and the rule
  that labels every new exercise as stuck.
- [ ] Add selectable 4-, 8-, and 12-week ranges.
- [ ] Show sessions per week and consistency against an optional user target.
- [ ] Show per-exercise reps, load, duration, or distance trends according to
  measurement type.
- [ ] Calculate personal records and recent bests with documented tie and unit
  rules.
- [ ] Show progression-level history and time at the current level.
- [ ] Show training balance only when category/muscle metadata passes a defined
  completeness threshold.
- [ ] Explain each metric in Italian and expose an insufficient-data state with
  the number of workouts needed.
- [ ] Recompute after workout edit/delete, progression reversal, plan change,
  timezone change, or unit-preference change.

Acceptance:

- [ ] Every metric is traceable to performed workout data and documented rules.
- [ ] Brand-new exercises are not called stuck.
- [ ] Unsorted input and calendar boundaries cannot change results incorrectly.

Verification: pure golden tests for every metric and browser checks for range,
empty, insufficient, and mixed-measurement states.

## [ ] AI-001 — Harden AI response contracts and product behavior

**Priority:** P1
**Depends on:** SEC-002, TRUST-002, DOMAIN-001, ANALYTICS-001
**Primary touchpoints:** `src/lib/groq.ts`, `src/lib/constants/prompts.ts`,
`src/lib/components/AiRecapDrawer.svelte`, exercise editor

Implementation:

- [ ] Runtime-validate every AI response before rendering or applying it.
- [ ] Remove duplicated/manual JSON extraction where the worker can enforce a
  schema; return a typed invalid-response error when validation fails.
- [ ] Make the recap contract consistent about the exact suggestion count.
- [ ] Remove the prompt's reference to a nonexistent third suggestion unless
  the chosen contract contains three.
- [ ] Key cached recaps by user, input-data version, timezone/day, prompt version,
  and model version; invalidate on relevant workout changes.
- [ ] Validate cached values before use and clear corrupt/foreign-user entries.
- [ ] Show a concise disclosure before the first AI request and honor the
  Settings control.
- [ ] Keep AI failure non-blocking for exercise authoring and workout/history
  use; preserve the user's input.
- [ ] Avoid logging raw model output that can echo workout data.

Acceptance:

- [ ] Malformed or stale AI output is never applied to a plan or rendered as
  trusted data.
- [ ] AI disabled/offline/error states do not block any core action.
- [ ] UI, prompt, validator, and tests agree on the response contract.

Verification: validator fixtures, cache-isolation tests, worker/client contract
tests, and AI-disabled browser path.

---

# Milestone 4 — Accessibility, resilience, PWA, and release quality

## [ ] UX-001 — Add shared status, notification, and confirmation UI

**Priority:** P1
**Depends on:** DOMAIN-001
**Primary touchpoints:** new shared UI, all data-backed routes,
`src/lib/components/Modal.svelte`

Implementation:

- [ ] Add shared inline status and toast/announcement UI for loading, saved,
  offline/stale, auth expiration, recoverable failure, and success.
- [ ] Add accessible destructive confirmation with initial focus, focus trap,
  Escape, focus restoration, labelled description, pending state, and strong
  confirmation variant.
- [ ] Upgrade `Modal.svelte` with unique title IDs, semantic backdrop handling,
  focus management, scroll locking, and nested-dialog prevention.
- [ ] Distinguish not found from not loaded and empty from failed on every
  data-backed route.
- [ ] Centralize public error-code-to-Italian-message mapping and retry actions.
- [ ] Remove every native `alert` and `confirm` after callers migrate.

Acceptance:

- [ ] Every data route has a deterministic rendering for all resource states.
- [ ] Screen readers announce mutation success/failure without moving focus
  unexpectedly.
- [ ] Modal focus never escapes to the page and returns to the invoking control.

Verification: component interaction tests, axe, keyboard test, and `rg
"alert\\(|confirm\\(" src` returning no application usages.

## [ ] A11Y-001 — Meet WCAG 2.2 AA on core journeys

**Priority:** P1
**Depends on:** UX-001, WORKOUT-003, PLAN-001, AUTH-001
**Primary touchpoints:** shared components, `src/app.css`, all core routes

Implementation:

- [ ] Replace clickable non-interactive elements with buttons or links and expose
  `aria-expanded`, `aria-pressed`, or current state where applicable.
- [ ] Add visible labels and connect help/error text with `aria-describedby`.
- [ ] Provide icon/text redundancy for status currently shown only by color or
  circles.
- [ ] Verify AA contrast in light and dark themes, including disabled/error/focus
  states.
- [ ] Respect `prefers-reduced-motion` in celebration, modal, skeleton, and route
  animations.
- [ ] Stop globally hiding scrollbars and retain usable visual scroll affordance.
- [ ] Ensure interactive targets are at least 44 x 44 CSS pixels on touch paths.
- [ ] Fix the empty AI skeleton heading and all current `svelte-check` warnings.
- [ ] Run automated axe scans on auth, onboarding, Home, plan edit, training,
  review, History detail, Analytics, and Settings.
- [ ] Complete and record manual keyboard, VoiceOver, and TalkBack passes on the
  same journeys.

Acceptance:

- [ ] Core journeys have no serious/critical axe findings and no unexplained
  `svelte-check` accessibility warnings.
- [ ] Every operation is possible without a pointer and remains understandable
  without color or motion.

Verification: accessibility suite plus recorded manual checklist by route.

## [ ] I18N-001 — Make language and product terminology consistent

**Priority:** P1
**Depends on:** DOMAIN-001
**Primary touchpoints:** `src/app.html`, all user-facing copy, error mapping,
prompts, manifests/metadata

Implementation:

- [ ] Set `<html lang="it">` and use base-path-safe asset links in `app.html`.
- [ ] Replace mixed labels such as “Goal,” “AI Recap,” “Step,” and “quick” with
  approved Italian terms.
- [ ] Create a small copy/formatting module for recurring status, date, number,
  unit, singular, and plural text.
- [ ] Localize not-found, auth, validation, offline, and provider-independent
  errors.
- [ ] Align page titles, manifest, Open Graph metadata, and README terminology.
- [ ] Add tests for important singular/plural and unit formatting cases.

Acceptance:

- [ ] Core UI contains no accidental English user-facing text.
- [ ] Domain terms mean the same thing on Exercises, Training, History, and
  Analytics.

Verification: copy audit, snapshot/format tests, and manual Italian-language pass.

## [ ] PWA-001 — Repair the installable online-first PWA

**Priority:** P2
**Depends on:** WORKOUT-002, UX-001
**Primary touchpoints:** `vite.config.ts`, `svelte.config.js`, `src/app.html`,
`src/routes/+layout.svelte`, static manifest/assets

Implementation:

- [ ] Keep one generated manifest source; remove duplicate static/generated
  manifest configuration.
- [ ] Use SvelteKit base-path resolution for icons, manifest, navigation
  fallback, and all internal assets in development and production.
- [ ] Generate a real fallback (`200.html` or configured equivalent) and verify
  direct navigation for every app route under `/prossima`.
- [ ] Remove or correct the unmatched `prerendered/**/*.html` Workbox glob.
- [ ] Cache only the shell and intentional small assets; do not imply Supabase
  data is available offline.
- [ ] Show a clear offline state and allow durable local draft editing while
  disabling final completion until online.
- [ ] Add update-available UI with controlled activation and reload.
- [ ] Remove the external PWACompat CDN script and unused/redundant PWA packages.
- [ ] Test first load, installed launch, update, offline launch, and direct route
  navigation at the production base path.

Acceptance:

- [ ] Build has no Workbox glob or missing-fallback warning.
- [ ] Install and navigation work without 404s in development and GitHub Pages.
- [ ] Offline UI never claims a workout was remotely completed.

Verification: production preview and deployed Lighthouse/PWA route matrix.

## [ ] PWA-002 — Add a visible offline completion outbox (optional follow-up)

**Priority:** P2
**Depends on:** PWA-001, MOD-002
**Primary touchpoints:** Workout module, IndexedDB, background/foreground sync UI

This task is intentionally separate from the first PWA release. Do not begin it
unless product scope changes from online-first to offline workout completion.

Implementation:

- [ ] Persist versioned finish commands in an account-scoped IndexedDB outbox.
- [ ] Show `pending`, `syncing`, `synced`, and `conflict` states; never show
  remote success before acknowledgement.
- [ ] Reuse the finish idempotency key for every retry.
- [ ] Sync in the foreground with bounded backoff; use background sync only as an
  enhancement.
- [ ] Require user resolution for stale-plan/progression conflicts.
- [ ] Encrypt or explicitly assess the local-at-rest privacy of workout content.
- [ ] Clear only acknowledged entries and isolate all entries by user.

Acceptance:

- [ ] Reconnect/restart/retry cannot duplicate workouts.
- [ ] Pending data remains visible and recoverable until committed or discarded.
- [ ] Account changes cannot expose or submit another user's outbox.

Verification: offline/reconnect/conflict/account-switch browser suite.

## [ ] PERF-001 — Improve loading performance and media resilience

**Priority:** P2
**Depends on:** PLAN-001, PWA-001
**Primary touchpoints:** exercise catalog build/load, media components, route
imports, dependencies

Implementation:

- [ ] Stop eagerly precaching the roughly 1.3 MB exercise catalog unless an
  offline search requirement is approved.
- [ ] Measure and choose lazy loading, compression, chunking, or a compact search
  index for the catalog.
- [ ] Lazy-load AI and analytics code outside the core workout path.
- [ ] Add validated image URLs, resilient placeholders, dimensions, and error
  handling for exercise media and avatars.
- [ ] Decide whether approved exercise media is self-hosted; remove mutable
  GitHub hotlinks if reliability/offline requirements demand it.
- [ ] Add timeouts and cancellation to network requests that lack them.
- [ ] Audit dependencies and remove unused `@google/genai`, direct
  `workbox-window`, redundant PWACompat, dead YAML code, and unused
  imports/functions once replacement tasks land.
- [ ] Record before/after bundle, catalog, and core-route loading measurements
  with a documented budget.

Acceptance:

- [ ] The core workout route does not load AI/analytics/catalog code it does not
  use.
- [ ] Broken or slow remote media does not shift layout or block an action.
- [ ] Performance budgets pass in CI or fail with an actionable report.

Verification: bundle analysis, throttled mobile test, media failure test, and
dependency audit.

## [ ] TEST-001 — Complete the behavior-focused test pyramid

**Priority:** P2
**Depends on:** SEC-002, DATA-002, WORKOUT-003, HISTORY-001, PLAN-002, AUTH-001,
ANALYTICS-001, AI-001, A11Y-001, PWA-001
**Primary touchpoints:** all test directories and fixtures

Implementation:

- [ ] Cover progression decisions, analytics, dates/timezones, YAML validation,
  legacy parsing, unit conversion, and contract readers with pure tests.
- [ ] Cover plan replacement, draft commands, atomic finish, idempotency,
  reconciliation, history mutation, and progression reversal through module
  interfaces.
- [ ] Cover every RLS/RPC allow and deny path, constraint, transaction rollback,
  and migration case against local Supabase.
- [ ] Cover exercise create/edit, draft recovery, mutation failures, modal focus,
  destructive confirmation, and resource states with Svelte interaction tests.
- [ ] Cover sign-up/sign-in/recovery, onboarding, start/resume/finish, progression
  review, history, and YAML round-trip with Playwright.
- [ ] Cover auth, CORS, limits, rate limiting, upstream timeout, stable errors,
  and streaming in worker tests.
- [ ] Cover core routes with axe and the agreed mobile viewport matrix.
- [ ] Remove obsolete tests that assert shallow-module internals after equivalent
  behavior is covered at the deep module interface.
- [ ] Set realistic coverage thresholds for domain/module code; do not use a
  global percentage to hide critical untested paths.

Acceptance:

- [ ] Every P0/P1 acceptance criterion has an automated test unless the task
  records why manual verification is necessary.
- [ ] Tests fail when atomicity, authorization, idempotency, or snapshot
  invariants are deliberately broken.
- [ ] The suite is deterministic and documented for local and CI use.

Verification: full suite repeated from a clean database and clean browser state.

## [ ] CI-001 — Gate deployment on quality and release checks

**Priority:** P2
**Depends on:** ARCH-001, TEST-001, PWA-001
**Primary touchpoints:** `.github/workflows/deploy.yml`, new CI workflows,
package/tool version files

Implementation:

- [ ] Pin and document supported Node and pnpm versions.
- [ ] Run locked install, formatting/lint, `pnpm check`, unit/module tests, worker
  tests, Supabase migration/policy tests, production build, browser smoke tests,
  and broken-link/PWA checks before deployment.
- [ ] Cache dependencies and Playwright assets without caching generated secrets
  or user data.
- [ ] Separate validation from deployment; make deploy depend on all required
  checks.
- [ ] Add pull-request preview deployment using isolated non-production data and
  secrets.
- [ ] Add dependency and secret/security scanning with an explicit remediation
  policy.
- [ ] Upload test, accessibility, bundle, and browser artifacts on failure.
- [ ] Add a post-deploy smoke check for auth route, manifest/service worker,
  direct base-path navigation, and AI disabled/enabled configuration.
- [ ] Document release rollback for GitHub Pages, worker deployment, and database
  migrations.

Acceptance:

- [ ] A failing check cannot deploy production.
- [ ] Pull requests show enough evidence to diagnose test, accessibility, PWA,
  or bundle regressions.
- [ ] A clean main-branch run deploys and passes post-deploy smoke tests.

Verification: intentionally fail one check, verify deployment is skipped, then
run the complete green pipeline.

## [ ] DOCS-001 — Reconcile product and operational documentation

**Priority:** P2
**Depends on:** CI-001, PERF-001
**Primary touchpoints:** `README.md`, this file, schema/worker/PWA runbooks

Implementation:

- [ ] Update README features so every claim is implemented and linked to its
  usage documentation.
- [ ] Document local Supabase setup, migrations, generated types, test commands,
  worker development/deployment, required environment variables, and PWA
  preview behavior.
- [ ] Document domain terminology, snapshot compatibility policy, timezone/unit
  rules, analytics definitions, and AI data flow.
- [ ] Add recovery runbooks for failed migrations, worker outage, auth outage,
  stale drafts, and PWA rollback.
- [ ] Move completed backlog items to a dated changelog/release note and keep the
  remaining dependencies accurate.

Acceptance:

- [ ] A new contributor can set up, test, build, and preview all owned modules
  from the documentation.
- [ ] Product copy, README, schema, and implementation use the same domain terms.

Verification: clean-checkout documentation walkthrough.

---

# Release sequence and exit gates

## Release 0 — Trust patch

Tasks: pull `ARCH-001` forward, then complete `SEC-001`, `SEC-002`,
`TRUST-001`, `TRUST-002`, and `BUG-001`.

Exit gate:

- [ ] No cross-user read path or unauthenticated AI quota path remains.
- [ ] No failed mutation reports success or discards entered data.
- [ ] Legal/support links and tracking/AI controls match the approved policy.

## Release 1 — Coherent data foundation

Tasks: `ARCH-001` through `STATE-001`.

Exit gate:

- [ ] New plan/workout writes use versioned contracts and normalized tables.
- [ ] Workout completion and progression decisions are atomic and idempotent.
- [ ] Legacy data is migrated, preserved, or visibly flagged for review.

## Release 2 — Effortless workout loop

Tasks: `WORKOUT-001` through `HISTORY-001`, plus applicable accessibility/status
work from `UX-001` and `A11Y-001`.

Exit gate:

- [ ] A user can start, log, survive restart, resume, review, finish, inspect, and
  reverse progression without data loss or duplicate completion.

## Release 3 — Plans and insight

Tasks: `PLAN-001` through `AI-001`.

Exit gate:

- [ ] A new user can onboard into a valid plan, round-trip YAML safely, and see
  performance analytics derived from actual workouts.

## Release 4 — Product hardening

Tasks: remaining `UX-001` through `DOCS-001`. `PWA-002` remains optional unless
offline completion is explicitly approved.

Exit gate:

- [ ] Core journeys meet the accessibility target, PWA behavior is honest,
  performance budgets pass, and CI blocks unsafe deployment.

## Coverage of the original review

This mapping prevents a finding from disappearing during implementation:

| Original improvement | Implementation tasks |
| --- | --- |
| Protect workout/profile privacy | SEC-001, DATA-001, TEST-001 |
| Atomic and truthful session completion | TRUST-001, MOD-002 |
| One domain meaning | DOMAIN-001, DATA-001 |
| Connect logging to progression | MOD-002, WORKOUT-003 |
| Honest destructive/settings actions | TRUST-001, UX-001 |
| Secure and bound AI proxy | SEC-002, AI-001 |
| Remove trust-breaking release content | TRUST-002 |
| Restore YAML workflow | PLAN-002, DOCS-001 |
| Home around next action | HOME-001 |
| Preserve in-progress workouts | WORKOUT-002 |
| Structured, fast set logging | WORKOUT-001 |
| Real history/review | BUG-001, HISTORY-001 |
| Performance-based analytics | TIME-001, ANALYTICS-001 |
| Exercise/plan authoring | MOD-003, PLAN-001 |
| Authentication/onboarding | STATE-001, AUTH-001 |
| Accessibility | UX-001, A11Y-001 |
| Feedback/empty/edge states | STATE-001, UX-001 |
| Language/content consistency | I18N-001, AI-001 |
| Deep modules around seams | MOD-001, MOD-002, MOD-003 |
| Explicit state ownership | STATE-001 |
| Strict versioned contracts | DOMAIN-001, DATA-001, DATA-002 |
| Time, ordering, identifiers | TIME-001 |
| Offline/PWA strategy | PWA-001, optional PWA-002 |
| Performance/resilience | PERF-001 |
| Test pyramid | ARCH-001, TEST-001 |
| CI/release checks | CI-001, DOCS-001 |
