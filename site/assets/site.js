
(function(){
var dl=window.dataLayer=window.dataLayer||[];
function ev(name,p){var o={event:name,page_path:location.pathname};for(var k in p)o[k]=p[k];dl.push(o)}
document.addEventListener('click',function(e){
 var t=e.target.closest('[data-track],a');if(!t)return;
 if(t.dataset&&t.dataset.track){ev(t.dataset.track,{link_text:(t.textContent||'').trim().slice(0,80)});return}
 var h=t.getAttribute('href')||'';
 if(h.indexOf('tel:')===0)ev('phone_click',{link_url:h});
 else if(h.indexOf('mailto:')===0)ev('email_click',{link_url:h});
 else if(/instagram\.com/i.test(h))ev('instagram_click',{link_url:h});
 else if(/^https?:/i.test(h)&&t.hostname!==location.hostname)ev('outbound_click',{link_url:h});
 else if(/(^|\/)#contact$/.test(h)||t.classList.contains('btn'))ev('estimate_cta_click',{link_text:(t.textContent||'').trim().slice(0,80)});
});
document.addEventListener('focusin',function(e){var f=e.target.closest&&e.target.closest('form#cform');if(f&&!f.dataset.started){f.dataset.started=1;ev('form_start',{form_id:'contact'})}});
var v=document.getElementById('hv');
if(v&&innerWidth>=900&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!(navigator.connection&&navigator.connection.saveData)){
 v.src='/assets/video/hero.mp4';v.addEventListener('canplay',function(){v.classList.add('on');v.play().catch(function(){})},{once:true});v.load();}
document.querySelectorAll('#nav a').forEach(function(a){a.addEventListener('click',function(){document.getElementById('nav').classList.remove('open')})});
document.querySelectorAll('form#cform').forEach(function(f){
 f.addEventListener('submit',function(e){e.preventDefault();
  var ok=f.querySelector('.ok'),er=f.querySelector('.err');ok.hidden=er.hidden=true;
  if(!f.checkValidity()){f.reportValidity();return}
  var b=f.querySelector('button');b.disabled=true;
  fetch(f.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(f)))})
   .then(function(r){if(!r.ok)throw 0;ok.hidden=false;ev('generate_lead',{form_id:'contact'});f.reset()}).catch(function(){er.hidden=false}).finally(function(){b.disabled=false});});});
})();
