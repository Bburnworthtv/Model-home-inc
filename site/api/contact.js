'use strict';
const {createHash} = require('node:crypto');
const rules = require('../assets/contact-rules.js');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fallback = 'Your inquiry could not be confirmed. Please retry, call 760-682-5027 or email info@modelhomeinc.com.';

// Acceptance means Resend accepted an email dispatch, not confirmed inbox delivery.
// Durable CRM receipt, delivery monitoring and retry queue remain launch dependencies.
function createHandler({fetchImpl = globalThis.fetch, env = process.env, timeoutMs = 8000} = {}) {
  return async function contact(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const fail = (code, error) => res.status(code).json({accepted:false,error});
    if (req.method !== 'POST') {res.setHeader('Allow','POST');return fail(405,'Use the inquiry form to send a message.');}
    const origin = req.headers?.origin;
    const allowed = ['https://www.modelhomeinc.com','https://modelhomeinc.com', ...(env.CONTACT_ALLOWED_ORIGINS || '').split(',').filter(Boolean)];
    if (env.VERCEL_URL) allowed.push('https://' + env.VERCEL_URL);
    if (origin && !allowed.includes(origin)) return fail(403,'Please use the Model Home website inquiry form.');
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers?.['content-type'] || '')) return fail(415,'Please send the inquiry as JSON.');
    let body;
    try {
      const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
      if (Buffer.byteLength(raw) > 16384) return fail(413,'Your inquiry is too long. Please shorten it.');
      body = JSON.parse(raw);
    } catch {return fail(400,'The inquiry could not be read. Please try again.');}
    const checked = rules.validate(body);
    if (checked.spam) return fail(422,'The inquiry was not accepted.');
    if (checked.error) return fail(400,checked.error);
    const data = checked.data;
    if (!uuid.test(data.submission_id)) return fail(400,'Please refresh the page and try again.');
    const {RESEND_API_KEY:key,CONTACT_TO:to,CONTACT_FROM:from} = env;
    const mailbox = /^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/;
    const sender = from?.match(/<([^<>]+)>$/)?.[1] || from;
    if (!key || !mailbox.test(to || '') || !mailbox.test(sender || '') || /[\r\n]/.test(from || '') || /@resend\.dev$/i.test(sender || '')) return fail(503,fallback);
    const isTest = env.CONTACT_TEST_MODE === 'true' || (env.VERCEL_ENV && env.VERCEL_ENV !== 'production');
    const esc = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const fields = [['Name',data.name],['Email',data.email],['Phone',data.phone],['Project',data.project_type],['City',data.city],['Timeline',data.timeline],['Description',data.message],['Reference',data.submission_id]];
    const digest = createHash('sha256').update(JSON.stringify(data)).digest('hex');
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(),timeoutMs);
    try {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method:'POST',signal:controller.signal,
        headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'inquiry/'+data.submission_id+'/'+digest},
        body:JSON.stringify({from,to:[to],...(data.email ? {reply_to:data.email} : {}),
          subject:(isTest ? '[TEST] ' : '')+'Model Home inquiry: '+data.project_type,
          text:fields.map(([k,v])=>k+': '+v).join('\n\n'),
          html:fields.map(([k,v])=>'<p><b>'+k+':</b> '+esc(v).replace(/\n/g,'<br>')+'</p>').join('')})
      });
      if (!response.ok) return fail(502,fallback);
      const receipt = await response.json();
      if (!uuid.test(receipt?.id || '')) return fail(502,fallback);
      return res.status(200).json({accepted:true,status:'email_dispatch_accepted',receipt_id:receipt.id,is_test:Boolean(isTest)});
    } catch {return fail(controller.signal.aborted ? 504 : 502,fallback);}
    finally {clearTimeout(timer);}
  };
}
module.exports = createHandler();
module.exports.createHandler = createHandler;
