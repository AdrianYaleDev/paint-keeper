# Paint Keeper

A mobile-friendly React and TypeScript app for keeping a miniature paint collection and shopping list. Use it without an account, or connect Supabase to sign in and sync across devices.

## Get started

Requires Node.js 22.12+ (or a newer version supported by Vitest) and npm.

```sh
npm install
npm run dev
```

Open the address printed by Vite. Browse the shared catalogue and mark paints as owned or add them to the shopping list. On the shopping list, select **I own this** to move a paint into your collection. Search and filter by brand and paint type on any view. Selecting a brand limits the type options to that brand; in your collection, the options only include brands and types of paints you own. All paints shows 24 results per page; search and filters apply to the entire catalogue. Ordinary users cannot add catalogue paints.

Guest collections are stored in the browser's local storage on that device. Clearing site data, using private browsing, or switching browsers/devices can remove or isolate this data. Do not rely on guest storage as a backup.

## Supabase setup

[`supabase/schema.sql`](supabase/schema.sql) creates the following tables and access policies. It is intended for a fresh project without these tables, not a migration for existing tables. Review it and run it in the Supabase SQL Editor; it is transactional and will fail rather than overwrite existing tables.

- `brands`: a unique brand name and UUID.
- `paint_types`: a unique type name and UUID. Types such as Acrylic or Spray Cans are shared across brands and can be extended.
- `paints`: a UUID, `brand_id`, `type_id`, name, optional paint `code` (nullable text), and optional six-digit hex `color`. Each paint has one brand and one type. Names are unique within a brand and type; codes do not have a uniqueness requirement. Paint codes appear on cards when supplied and can be searched.
- `user_paints`: `user_id`, `paint_id` (text), `paint` (a JSON snapshot), `status`, and `updated_at`. `none` is retained as a tombstone for synchronizing removals. Snapshots preserve offline access and entries created with earlier versions, which do not add records to the shared catalogue.

Row-level security and grants allow everyone to read the catalogue, but not modify it; signed-in users can only read and write their own collection. Manage catalogue data through the Supabase dashboard or another trusted administrative tool for now. There is no admin interface yet. Enable email/password authentication in Supabase Auth and configure the site URL and redirect URLs for your deployment. If email confirmation is enabled, users must confirm their email before signing in.

### Email confirmation redirects

Sign-up requests ask Supabase to return the user to the app's current origin and Vite base path, not to the Supabase API URL. In Supabase **Authentication → URL Configuration**, set **Site URL** to your production app URL (for example `https://your-app.vercel.app/`) and add that same URL to **Redirect URLs**. Add your local development URL (for example `http://localhost:5173/`) and any trusted Vercel preview URLs separately if you use them. A redirect that is not allow-listed falls back to the Site URL; do not allow arbitrary origins. See [Supabase redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls).

If you customized the confirmation email template, make sure its link uses `{{ .ConfirmationURL }}` or correctly uses `{{ .RedirectTo }}` instead of hard-coding `{{ .SiteURL }}`. Redeploy the updated app and test with a newly generated confirmation email; emails sent before this change retain their original redirect. The app attempts to establish a session on return, but users may need to sign in manually if confirmation is opened in another browser or device.

After creating the schema, optionally run [`supabase/seed_ttcombat_paints.sql`](supabase/seed_ttcombat_paints.sql) in the SQL Editor to add a partial TTCombat catalogue. It includes acrylics, metallics, washes, candy coats, effects, mediums and spray primers from the sources listed in the script. Swatches sampled from TTCombat product artwork are approximate, particularly for metallic and translucent paints; they are not measured representations of the physical paints. Products without a reliable colour sample remain null. Each seed row contains type, name, code and colour; replace either `null` with a verified code or six-digit hex colour. Rerun the full script in the SQL Editor to add missing paints and fill **null** codes and colours. Existing non-null values, paint IDs and user selections are preserved; correcting an existing value requires a separate update. The transaction rejects invalid colours and aborts if a seeded paint name already exists under another type, rather than duplicate or reclassify it. Review that conflict separately, especially if an older version of the seed was run. Paint sets are excluded.

