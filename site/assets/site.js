(function(){
'use strict';
var dl=window.dataLayer=window.dataLayer||[];
function ev(name,p){dl.push(Object.assign({event:name,page_path:location.pathname},p||{}));}
document.addEventListener('click',function(e){
 var t=e.target.closest('a,[data-track]');if(!t)return;
 var h=t.getAttribute('href')||'';
 if(h.indexOf('tel:')===0)ev('phone_click');
 else if(h.indexOf('mailto:')===0)ev('email_click');
 else if(t.dataset.track)ev(t.dataset.track,{destination:h.split('#')[0]||location.pathname});
 else if(/#(?:contact|Contact)$/.test(h))ev('consultation_cta_click');
 else if(['/wood','/custom','/semi-custom','/rta','/waterproof'].indexOf(h)!==-1)ev('service_click',{destination:h});
},true);
var emitted=new Set();
var drawer=document.getElementById('mobile-hamburger-drawer'),menu=document.getElementById('layout-drawer-hamburger');
if(drawer&&menu){
 var closeDrawer=function(focus){if(menu.getAttribute('aria-expanded')==='true')menu.click();menu.setAttribute('aria-expanded','false');if(focus)menu.focus();};
 drawer.addEventListener('click',function(e){if(e.target.closest('a'))closeDrawer(false);});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){e.preventDefault();closeDrawer(true);}});
 new MutationObserver(function(){menu.setAttribute('aria-expanded',String(drawer.hasAttribute('open')));}).observe(drawer,{attributes:true,attributeFilter:['open']});
}
document.querySelectorAll('form#cform').forEach(function(f){
 var busy=false,submissionId='',payload='';
 f.addEventListener('focusin',function(){if(!f.dataset.started){f.dataset.started='1';ev('form_start',{form_id:'contact'});}});
 f.addEventListener('submit',async function(e){
  e.preventDefault();e.stopImmediatePropagation();if(busy)return;
  var ok=f.querySelector('.ok'),er=f.querySelector('.err'),button=f.querySelector('[type=submit]');ok.hidden=er.hidden=true;
  if(!f.checkValidity()){f.reportValidity();return;}
  var data=Object.fromEntries(new FormData(f)),check=window.ContactRules.validate(data);
  if(check.error||check.spam){er.textContent=check.error||'The inquiry was not accepted.';er.hidden=false;return;}
  data=check.data;delete data.submission_id;
  var current=JSON.stringify(data);
  if(current!==payload||!submissionId){submissionId=crypto.randomUUID();payload=current;}
  data.submission_id=submissionId;
  busy=true;button.disabled=true;button.value='Sending…';f.setAttribute('aria-busy','true');
  var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},12000);
  try{
   var response=await fetch(f.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
   var receipt=await response.json();
   if(!response.ok||receipt.accepted!==true||receipt.status!=='email_dispatch_accepted'||typeof receipt.receipt_id!=='string'||!receipt.receipt_id)throw new Error(receipt.error||'Your inquiry could not be confirmed. Please retry, call 760-682-5027 or email info@modelhomeinc.com.');
   ok.textContent=receipt.is_test?'Test dispatch accepted. This is not a production lead.':'Your inquiry was accepted for email dispatch. If you need to confirm receipt, call 760-682-5027.';ok.hidden=false;
   var storageKey='modelhome-lead:'+receipt.receipt_id,already=emitted.has(receipt.receipt_id);
   try{already=already||sessionStorage.getItem(storageKey)==='1';}catch(_){}
   if(!receipt.is_test&&!already){ev('generate_lead',{form_id:'contact',project_type:data.project_type});emitted.add(receipt.receipt_id);try{sessionStorage.setItem(storageKey,'1');}catch(_){}}
   f.reset();delete f.dataset.started;submissionId='';payload='';
  }catch(error){er.textContent=error.name==='AbortError'?'Your inquiry could not be confirmed in time. Retry without changing the form, or call 760-682-5027.':error.message;er.hidden=false;}
  finally{clearTimeout(timer);busy=false;button.disabled=false;button.value='Send Inquiry';f.removeAttribute('aria-busy');}
 },true);
});
// Avoid the hosted builder's AJAX navigation; retain the captured template on each route.
document.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;var url=new URL(a.href,location.href);if(url.origin===location.origin&&url.pathname!==location.pathname){if(drawer&&drawer.contains(a))closeDrawer(false);e.preventDefault();e.stopImmediatePropagation();location.assign(url.href);}},true);
})();
