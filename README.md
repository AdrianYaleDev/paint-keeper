# Paint Keeper

A mobile-friendly React and TypeScript app for keeping a miniature paint collection and shopping list. Use it without an account, or connect Supabase to sign in and sync across devices.

## Get started

Requires Node.js 22.12+ (or a newer version supported by Vitest) and npm.

```sh
npm install
npm run dev
```

Open the address printed by Vite. Browse the shared catalogue and mark paints as owned or add them to the shopping list. On the shopping list, select **I own this** to move a paint into your collection. Search and filter by brand and paint type on any view. Ordinary users cannot add catalogue paints.

Guest collections are stored in the browser's local storage on that device. Clearing site data, using private browsing, or switching browsers/devices can remove or isolate this data. Do not rely on guest storage as a backup.

## Supabase setup

[`supabase/schema.sql`](supabase/schema.sql) creates the following tables and access policies. It is intended for a fresh project without these tables, not a migration for existing tables. Review it and run it in the Supabase SQL Editor; it is transactional and will fail rather than overwrite existing tables.

- `brands`: a unique brand name and UUID.
- `paint_types`: a unique type name and UUID. Types such as Acrylic or Spray Cans are shared across brands and can be extended.
- `paints`: a UUID, `brand_id`, `type_id`, name, optional paint `code` (nullable text), and optional six-digit hex `color`. Each paint has one brand and one type. Names are unique within a brand and type; codes do not have a uniqueness requirement. Paint codes appear on cards when supplied and can be searched.
- `user_paints`: `user_id`, `paint_id` (text), `paint` (a JSON snapshot), `status`, and `updated_at`. `none` is retained as a tombstone for synchronizing removals. Snapshots preserve offline access and entries created with earlier versions, which do not add records to the shared catalogue.

Row-level security and grants allow everyone to read the catalogue, but not modify it; signed-in users can only read and write their own collection. Manage catalogue data through the Supabase dashboard or another trusted administrative tool for now. There is no admin interface yet. Enable email/password authentication in Supabase Auth and configure the site URL and redirect URLs for your deployment. If email confirmation is enabled, users must confirm their email before signing in.

After creating the schema, optionally run [`supabase/seed_ttcombat_paints.sql`](supabase/seed_ttcombat_paints.sql) in the SQL Editor to add a partial TTCombat catalogue. It includes acrylics, metallics, washes, candy coats, effects, mediums and spray primers from the sources listed in the script. Each seed row contains type, name, code and colour; replace either `null` with a verified code or six-digit hex colour. Rerun the full script in the SQL Editor to add missing paints and fill **null** codes and colours. Existing non-null values, paint IDs and user selections are preserved; correcting an existing value requires a separate update. The transaction rejects invalid colours and aborts if a seeded paint name already exists under another type, rather than duplicate or reclassify it. Review that conflict separately, especially if an older version of the seed was run. Paint sets are excluded; codes and colour swatches remain null until supplied.

Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the project's API settings. The legacy `anon` key can also be used. **Never use a service-role or secret key in this app:** Vite variables are included in the public client bundle. Restart the dev server after changing environment variables.

Without these settings, the app works locally with any previously cached catalogue and account controls are disabled. The catalogue starts empty until it has been populated; no sample or unverified paint data is included. Existing personal paints created with earlier versions remain in the collection but are not published to the shared catalogue.

When a guest signs in, their local collection and shopping list are merged into the account. If the same paint is both owned and wished for, owned wins. The guest data is removed only after the account changes have been saved successfully. Changes made while signed in are stored on the device first and synced when online; the app reports failures and provides a retry. Conflicting edits to the same paint on different devices are resolved by the last successful sync, not by a server-side conflict-resolution policy.

## Install and offline use

Build and deploy the app over HTTPS (or use localhost for development). After visiting it online, supported browsers can install it from their install menu. On iOS, use Safari's **Share → Add to Home Screen**. The production build caches the app shell and the last successfully loaded catalogue for offline use. Account authentication and syncing require a network connection; pending changes sync when connectivity returns. A first visit requires a connection.

```sh
npm run build
npm run preview
npm test
```

The service worker is generated for production builds, not the normal Vite development server.
