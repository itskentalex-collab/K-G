# PROJECT KLIE — Full Cloud Sync

KLIE keeps its existing interface and local archive features, and can synchronize the shared archive across devices through Supabase. The cloud archive includes Memories, Moments, Collections, Notes, settings, the `unseen` flag, and attached photos. KLIE AI remains the existing local simulation; its temporary chat transcript is not shared.

## Access model selected

- **Link access:** anyone who can open the GitHub Pages website can read the shared archive and its photos. The link is not a private invitation and can be forwarded.
- **Both can edit:** you and Girlie must each enable editing in Settings using the same shared owner key. Anyone else who obtains that key can also edit/delete the shared archive. Do not send it in the website link or commit it to GitHub.
- Display settings are part of the shared archive, so theme/clock preferences are shared too.

## 1. Create Supabase project

Create a project at https://supabase.com/ and wait until its database is ready.

## 2. Create the database

Open **SQL Editor → New query**. Copy `supabase/setup.sql` into it. Replace `REPLACE_WITH_A_LONG_RANDOM_OWNER_KEY` with a long random secret, then run the SQL. Keep the edited SQL private; do not commit it. The same exact key will be configured as an Edge Function secret in step 4.

## 3. Configure the website

In **Project Settings → API**, copy the Project URL and anon/publishable public key. Put them in `js/cloud-config.js`. This file is public by design. Never put a `service_role` or secret key there.

## 4. Deploy the photo-storage function

Install the Supabase CLI and sign in, then from the project folder run:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set KLIE_OWNER_KEY='THE_EXACT_OWNER_KEY_FROM_SQL'
supabase secrets set SUPABASE_SERVICE_ROLE_KEY='YOUR_SERVICE_ROLE_KEY'
supabase functions deploy klie-media --no-verify-jwt
```

The service-role key is used only by the server-side Edge Function. Never put it in website JavaScript, GitHub Pages, or `cloud-config.js`. Supabase provides it under Project Settings → API Keys.

## 5. Deploy the website

Commit the updated project to GitHub and publish the repository root with GitHub Pages. Open the deployed website and go to **Settings**.

## 6. Upload the existing archive

On the device that currently contains your Memories and photos:

1. Export an archive backup first.
2. Open Settings → **Enable editing**, and enter the shared owner key.
3. Press **Upload / sync this archive**. This uploads the current local archive and its photos to the cloud. If a cloud archive already exists, the site asks before replacing it.
4. Wait for the success message before closing the page.

## 7. Connect the second device

Open the same website link on the second device. The shared archive should load automatically. To edit, open Settings → **Enable editing** and enter the same owner key. Both devices then sync changes automatically and receive realtime updates.

## Notes and limitations

- The first upload is a deliberate migration step; local data is not silently overwritten. Export a backup first.
- A shared owner key is a shared credential, not individual accounts. Anyone with the website link can read; anyone with the owner key can edit.
- The archive uses last-write-wins for near-simultaneous edits. Avoid editing the same item on both devices at exactly the same time.
- Photo uploads are limited to 12 MB each by the Edge Function.
- Local browser storage remains a cache and backup source. Use **Export archive** regularly.
- The KLIE AI engine itself remains local; its transient chat conversation is not synchronized.
