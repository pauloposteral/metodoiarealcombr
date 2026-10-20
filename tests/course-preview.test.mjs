import test from 'node:test';
import assert from 'node:assert/strict';
import { testDatabase } from './helpers/db.mjs';

// Regression: order_index 0/1 in another PAID course must not grant free access.
test('Free preview is scoped to the main formation, never to another paid course', async (t) => {
  const db = await testDatabase(); t.after(() => db.close());
  const user = '01000000-0000-4000-8000-000000000021';
  const main = '0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7';
  const other = '01000000-0000-4000-8000-000000000022';
  const free = '01000000-0000-4000-8000-000000000023';
  const modules = ['02000000-0000-4000-8000-000000000021','02000000-0000-4000-8000-000000000022','02000000-0000-4000-8000-000000000023'];
  const lessons = ['03000000-0000-4000-8000-000000000021','03000000-0000-4000-8000-000000000022','03000000-0000-4000-8000-000000000023'];
  await db.query('INSERT INTO auth.users(id,email) VALUES($1,$2)', [user,'preview@example.test']);
  await db.query(`INSERT INTO courses(id,title,slug,is_published,is_free) VALUES
    ($1,'Main preview','preview-main-regression',true,false),
    ($2,'Paid specialist','preview-paid-regression',true,false),
    ($3,'Free course','preview-free-regression',true,true)
    ON CONFLICT(id) DO UPDATE SET is_published=true`, [main,other,free]);
  for (let i=0;i<3;i++) {
    await db.query('INSERT INTO modules(id,course_id,title,order_index,is_published) VALUES($1,$2,$3,0,true)', [modules[i],[main,other,free][i],`Module ${i}`]);
    await db.query('INSERT INTO lessons(id,module_id,title,content,is_free) VALUES($1,$2,$3,$4,false)', [lessons[i],modules[i],`Lesson ${i}`,'Private teaching content']);
  }
  await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub='${user}';`);
  await t.test('Another paid course starts locked', async () => {
    assert.equal((await db.query('SELECT id FROM lessons WHERE id=$1',[lessons[1]])).rows.length,0);
  });
  await t.test('Main preview and explicitly free course stay available', async () => {
    for (const id of [lessons[0],lessons[2]]) assert.equal((await db.query('SELECT id FROM lessons WHERE id=$1',[id])).rows.length,1);
  });
  await t.test('Outline agrees with the paid lesson boundary', async () => {
    const row=(await db.query("SELECT * FROM get_course_outline('preview-paid-regression')")).rows[0];
    assert.equal(row.accessible,false);
    assert.ok(!Object.hasOwn(row,'content'));
  });
  await db.exec(`RESET ROLE; INSERT INTO course_payments(stripe_checkout_session_id,stripe_payment_intent_id,user_id,status) VALUES('preview-regression-paid','preview-regression-intent','${user}','paid'); SET ROLE authenticated;`);
  await t.test('Paid member can read the specialist course', async () => {
    assert.equal((await db.query('SELECT id FROM lessons WHERE id=$1',[lessons[1]])).rows.length,1);
  });
});