[`supabase/seed_citadel_paints.sql`](supabase/seed_citadel_paints.sql) adds the seven paint types from the Warhammer colour chart: Base, Shade, Layer, Contrast, Technical, Air and Dry. The same paint name may appear under different types and represents a separate product in each. Colours are approximate samples of the chart artwork, not official hex specifications or measured paint colours; gradients, metallics and textures cannot be represented faithfully by a single swatch. Mediums, varnishes and thinner have no swatch. The separate Tone Pro chart and spray products are not included. Like the TTCombat seed, reruns fill missing codes and colours without overwriting existing non-null values or changing paint IDs.

[`supabase/seed_vallejo_game_color.sql`](supabase/seed_vallejo_game_color.sql) adds Vallejo Game Color products and its ink, wash and FX sub-ranges from the manufacturer's individual product listings. Codes are manufacturer references. Swatches are approximate digital colours from the official Game Color chart; effects and products without a reliable chart swatch remain null. Game Air, Xpress Color, other ranges and sets are not included. Reruns fill missing codes and colours without overwriting existing values or IDs. If a matching Vallejo product has a conflicting code, or a code is attached to a different product, the transaction aborts for manual review.

[`supabase/seed_vallejo_air_metal.sql`](supabase/seed_vallejo_air_metal.sql) adds the individual Model Air, Game Air and Metal Color products as separate types, including Metal Color varnish and primer. Two Model Air products named Red have their codes appended to distinguish them; sets are excluded. Swatches are approximate chart artwork samples, with Game Air colours matched to the chart's equivalent Game Color references. Metallic finishes cannot be accurately represented by a single colour, and the varnish and primer have no swatches. Reruns and code-conflict checks follow the Game Color seed's same safeguards.

[`supabase/seed_army_painter.sql`](supabase/seed_army_painter.sql) adds 89 Speedpaint 2.0 and 126 Warpaints Air colours from The Army Painter's individual listings and all-colours posters. Sets, mediums, cleaners, primers and varnishes are excluded. Swatches are approximate digital samples; metallic, fluorescent and translucent finishes cannot be faithfully represented by a single colour. Reruns fill only missing codes and colours, preserving IDs and existing values; conflicting product codes abort the transaction for review.

Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the project's API settings. The legacy `anon` key can also be used. **Never use a service-role or secret key in this app:** Vite variables are included in the public client bundle. Restart the dev server after changing environment variables.

Without these settings, the app works locally with any previously cached catalogue and account controls are disabled. The catalogue starts empty until it has been populated; no sample or unverified paint data is included. Existing personal paints created with earlier versions remain in the collection but are not published to the shared catalogue.

When a guest signs in, their local collection and shopping list are merged into the account. If the same paint is both owned and wished for, owned wins. The guest data is removed only after the account changes have been saved successfully. Changes made while signed in are stored on the device first and synced when online; the app reports failures and provides a retry. Conflicting edits to the same paint on different devices are resolved by the last successful sync, not by a server-side conflict-resolution policy.

## Admin area

Admins can add paints to the shared catalogue from an **Admin** item in the sidebar, either with a form or by uploading a `.csv` or `.xlsx` file (headers `brand, type, name`, optionally `code, colour`). Missing brands and types are created; paints that already exist are skipped.

Admin rights are enforced in the database, not the app. Run [`supabase/migration_admin.sql`](supabase/migration_admin.sql) once in the Supabase SQL editor, then make yourself an admin (after signing up in the app):

```sql
insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
```

## Install and offline use

Build and deploy the app over HTTPS (or use localhost for development). Open it on the phone and use **Install app** when the browser offers it. On iPhone or iPad, open it in Safari and use **Share → Add to Home Screen**. Other browsers may provide **Install app** or **Add to Home screen** in their menu. The install option is hidden in the installed app. Installation is browser-dependent; it is not an App Store or Play Store listing.

The production build caches the app shell and the last successfully loaded catalogue for offline use. Account authentication and syncing require a network connection; pending changes sync when connectivity returns. A first visit requires a connection. Browser and installed-app storage can be separate, especially on iOS, so guest data may not transfer between them. Sign in with an account to sync your collection between them; guest data remains local to its original storage.

```sh
npm run build
npm run preview
npm test
```

The service worker is generated for production builds, not the normal Vite development server.
