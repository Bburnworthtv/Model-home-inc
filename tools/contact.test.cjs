const test=require('node:test');
const assert=require('node:assert/strict');
const {createHandler}=require('../site/api/contact.js');
const valid={name:'QA Visitor',email:'qa@example.com',phone:'',project_type:'Flooring with installation',city:'San Marcos',message:'Local automated test only.',company:'',timeline:'',submission_id:'8b3b6c63-cf13-4e39-a0aa-d3b369a45d54'};
const receipt='c7ea9587-cd08-46b2-a43a-8bf1371c2a15';
const config={RESEND_API_KEY:'mock-key',CONTACT_FROM:'Model Home <website@example.com>',CONTACT_TO:'inbox@example.com'};
async function invoke({body=valid,method='POST',headers={},env=config,fetchImpl=async()=>({ok:true,json:async()=>({id:receipt})}),timeoutMs=50}={}){
 const result={headers:{}};
 const res={setHeader:(k,v)=>{result.headers[k]=v;},status:c=>{result.status=c;return res;},json:b=>{result.body=b;return res;}};
 await createHandler({env,fetchImpl,timeoutMs})({method,headers:{'content-type':'application/json',...headers},body},res);
 return result;
}
test('genuine dispatch acceptance has explicit status and receipt',async()=>{const r=await invoke();assert.equal(r.status,200);assert.deepEqual(r.body,{accepted:true,status:'email_dispatch_accepted',receipt_id:receipt,is_test:false});});
test('malformed JSON is controlled',async()=>assert.equal((await invoke({body:'{bad'})).status,400));
test('wrong method has Allow header',async()=>{const r=await invoke({method:'GET'});assert.equal(r.status,405);assert.equal(r.headers.Allow,'POST');});
test('invalid fields, arrays, missing contact, enum and limits are rejected',async()=>{for(const body of [[],null,{...valid,email:'bad'},{...valid,name:''},{...valid,email:'',phone:''},{...valid,city:''},{...valid,project_type:'unknown'},{...valid,message:'x'.repeat(4001)},{...valid,name:10},{...valid,name:'bad\r\nname'},{...valid,phone:'123'},{...valid,submission_id:'bad'}])assert.equal((await invoke({body})).status,400);});
test('phone-only inquiries accepted without reply_to',async()=>{let payload;const r=await invoke({body:{...valid,email:'',phone:'760-555-0100'},fetchImpl:async(u,o)=>{payload=JSON.parse(o.body);return {ok:true,json:async()=>({id:receipt})};}});assert.equal(r.status,200);assert.equal(payload.reply_to,undefined);});
test('honeypot is rejected without provider call',async()=>{let calls=0;const r=await invoke({body:{...valid,company:'spam'},fetchImpl:async()=>{calls++;}});assert.equal(r.body.accepted,false);assert.equal(r.status,422);assert.equal(calls,0);});
test('oversized body and wrong content type rejected',async()=>{assert.equal((await invoke({body:'x'.repeat(17000)})).status,413);assert.equal((await invoke({headers:{'content-type':'text/plain'}})).status,415);});
test('untrusted browser origin rejected',async()=>assert.equal((await invoke({headers:{origin:'https://example.com'}})).status,403));
test('missing sender/key/recipient and provider test sender rejected',async()=>{for(const env of [{},{...config,RESEND_API_KEY:''},{...config,CONTACT_FROM:''},{...config,CONTACT_TO:''},{...config,CONTACT_FROM:'onboarding@resend.dev'}])assert.equal((await invoke({env})).status,503);});
test('provider refusal, invalid receipt, invalid JSON and network failure controlled',async()=>{for(const fetchImpl of [async()=>({ok:false}),async()=>({ok:true,json:async()=>({})}),async()=>({ok:true,json:async()=>{throw Error('bad JSON');}}),async()=>{throw Error('network');}])assert.equal((await invoke({fetchImpl})).status,502);});
test('provider timeout aborts and returns 504',async()=>{const r=await invoke({timeoutMs:5,fetchImpl:(u,o)=>new Promise((resolve,reject)=>o.signal.addEventListener('abort',()=>reject(Error('aborted'))))});assert.equal(r.status,504);});
test('unchanged retries reuse provider idempotency key; edited data differs',async()=>{const keys=[];const fetchImpl=async(u,o)=>{keys.push(o.headers['Idempotency-Key']);return {ok:true,json:async()=>({id:receipt})};};await invoke({fetchImpl});await invoke({fetchImpl});await invoke({body:{...valid,message:'Changed scope'},fetchImpl});assert.equal(keys[0],keys[1]);assert.notEqual(keys[0],keys[2]);});
test('preview and configured tests are identified as tests',async()=>{for(const env of [{...config,VERCEL_ENV:'preview'},{...config,CONTACT_TEST_MODE:'true'}])assert.equal((await invoke({env})).body.is_test,true);});
test('inquiry text is escaped and PII is excluded from response',async()=>{let payload;const body={...valid,message:'<script>bad</script>'};const r=await invoke({body,fetchImpl:async(u,o)=>{payload=JSON.parse(o.body);return {ok:true,json:async()=>({id:receipt})};}});assert.match(payload.html,/&lt;script&gt;/);assert.doesNotMatch(JSON.stringify(r.body),/QA Visitor|qa@example/);});
