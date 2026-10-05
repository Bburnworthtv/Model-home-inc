const {chromium,devices}=require('/Users/brandonburnworth/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const keys=['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','textTransform'];
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const checks=[];
 for(const [device,opts] of [['desktop',{viewport:{width:1440,height:1000}}],['mobile',{...devices['iPhone 13'],deviceScaleFactor:1}],['tablet',{...devices['iPad (gen 7)'],deviceScaleFactor:1}]] ){
  const context=await browser.newContext({...opts,reducedMotion:'reduce'});const page=await context.newPage();
  for(const route of ['custom','wood','waterproof']){
   const styles=[];
   for(const origin of ['https://www.modelhomeinc.com','http://127.0.0.1:4173']){
    await page.goto(origin+'/'+route,{waitUntil:'networkidle'});
    styles.push(await page.evaluate(({keys})=>{
      const out={};for(const [name,selector] of [['hero','#1818480987'],['heading','#1743015651'],['bodycopy','#1330027818'],['button','#1853783899'],['footer','#1617448979']]){
       const wrapper=document.getElementById(selector.slice(1));const el=name==='heading'?wrapper.querySelector('h1,h3'):name==='hero'?wrapper.querySelector('h1,h2'):name==='bodycopy'?wrapper.querySelector('p:not(.mh-breadcrumb)'):wrapper;
       const computed=getComputedStyle(el);out[name]=Object.fromEntries(keys.map(k=>[k,computed[k]]));
      }return out;
    },{keys}));
   }
   const differences=[];for(const name in styles[0])for(const key of keys)if(styles[0][name][key]!==styles[1][name][key])differences.push({element:name,property:key,live:styles[0][name][key],preview:styles[1][name][key]});
   checks.push({device,route,differences,live:styles[0],preview:styles[1]});
  }
  await context.close();
 }
 fs.writeFileSync(path.join(__dirname,'../review/design-validation.json'),JSON.stringify({checks},null,2));console.log(JSON.stringify(checks.map(({device,route,differences})=>({device,route,differences})),null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
