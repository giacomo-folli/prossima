───────┬────────────────────────────────────────────────────────────────────────────────────
       │ File: [1mpackage.json[0m
───────┼────────────────────────────────────────────────────────────────────────────────────
   1   │ {
   2   │   [34m"[0m[34mname[0m[34m"[0m: [32m"[0m[32mprossima[0m[32m"[0m,
   3   │   [34m"[0m[34mversion[0m[34m"[0m: [32m"[0m[32m0.0.1[0m[32m"[0m,
   4   │   [34m"[0m[34mdescription[0m[34m"[0m: [32m"[0m[32m"[0m,
   5   │   [34m"[0m[34mkeywords[0m[34m"[0m: [],
   6   │   [34m"[0m[34mpackageManager[0m[34m"[0m: [32m"[0m[32mpnpm@11.5.0[0m[32m"[0m,
   7   │   [34m"[0m[34mauthor[0m[34m"[0m: [32m"[0m[32m"[0m,
   8   │   [34m"[0m[34mlicense[0m[34m"[0m: [32m"[0m[32mISC[0m[32m"[0m,
   9   │   [34m"[0m[34mscripts[0m[34m"[0m: {
  10   │     [34m"[0m[34mdev[0m[34m"[0m: [32m"[0m[32mvite dev[0m[32m"[0m,
  11   │     [34m"[0m[34mbuild[0m[34m"[0m: [32m"[0m[32mvite build[0m[32m"[0m,
  12   │     [34m"[0m[34mpreview[0m[34m"[0m: [32m"[0m[32mvite preview[0m[32m"[0m,
  13   │     [34m"[0m[34mprepare[0m[34m"[0m: [32m"[0m[32msvelte-kit sync || echo ''[0m[32m"[0m,
  14   │     [34m"[0m[34mcheck[0m[34m"[0m: [32m"[0m[32msvelte-kit sync && svelte-check --tsconfig ./tsconfig.json[0m[32m"[0m,
  15 [33m~[0m │     [34m"[0m[34mcheck:watch[0m[34m"[0m: [32m"[0m[32msvelte-kit sync && svelte-check --tsconfig ./tsconfig.json --wa[0m
       │ [32mtch[0m[32m"[0m,
  16 [33m~[0m │     [34m"[0m[34mdb:start[0m[34m"[0m: [32m"[0m[32msupabase start[0m[32m"[0m,
  17 [33m~[0m │     [34m"[0m[34mdb:reset[0m[34m"[0m: [32m"[0m[32msupabase db reset[0m[32m"[0m,
  18 [33m~[0m │     [34m"[0m[34mdb:types[0m[34m"[0m: [32m"[0m[32msupabase gen types typescript --local --schema public > src/lib/da[0m
       │ [32mtabase.types.ts[0m[32m"[0m,
  19 [33m~[0m │     [34m"[0m[34mtest:unit[0m[34m"[0m: [32m"[0m[32mvitest run --coverage[0m[32m"[0m,
  20 [33m~[0m │     [34m"[0m[34mtest:integration[0m[34m"[0m: [32m"[0m[32msupabase test db[0m[32m"[0m,
  21 [33m~[0m │     [34m"[0m[34mtest:e2e[0m[34m"[0m: [32m"[0m[32mplaywright test --project=desktop-chromium --project=mobile-chromi[0m
       │ [32mum --project=mobile-small[0m[32m"[0m,
  22 [33m~[0m │     [34m"[0m[34mtest:a11y[0m[34m"[0m: [32m"[0m[32mplaywright test --project=a11y-chromium[0m[32m"[0m,
  23 [33m~[0m │     [34m"[0m[34mtest:worker[0m[34m"[0m: [32m"[0m[32mpnpm --dir groq-worker test[0m[32m"[0m,
  24 [33m~[0m │     [34m"[0m[34mtest[0m[34m"[0m: [32m"[0m[32mpnpm test:unit && pnpm test:worker && pnpm test:integration && pnpm te[0m
       │ [32mst:e2e && pnpm test:a11y[0m[32m"[0m
  25   │   },
  26   │   [34m"[0m[34mdevDependencies[0m[34m"[0m: {
  27 [32m+[0m │     [34m"[0m[34m@axe-core/playwright[0m[34m"[0m: [32m"[0m[32m^4.13.0[0m[32m"[0m,
  28 [32m+[0m │     [34m"[0m[34m@playwright/test[0m[34m"[0m: [32m"[0m[32m^1.62.1[0m[32m"[0m,
  29   │     [34m"[0m[34m@sveltejs/adapter-auto[0m[34m"[0m: [32m"[0m[32m^7.0.1[0m[32m"[0m,
  30   │     [34m"[0m[34m@sveltejs/kit[0m[34m"[0m: [32m"[0m[32m^2.57.0[0m[32m"[0m,
  31   │     [34m"[0m[34m@sveltejs/vite-plugin-svelte[0m[34m"[0m: [32m"[0m[32m^7.0.0[0m[32m"[0m,
  32 [32m+[0m │     [34m"[0m[34m@testing-library/jest-dom[0m[34m"[0m: [32m"[0m[32m^7.0.1[0m[32m"[0m,
  33 [32m+[0m │     [34m"[0m[34m@testing-library/svelte[0m[34m"[0m: [32m"[0m[32m^5.4.2[0m[32m"[0m,
  34 [32m+[0m │     [34m"[0m[34m@testing-library/user-event[0m[34m"[0m: [32m"[0m[32m^14.6.7[0m[32m"[0m,
  35   │     [34m"[0m[34m@types/node[0m[34m"[0m: [32m"[0m[32m^25.9.0[0m[32m"[0m,
  36 [32m+[0m │     [34m"[0m[34m@vitest/coverage-v8[0m[34m"[0m: [32m"[0m[32m^4.1.11[0m[32m"[0m,
  37 [32m+[0m │     [34m"[0m[34mjsdom[0m[34m"[0m: [32m"[0m[32m^30.0.1[0m[32m"[0m,
  38   │     [34m"[0m[34mpwacompat[0m[34m"[0m: [32m"[0m[32m^2.0.17[0m[32m"[0m,
  39 [32m+[0m │     [34m"[0m[34msupabase[0m[34m"[0m: [32m"[0m[32m^2.116.0[0m[32m"[0m,
  40   │     [34m"[0m[34msvelte[0m[34m"[0m: [32m"[0m[32m^5.55.2[0m[32m"[0m,
  41   │     [34m"[0m[34msvelte-check[0m[34m"[0m: [32m"[0m[32m^4.4.6[0m[32m"[0m,
  42   │     [34m"[0m[34mtypescript[0m[34m"[0m: [32m"[0m[32m^6.0.2[0m[32m"[0m,
  43   │     [34m"[0m[34mvite[0m[34m"[0m: [32m"[0m[32m^8.0.7[0m[32m"[0m,
  44 [32m+[0m │     [34m"[0m[34mvitest[0m[34m"[0m: [32m"[0m[32m^4.1.11[0m[32m"[0m,
  45   │     [34m"[0m[34mworkbox-window[0m[34m"[0m: [32m"[0m[32m^7.4.1[0m[32m"[0m
  46   │   },
  47   │   [34m"[0m[34mtype[0m[34m"[0m: [32m"[0m[32mmodule[0m[32m"[0m,
  48   │   [34m"[0m[34mdependencies[0m[34m"[0m: {
  49   │     [34m"[0m[34m@google/genai[0m[34m"[0m: [32m"[0m[32m^2.6.0[0m[32m"[0m,
  50   │     [34m"[0m[34m@supabase/supabase-js[0m[34m"[0m: [32m"[0m[32m^2.106.0[0m[32m"[0m,
  51   │     [34m"[0m[34m@sveltejs/adapter-static[0m[34m"[0m: [32m"[0m[32m^3.0.10[0m[32m"[0m,
  52   │     [34m"[0m[34m@types/luxon[0m[34m"[0m: [32m"[0m[32m^3.7.1[0m[32m"[0m,
  53   │     [34m"[0m[34m@vite-pwa/sveltekit[0m[34m"[0m: [32m"[0m[32m^1.1.0[0m[32m"[0m,
  54   │     [34m"[0m[34mluxon[0m[34m"[0m: [32m"[0m[32m^3.7.2[0m[32m"[0m,
  55   │     [34m"[0m[34mposthog-js[0m[34m"[0m: [32m"[0m[32m^1.376.0[0m[32m"[0m,
  56   │     [34m"[0m[34myaml[0m[34m"[0m: [32m"[0m[32m^2.8.4[0m[32m"[0m
  57   │   }
  58 [33m~[0m │ }
───────┴────────────────────────────────────────────────────────────────────────────────────
