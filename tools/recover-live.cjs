const {chromium,devices} = require('/Users/brandonburnworth/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const routes=['','wood','waterproof','custom','semi-custom','rta','tile','vanity','faucet','doors','moulding'];
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 for(const [kind,settings] of [['desktop',{viewport:{width:1440,height:1000}}],['mobile',{...devices['iPhone 13'],viewport:{width:390,height:844}}],['tablet',{...devices['iPad (gen 7)']}]] ){
  const context=await browser.newContext({...settings,reducedMotion:'reduce'});const page=await context.newPage();
  for(const route of routes){
   const response=await page.goto('https://www.modelhomeinc.com/'+route,{waitUntil:'networkidle',timeout:45000});
   // Omit unused mapping credentials exposed by the public builder runtime.
   const html=(await response.text()).replace(/^\s*rtCommonProps\["common\.(?:mapbox\.token|here\.appId|here\.appCode)"\]\s*=.*?;\s*$/gm,'');
   const dir=path.join(root,'live-source',kind,route);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html);
   if(['','custom','wood'].includes(route)&&kind!=='tablet'){
    await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=650){scrollTo(0,y);await new Promise(r=>setTimeout(r,150));}scrollTo(0,0);});
    await page.waitForTimeout(300);
    await page.screenshot({path:path.join(root,`review/screenshots/live-${route||'home'}-${kind}.png`),fullPage:true});
   }
   console.log(kind,route||'home',response.status(),html.length);
  }
  await context.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
