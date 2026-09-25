import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs/promises';

// Shared by the SQL test files: a Supabase-like PGlite database (roles, auth/storage stubs)
// with every migration applied in order. Lives outside *.test.mjs so importing it does not
// register another file's tests.
export async function testDatabase() {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth; CREATE SCHEMA storage;
CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_user::text $$;
CREATE TABLE storage.buckets(id text PRIMARY KEY, name text, public boolean);
CREATE TABLE storage.objects(id uuid DEFAULT gen_random_uuid(), bucket_id text, name text);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql AS $$ SELECT string_to_array(name, '/') $$;
GRANT USAGE ON SCHEMA public, auth, storage TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
GRANT ALL ON storage.objects TO anon, authenticated, service_role;`);
  const dir = new URL('../../supabase/migrations/', import.meta.url);
  for(const file of (await fs.readdir(dir)).sort()) {
    try { await db.exec(await fs.readFile(new URL(file, dir), 'utf8')); }
    catch(error) { await db.close(); throw new Error(`${file}: ${error.message} at position ${error.position}`, { cause: error }); }
  }
  return db;
}
