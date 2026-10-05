const {chromium,devices}=require('/Users/brandonburnworth/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const origin='http://127.0.0.1:4173',report=[];
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 for(const [device,opts] of [['desktop',{viewport:{width:1440,height:1000}}],['phone',{...devices['iPhone 13'],deviceScaleFactor:1}],['tablet',{...devices['iPad (gen 7)'],deviceScaleFactor:1}]] ){
  const context=await browser.newContext({...opts,reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const route of ['/','/custom','/wood','/waterproof','/semi-custom','/rta','/tile','/vanity','/faucet','/doors','/moulding']){
   const response=await page.goto(origin+route,{waitUntil:'load'});assert.equal(response.status(),200);assert.match(response.headers()['x-robots-tag'],/noindex/);await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('h1').count(),1);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert.equal(overflow,false,device+' '+route+' overflow');report.push({device,route,status:200,overflow:false,h1:await page.locator('h1').innerText()});console.log('Route passed:',device,route);
  }
  if(device==='phone'){
   await page.goto(origin+'/custom',{waitUntil:'networkidle'});const button=page.locator('#layout-drawer-hamburger');
   await button.click();await page.waitForFunction(()=>document.getElementById('layout-drawer-hamburger').getAttribute('aria-expanded')==='true',{timeout:5000});await page.keyboard.press('Escape');await page.waitForFunction(()=>document.getElementById('layout-drawer-hamburger').getAttribute('aria-expanded')==='false');assert.equal(await page.evaluate(()=>document.activeElement.id),'layout-drawer-hamburger');
   await button.click();await page.locator('#mobile-hamburger-drawer a[href="/#Contact"]').click();await page.waitForURL(origin+'/#Contact',{timeout:15000});assert.equal(await page.locator('#layout-drawer-hamburger').getAttribute('aria-expanded'),'false');
   report.push({device,menu:'open, Escape focus restoration, contact navigation and collapsed state passed'});
  }
  if(device==='desktop'){
   await page.goto(origin+'/custom',{waitUntil:'networkidle'});await page.locator('.mh-answer summary').first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.mh-answer').first().getAttribute('open'),'');
   await page.locator('a[href="/#Contact"]').filter({hasText:'Discuss Your Project'}).first().click();await page.waitForURL(origin+'/#Contact',{timeout:15000});assert.equal(await page.locator('#cform').count(),1);
  }
  assert.equal(errors.length,0,JSON.stringify(errors));await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(15000);
 let scenario=0;
 async function fresh(){console.log('Form scenario:',++scenario);await page.goto(origin+'/?local_test='+scenario+'#Contact',{waitUntil:'load'});}
 async function fill(){await page.locator('[name=name]').fill('Browser QA');await page.locator('[name=email]').fill('qa@example.com');await page.locator('[name=city]').fill('San Marcos');await page.locator('[name=project_type]').selectOption('Flooring with installation');await page.locator('[name=message]').fill('Test inquiry. No email is sent.');}
 async function leads(){return page.evaluate(()=>dataLayer.filter(x=>x.event==='generate_lead').length);}
 await fresh();await fill();await page.locator('#cform [type=submit]').click();await page.locator('#cform .err').waitFor({state:'visible'});assert.equal(await page.locator('[name=name]').inputValue(),'Browser QA');assert.equal(await leads(),0);report.push({contact:'Real local handler: missing configuration error, retained values, zero leads'});
 let calls=0;const receipt={accepted:true,status:'email_dispatch_accepted',receipt_id:'c7ea9587-cd08-46b2-a43a-8bf1371c2a15',is_test:false};
 await page.route('**/api/contact',async route=>{calls++;await new Promise(r=>setTimeout(r,200));await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(receipt)});});
 await fresh();await fill();await page.evaluate(()=>{const f=document.getElementById('cform');f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});await page.locator('#cform .ok').waitFor({state:'visible'});assert.equal(calls,1);assert.equal(await leads(),1);assert.equal(await page.locator('[name=name]').inputValue(),'');
 await fill();await page.locator('#cform [type=submit]').click();await page.locator('#cform .ok').waitFor({state:'visible'});assert.equal(await leads(),1);report.push({contact:'Mock acceptance: one request for repeat clicks; one lead event for repeated receipt'});
 const events=await page.evaluate(()=>dataLayer.filter(x=>x.event));assert.doesNotMatch(JSON.stringify(events),/Browser QA|qa@example|Test inquiry|San Marcos/);report.push({analytics:'Events contain no visitor name, contact details, city or message'});
 await page.unroute('**/api/contact');
 for(const [name,status,body] of [['rejection with HTTP 200',200,{accepted:false}],['provider error',502,{accepted:false,error:'Provider test error'}],['test acceptance',200,{...receipt,is_test:true,receipt_id:'3c98f6ae-1ce5-4c49-bd48-14f36692d304'}]]){
  await page.route('**/api/contact',route=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)}));await fresh();await fill();await page.locator('#cform [type=submit]').click();await page.locator(name==='test acceptance'?'#cform .ok':'#cform .err').waitFor({state:'visible'});assert.equal(await leads(),0);await page.unroute('**/api/contact');report.push({contact:name,lead_events:0});
 }
 await fresh();await fill();await page.locator('[name=company]').evaluate(e=>e.value='spam');await page.locator('#cform [type=submit]').click();await page.locator('#cform .err').waitFor({state:'visible'});assert.equal(await leads(),0);report.push({contact:'Honeypot: rejected before request; zero leads'});
 await context.close();await browser.close();
 fs.writeFileSync(path.join(__dirname,'../review/browser-validation.json'),JSON.stringify({passed:true,checks:report},null,2));console.log(JSON.stringify({passed:true,route_variants:33,checks:report.filter(x=>!x.route)},null,2));
})().catch(e=>{fs.writeFileSync(path.join(__dirname,'../review/browser-validation.json'),JSON.stringify({passed:false,error:e.message,completed:report},null,2));console.error(e);process.exit(1);});
