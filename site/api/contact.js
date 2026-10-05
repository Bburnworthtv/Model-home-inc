// Vercel serverless function: sends the contact form via Resend (https://resend.com).
// Env vars (Vercel > Settings > Environment Variables): RESEND_API_KEY, CONTACT_TO, CONTACT_FROM
module.exports=async function(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  if(b.company) return res.status(200).json({ok:true});          // honeypot
  const clean=s=>String(s||'').slice(0,4000);
  const name=clean(b.name),email=clean(b.email),phone=clean(b.phone),message=clean(b.message);
  if(!name||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||!message) return res.status(400).json({error:'Missing fields'});
  const key=process.env.RESEND_API_KEY;
  if(!key) return res.status(500).json({error:'Email service not configured'});
  const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const r=await fetch('https://api.resend.com/emails',{method:'POST',
    headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
    body:JSON.stringify({from:process.env.CONTACT_FROM||'Model Home Inc. Website <onboarding@resend.dev>',
      to:[process.env.CONTACT_TO||'info@modelhomeinc.com'],reply_to:email,
      subject:'New website inquiry from '+name.replace(/[\r\n]/g,' '),
      html:`<p><b>Name:</b> ${esc(name)}</p><p><b>Email:</b> ${esc(email)}</p><p><b>Phone:</b> ${esc(phone)}</p><p><b>Newsletter:</b> ${b.newsletter?'yes':'no'}</p><p>${esc(message).replace(/\n/g,'<br>')}</p>`})});
  return res.status(r.ok?200:502).json({ok:r.ok});
};
