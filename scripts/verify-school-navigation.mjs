// Uses real built UI with mocked auth/database/provider. Never submits a real signup, payment, post or email.
import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const origin=process.env.SCHOOL_ORIGIN||'http://127.0.0.1:4195';const env=fs.readFileSync('.env','utf8');const api=(env.match(/^VITE_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)||[])[1];if(!api)throw Error('Public API URL missing');const apiHost=new URL(api).hostname;const key=`sb-${apiHost.split('.')[0]}-auth-token`;
const uid='00000000-0000-4000-8000-000000009101';const lessonId='5ffa37ee-6b74-6358-fa6e-f51cd3f8dafc';const user={id:uid,email:'school-fixture@example.invalid',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email',providers:['email']},user_metadata:{full_name:'Pessoa de teste'},created_at:'2026-10-20T00:00:00Z'};const exp=Math.floor(Date.now()/1000)+3600;const token=[Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'),Buffer.from(JSON.stringify({sub:uid,aud:'authenticated',role:'authenticated',exp,iss:api+'/auth/v1'})).toString('base64url'),'not-a-real-signature'].join('.');const session={access_token:token,refresh_token:'local-fixture',expires_in:3600,expires_at:exp,token_type:'bearer',user};
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});fs.mkdirSync('test-results/school',{recursive:true});const results=[];
async function setup(width=390,mode='guest',storageFail=false){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',acceptDownloads:true});context.setDefaultTimeout(14000);
 if(['paid','locked','storage','access-error'].includes(mode))await context.addInitScript(({key,session})=>localStorage.setItem(key,JSON.stringify(session)),{key,session});
 if(storageFail)await context.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('ia-real:reel-v1:'))throw Error('Fixture storage unavailable');return original.call(this,k,v);};});
 const writes=[],external=[];let signupCount=0;
 await context.route('**/*',async route=>{const req=route.request();const u=new URL(req.url());if(u.origin===origin)return route.continue();if(u.hostname!==apiHost){external.push(req.url());return route.fulfill({status:200,body:'External provider fixture, not a payment',contentType:'text/plain'});}
  if(u.pathname==='/auth/v1/signup'){signupCount++;return route.fulfill({json:user});}
  if(u.pathname==='/auth/v1/token')return route.fulfill({json:session});
  if(u.pathname==='/auth/v1/user')return route.fulfill({json:{user}});
  if(u.pathname==='/auth/v1/logout')return route.fulfill({status:204,body:''});
  if(u.pathname.includes('/functions/')){writes.push({path:u.pathname,body:req.postDataJSON()});return route.fulfill({json:{url:'https://checkout.stripe.com/c/pay/fixture'}});}
  if(!u.pathname.startsWith('/rest/v1/'))return route.fulfill({json:{}});
  const name=u.pathname.split('/').pop();if(req.method()!=='GET'&&!u.pathname.includes('/rpc/'))writes.push({path:name,body:req.postDataJSON()});
  if(u.pathname.includes('/rpc/')){if(name==='has_role')return route.fulfill({json:false});return route.fulfill({json:[]});}
  if(name==='profiles'&&mode==='access-error')return route.fulfill({status:503,json:{message:'Fixture profile lookup unavailable'}});
  let rows=[];if(name==='profiles')rows=[{id:uid,access_status:mode==='paid'||mode==='storage'?'active':'pending',full_name:'Pessoa de teste',onboarding_done:true,selected_trail:'criador'}];
  if(name==='lessons'&&mode!=='locked')rows=[{id:lessonId,module_id:'00000000-0000-4000-8000-000000009103',title:'Vídeo curto — aula fictícia',content:'## Explicação completa\nConteúdo de teste autorizado.\n\n:::exercise Prática\nPrepare seu roteiro.\n:::',type:'text',prompts:['Um pedido de teste.'],video_url:null,estimated_minutes:25,reviewed_at:'2026-10-20',order_index:2}];
  const single=(req.headers().accept||'').includes('application/vnd.pgrst.object+json');return route.fulfill({json:single?rows[0]??null:rows,headers:{'content-range':rows.length?'0-0/1':'*/0'}});
 });
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));return{context,page,writes,external,errors,signups:()=>signupCount};
}
async function dismissCookies(page){const b=page.getByRole('button',{name:'Apenas essenciais',exact:true});if(await b.count())await b.click();}
const mainId='0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7';const labId='e20b4e91-fe38-b030-b292-6bd0094846fe';
const mainLesson='00000000-0000-4000-8000-000000009110';const labLesson1='00000000-0000-4000-8000-000000009111';const labLesson2='00000000-0000-4000-8000-000000009112';
try {
 for(const width of [390,1440]){
  const {context,page,errors}=await setup(width,'paid');
  await context.route('**/rest/v1/courses?**',route=>route.fulfill({json:[{id:mainId,title:'Formação principal',slug:'main-fixture',is_free:false},{id:labId,title:'Laboratório de teste',slug:'lab-fixture',is_free:false}]}));
  await context.route('**/rest/v1/rpc/get_course_outline',route=>{
   const lab=route.request().postDataJSON().course_slug==='lab-fixture';const ids=lab?[labLesson1,labLesson2]:[mainLesson];
   return route.fulfill({json:ids.map((id,index)=>({course_id:lab?labId:mainId,module_id:lab?'00000000-0000-4000-8000-000000009120':'00000000-0000-4000-8000-000000009121',module_code:lab?null:'MOD-00',module_title:lab?'Missão de teste':'Introdução',module_description:'Fixture',module_order:0,module_hours_label:'30 min',module_trails:lab?[]:['criador'],module_project_title:'Projeto de teste',module_is_star:false,lesson_id:id,lesson_title:lab?['Primeira missão','Próxima missão do laboratório'][index]:'Primeira aula principal',lesson_description:'Fixture',lesson_order:index,lesson_type:'text',estimated_minutes:15,is_free:false,accessible:true}))});
  });
  await context.route('**/rest/v1/lesson_progress?**',route=>{const u=new URL(route.request().url());const select=u.searchParams.get('select')||'';if(select.includes('started_at'))return route.fulfill({json:[{lesson_id:labLesson1,started_at:'2026-10-20T15:00:00Z'}]});if(select.includes('lessons'))return route.fulfill({json:[]});return route.fulfill({json:[{lesson_id:labLesson1}]});});
  await page.goto(origin+'/membros',{waitUntil:'networkidle'});await dismissCookies(page);const resume=page.getByRole('link',{name:/Continuar aula/});await resume.waitFor();assert.ok((await resume.getAttribute('href')).endsWith(labLesson2));await page.getByText('Laboratório de teste',{exact:true}).first().waitFor();
  if(width===390)await page.locator('[data-sidebar=trigger]').first().click();
  const nav=page.getByRole('navigation',{name:'Navegação principal do aluno'});await nav.waitFor();assert.equal(await nav.locator('[data-primary-destination]').count(),5);
  for(const label of ['Início','Aprender','Laboratório','Criar','Perfil'])await nav.getByRole('link',{name:label,exact:true}).waitFor();
  await nav.getByRole('button',{name:'Mostrar opções de Aprender'}).click();await nav.getByRole('link',{name:'Materiais',exact:true}).waitFor();await nav.getByRole('link',{name:'Prompts',exact:true}).waitFor();
  await nav.getByRole('button',{name:'Mostrar opções de Perfil'}).click();await nav.getByRole('link',{name:'Comunidade',exact:true}).waitFor();await nav.getByRole('link',{name:'Suporte',exact:true}).waitFor();
  await nav.getByRole('button',{name:'Mostrar opções de Criar'}).click();await nav.getByRole('link',{name:'Carrosséis',exact:true}).waitFor();await nav.getByRole('link',{name:'Stories',exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);await page.screenshot({path:'test-results/school/navigation-'+width+'.png'});
  await nav.getByRole('link',{name:'Criar',exact:true}).click();await page.waitForURL(/pratica-reels/);await page.locator('[data-reels-workbook]').waitFor();
  results.push({width,crossCourseResume:true,nextLabLesson:true,fiveDestinations:true,secondaryRoutesRetained:true,workshopReachable:true,noOverflow:true});await context.close();
 }
 fs.writeFileSync('test-results/school/navigation-results.json',JSON.stringify({scope:'Built navigation and dashboard with mock catalog/session/history',results},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
