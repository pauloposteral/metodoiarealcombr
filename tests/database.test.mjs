import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';

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
  const dir = new URL('../supabase/migrations/', import.meta.url);
  for(const file of (await fs.readdir(dir)).sort()) {
    try { await db.exec(await fs.readFile(new URL(file, dir), 'utf8')); }
    catch(error) { await db.close(); throw new Error(`${file}: ${error.message} at position ${error.position}`, { cause: error }); }
  }
  return db;
}

test('All migrations restore a clean database; RLS blocks unauthorised writes', async (t) => {
  const db = await testDatabase();
  t.after(() => db.close());
  const alice = '00000000-0000-4000-8000-000000000001';
  const bob = '00000000-0000-4000-8000-000000000002';
  await db.exec(`INSERT INTO auth.users(id,email) VALUES ('${alice}','alice@example.test'),('${bob}','bob@example.test');`);
  await t.test('New account has no paid entitlement', async () => {
    const r = await db.query(`SELECT access_status FROM profiles WHERE id = $1`, [alice]);
    assert.equal(r.rows[0].access_status, 'pending');
  });
  await db.exec(`SET ROLE anon;`);
  await t.test('Anonymous cannot read purchase records', async () => {
    await assert.rejects(() => db.query('SELECT * FROM purchases'), /permission denied/);
  });
  await db.exec(`RESET ROLE; SET ROLE authenticated; SET request.jwt.claim.sub = '${alice}';`);
  await t.test('Cannot grant yourself paid access', async () => {
    await assert.rejects(() => db.query(`UPDATE profiles SET access_status = 'active' WHERE id = $1`,[alice]), /administrator/);
  });
  await t.test('Cannot grant yourself administrator role', async () => {
    await assert.rejects(() => db.query(`INSERT INTO user_roles(user_id,role) VALUES ($1,'admin')`,[alice]), /row-level security/);
  });
  await t.test('Cannot create a forged certificate', async () => {
    await assert.rejects(() => db.query(`INSERT INTO certificates(user_id,certificate_code,student_name,total_hours) VALUES ($1,'forged','forged',9000)`,[alice]), /row-level security/);
  });
  await t.test('Cannot reset the AI counter or choose your own quota', async () => {
    await assert.rejects(() => db.query(`SELECT consume_ai_quota('attacker',9999,3600)`), /permission denied/);
  });
  await t.test('Cannot upload into another user namespace', async () => {
    await assert.rejects(() => db.query(`INSERT INTO storage.objects(bucket_id,name) VALUES ('carousel-images',$1)`,[`${bob}/file.png`]), /row-level security/);
    await db.query(`INSERT INTO storage.objects(bucket_id,name) VALUES ('carousel-images',$1)`,[`${alice}/file.png`]);
  });
  const companyA = '10000000-0000-4000-8000-000000000001';
  const companyB = '10000000-0000-4000-8000-000000000002';
  const moduleId = '20000000-0000-4000-8000-000000000001';
  const lessonId = '30000000-0000-4000-8000-000000000001';
  const quizId = '40000000-0000-4000-8000-000000000001';
  const sharedId = '50000000-0000-4000-8000-000000000001';
  await db.exec(`RESET ROLE;
    INSERT INTO companies(id,name,slug,email,status,admin_user_id) VALUES
      ('${companyA}','A','a','a@example.test','active','${alice}'),('${companyB}','B','b','b@example.test','active','${bob}');
    INSERT INTO company_users(company_id,user_id,role) VALUES ('${companyA}','${alice}','admin'),('${companyB}','${bob}','admin');
    INSERT INTO modules(id,title,order_index,is_published) VALUES ('${moduleId}','Paid module',3,true);
    INSERT INTO lessons(id,module_id,title,duration_minutes) VALUES ('${lessonId}','${moduleId}','Lesson',60);
    INSERT INTO quizzes(id,lesson_id,title,questions,max_attempts) VALUES ('${quizId}','${lessonId}','Quiz','[{"question":"2+2","options":["4","3"],"correct":0}]',1);
    INSERT INTO saved_carousels(user_id,topic,config,slides,theme,public_share_id) VALUES
      ('${bob}','Shared','{}','[]','{}','${sharedId}');
    SET ROLE authenticated; SET request.jwt.claim.sub = '${alice}';`);
  await t.test('Teams load without recursion and hide the other company', async () => {
    const result = await db.query('SELECT company_id FROM company_users');
    assert.deepEqual(result.rows.map(r=>r.company_id),[companyA]);
  });
  await t.test('A company admin cannot transfer members to another tenant', async () => {
    await assert.rejects(()=>db.query(`UPDATE company_users SET company_id = $1 WHERE user_id = $2`,[companyB,alice]),/row-level security/);
  });
  await t.test('A company admin cannot upgrade their plan or seats', async () => {
    await assert.rejects(()=>db.query(`UPDATE companies SET plan='business',max_users=999 WHERE id=$1`,[companyA]),/administrator/);
    await db.query(`UPDATE companies SET name='My company' WHERE id=$1`,[companyA]);
  });
  await t.test('Shared carousel rows cannot be enumerated; exact link exposes only public fields', async () => {
    assert.equal((await db.query('SELECT * FROM saved_carousels')).rows.length,0);
    const result=await db.query('SELECT * FROM get_shared_carousel($1)',[sharedId]);
    assert.deepEqual(Object.keys(result.rows[0]).sort(),['slides','theme','topic']);
    assert.equal((await db.query('SELECT * FROM get_shared_carousel($1)',['nonexistent-long-id'])).rows.length,0);
  });
  await t.test('Free accounts cannot fetch paid lesson content', async () => {
    assert.equal((await db.query('SELECT * FROM lessons WHERE id=$1',[lessonId])).rows.length,0);
    assert.equal((await db.query('SELECT ai_sandbox_daily_limit() AS n')).rows[0].n,0);
  });
  await t.test('One-time payment grants access and a refund removes it', async () => {
    await db.exec(`RESET ROLE; INSERT INTO course_payments(stripe_checkout_session_id,stripe_payment_intent_id,user_id,status)
      VALUES('session','intent','${alice}','paid'); SET ROLE authenticated;`);
    assert.equal((await db.query('SELECT * FROM lessons WHERE id=$1',[lessonId])).rows.length,1);
    assert.equal((await db.query('SELECT ai_sandbox_daily_limit() AS n')).rows[0].n,50);
    await db.exec(`RESET ROLE; UPDATE course_payments SET status='refunded'; SET ROLE authenticated;`);
    assert.equal((await db.query('SELECT * FROM lessons WHERE id=$1',[lessonId])).rows.length,0);
    await db.exec(`RESET ROLE; UPDATE course_payments SET status='paid'; SET ROLE authenticated;`);
  });
  await t.test('Incomplete students cannot request a certificate', async () => {
    await assert.rejects(()=>db.query('SELECT * FROM issue_certificate()'),/incomplete/);
  });
  await t.test('Completing the course produces one certificate with server-calculated hours', async () => {
    await db.query(`INSERT INTO lesson_progress(user_id,lesson_id,completed) VALUES ($1,$2,true)`,[alice,lessonId]);
    const first=(await db.query('SELECT * FROM issue_certificate()')).rows[0];
    const second=(await db.query('SELECT * FROM issue_certificate()')).rows[0];
    assert.equal(first.id,second.id); assert.equal(first.total_hours,1);
  });
  await t.test('Repeated completion cannot inflate points', async () => {
    await db.query('UPDATE lesson_progress SET completed=false WHERE user_id=$1',[alice]);
    await db.query('UPDATE lesson_progress SET completed=true WHERE user_id=$1',[alice]);
    assert.equal((await db.query('SELECT points FROM user_points WHERE user_id=$1',[alice])).rows[0].points,10);
  });
  await t.test('Study streak is idempotent within a day and cannot be forged', async () => {
    assert.equal((await db.query('SELECT * FROM record_study_day()')).rows[0].current_streak,1);
    assert.equal((await db.query('SELECT * FROM record_study_day()')).rows[0].current_streak,1);
    const updated=await db.query('UPDATE user_streaks SET current_streak=999 WHERE user_id=$1 RETURNING *',[alice]);
    assert.equal(updated.rows.length,0);
  });
  await t.test('The database grades quiz answers, limits attempts and safely handles retries', async () => {
    const key='60000000-0000-4000-8000-000000000001';
    const first=(await db.query(`SELECT * FROM submit_quiz_attempt($1,'{"0":1}',$2,10)`,[quizId,key])).rows[0];
    assert.equal(Number(first.score),0); assert.equal(first.passed,false);
    const retry=(await db.query(`SELECT * FROM submit_quiz_attempt($1,'{"0":0}',$2,10)`,[quizId,key])).rows[0];
    assert.equal(Number(retry.score),0);
    await assert.rejects(()=>db.query(`SELECT * FROM submit_quiz_attempt($1,'{"0":0}',gen_random_uuid(),10)`,[quizId]),/Maximum attempts/);
  });
  await t.test('A member cannot award themselves an unearned achievement', async () => {
    const achievement=(await db.query("SELECT id FROM achievements WHERE slug='five-hundred-points'")).rows[0].id;
    await assert.rejects(()=>db.query('INSERT INTO user_achievements(user_id,achievement_id) VALUES($1,$2)',[alice,achievement]),/row-level security/);
  });
  await db.exec('RESET ROLE; SET ROLE service_role;');
  await t.test('Greenn retries are idempotent and older paid events cannot undo a refund', async () => {
    const purchase={saleId:101,clientId:201,userId:bob,productName:'Course',productId:301,amount:497,paymentMethod:'credit_card',email:'bob@example.test',name:'Bob',payload:{}};
    const send=(status,occurredAt)=>db.query('SELECT apply_greenn_purchase($1)',[JSON.stringify({...purchase,status,occurredAt})]);
    await send('paid','2026-09-24T10:00:00Z'); await send('paid','2026-09-24T10:00:00Z');
    assert.equal((await db.query('SELECT count(*) AS n FROM purchases WHERE greenn_sale_id=101')).rows[0].n,1);
    assert.equal((await db.query('SELECT access_status FROM profiles WHERE id=$1',[bob])).rows[0].access_status,'active');
    await db.query('SELECT apply_greenn_purchase($1)',[JSON.stringify({...purchase,userId:null,status:'refunded',occurredAt:'2026-09-24T11:00:00Z'})]);
    await send('paid','2026-09-24T10:00:00Z'); await send('paid',null);
    assert.equal((await db.query('SELECT status FROM purchases WHERE greenn_sale_id=101')).rows[0].status,'refunded');
    assert.equal((await db.query('SELECT access_status FROM profiles WHERE id=$1',[bob])).rows[0].access_status,'pending');
  });
  await t.test('Atomic quota rejects requests after the limit', async () => {
    const request = () => db.query(`SELECT consume_ai_quota('test',2,3600) AS allowed`);
    assert.equal((await request()).rows[0].allowed,true);
    assert.equal((await request()).rows[0].allowed,true);
    assert.equal((await request()).rows[0].allowed,false);
  });
});
