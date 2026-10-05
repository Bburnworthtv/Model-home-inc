const { chromium, devices } = require('/Users/brandonburnworth/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true});
 const phase = process.argv[2] || 'before';
 const origin = phase === 'before' ? 'http://127.0.0.1:4174' : phase.startsWith('live') ? 'https://www.modelhomeinc.com' : 'http://127.0.0.1:4173';
 const report=[];
 for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
  const context = await browser.newContext({...viewport.width===390?devices['iPhone 13']:{},viewport,deviceScaleFactor:1,reducedMotion:'reduce'});
  const page = await context.newPage();
  for (const route of (phase === 'live-source' ? ['/', '/wood','/waterproof','/custom','/semi-custom','/rta','/tile','/vanity','/faucet','/doors','/moulding'] : ['/', '/custom', '/wood'])) {
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin+route,{waitUntil:'networkidle',timeout:45000});
   await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}scrollTo(0,0);});
   await page.waitForTimeout(400);
   const name=`${phase}-${route==='/'?'home':route.slice(1)}-${viewport.width}`;
   await page.screenshot({path:path.join(__dirname,'../review/screenshots',name+'.png'),fullPage:true});
   if(phase==='live-source'&&viewport.width===1440){const out=path.join(__dirname,'../live-baseline',route.slice(1));fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),await page.content());}
   const state=await page.evaluate(()=>({title:document.title,h1:document.querySelector('h1')?.innerText,overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)}));
   report.push({name,...state,errors});
  }
  await context.close();
 }
 fs.writeFileSync(path.join(__dirname,`../review/${phase}-capture.json`),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
