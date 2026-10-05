(function(root) {
  'use strict';
  var limits = {name:100,email:254,phone:40,project_type:40,city:100,message:4000,timeline:100,company:200,submission_id:36};
  var projects = ['Cabinets with installation','Flooring with installation','Combined cabinetry and flooring','Custom interior project','Materials only','Other'];
  function validate(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return {error:'Please check the inquiry fields.'};
    var data = {};
    for (var key in limits) {
      if (body[key] !== undefined && typeof body[key] !== 'string') return {error:'Please check the inquiry fields.'};
      var value = body[key] || '';
      if (value.length > limits[key]) return {error:'One of the fields is too long.'};
      data[key] = value.trim();
      if (key !== 'message' && /[\r\n\x00]/.test(data[key])) return {error:'Please check the inquiry fields.'};
    }
    if (data.company) return {spam:true};
    if (!data.name || !data.city || !data.message || projects.indexOf(data.project_type) === -1) return {error:'Add your name, project type, city and project description.'};
    if (!data.email && !data.phone) return {error:'Add an email address or a callback number.'};
    if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return {error:'Enter a valid email address.'};
    if (data.phone && (!/^[+\d().\-\s]+$/.test(data.phone) || data.phone.replace(/\D/g,'').length < 7 || data.phone.replace(/\D/g,'').length > 15)) return {error:'Enter a valid callback number.'};
    return {data:data};
  }
  var rules = {limits:limits,projects:projects,validate:validate};
  if (typeof module === 'object' && module.exports) module.exports = rules;
  else root.ContactRules = rules;
})(typeof window === 'object' ? window : globalThis);
