const {chromium}=require('/Users/brandonburnworth/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const context=await browser.newContext();
 const root=path.resolve(__dirname,'..');
 const urls=new Set(['/','/wood','/waterproof','/custom','/semi-custom','/rta','/tile','/vanity','/faucet','/doors','/moulding','/quote','/store']);
 const source=fs.readFileSync(path.join(root,'live-source/desktop/index.html'),'utf8');
 for(const match of source.matchAll(/href="(\/store[^"#]*)"/g))urls.add(match[1]);
 const observations=[];
 for(const suffix of ['/robots.txt','/sitemap.xml','/sitemap_index.xml']){
  const response=await context.request.get('https://www.modelhomeinc.com'+suffix);const body=await response.text();
  observations.push({url:suffix,status:response.status(),content_type:response.headers()['content-type'],body_excerpt:body.slice(0,200)});
  if(response.status()===200&&body.includes('<urlset')){fs.writeFileSync(path.join(root,'review/live-sitemap.xml'),body);for(const m of body.matchAll(/<loc>(.*?)<\/loc>/g)){try{const u=new URL(m[1]);if(u.hostname==='www.modelhomeinc.com')urls.add(u.pathname);}catch{}}}
 }
 const rows=[];
 for(const url of urls){
  const response=await context.request.get('https://www.modelhomeinc.com'+url,{maxRedirects:0});
  rows.push({old_url:'https://www.modelhomeinc.com'+url,status:response.status(),location:response.headers().location||'',destination:['','wood','waterproof','custom','semi-custom','rta','tile','vanity','faucet','doors','moulding'].includes(url.slice(1))?url:'',decision:url.startsWith('/store')?'Preserve active store; no redirect approved':url==='/quote'?'Pending popup URL review; no redirect approved':'Keep existing URL',reason:url.startsWith('/store')?'Store is outside this sprint; GSC, analytics, backlinks and catalog exports unavailable':'No URL consolidation or removal requested',test_result:response.status()===200?'Public response 200':'Review response and any redirect before launch'});
 }
 const columns=Object.keys(rows[0]),quote=s=>'"'+String(s).replace(/"/g,'""')+'"';
 fs.writeFileSync(path.join(root,'review/url-inventory.csv'),[columns.join(','),...rows.map(r=>columns.map(c=>quote(r[c])).join(','))].join('\n')+'\n');
 fs.writeFileSync(path.join(root,'review/crawl-observations.json'),JSON.stringify({observed_at:'2026-10-05',discovery:'Live navigation, supplied routes, public sitemap. Not a full catalog or search inventory.',observations,url_count:rows.length},null,2));
 console.log(JSON.stringify({url_count:rows.length,observations:observations.map(({url,status})=>({url,status}))},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
