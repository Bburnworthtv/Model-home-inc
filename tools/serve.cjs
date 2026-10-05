const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.mp4':'video/mp4', '.xml':'application/xml', '.txt':'text/plain', '.md':'text/plain; charset=utf-8', '.json':'application/json', '.csv':'text/csv' };
// Local review only. No email or external lead-system requests are made.
http.createServer(async (req, res) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Cache-Control', 'no-store');
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  if (pathname === '/api/contact') {
    let raw='';
    for await (const chunk of req) {raw+=chunk;if(Buffer.byteLength(raw)>16384){res.writeHead(413,{'Content-Type':'application/json'});return res.end(JSON.stringify({accepted:false,error:'Your inquiry is too long.'}));}}
    req.body=raw;
    res.status=code=>{res.statusCode=code;return res;};
    res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
    // Exercise the real handler with no delivery credentials. Never send local mail.
    return require('../site/api/contact.js').createHandler({env:{CONTACT_ALLOWED_ORIGINS:'http://127.0.0.1:4173'}})(req,res);
  }
  const mode = process.env.BASELINE === '1' ? 'baseline' : pathname.startsWith('/review/') ? 'review' : 'site';
  const relative = mode === 'review' ? pathname.slice('/review/'.length) : pathname.slice(1);
  const base = path.join(root, mode);
  let file = path.resolve(base, relative || 'index.html');
  if (mode==='site' && !path.extname(relative) && !relative.startsWith('assets/') && !relative.startsWith('_variants/')) {
    const ua=req.headers['user-agent']||'';
    const kind=url.searchParams.get('device') || (/iPad|Tablet/i.test(ua)?'tablet':/Mobile|Android|iPhone/i.test(ua)?'mobile':'desktop');
    if (kind!=='desktop') file=path.resolve(base,'_variants',kind,relative,'index.html');
  }
  if (!file.startsWith(base + path.sep)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile() || (mode === 'site' && !/\.(html|css|js|webp|png|jpg|mp4|xml|txt)$/.test(file))) {
    res.writeHead(404, {'Content-Type':'text/html'});
    return res.end(fs.existsSync(path.join(base, '404.html')) ? fs.readFileSync(path.join(base, '404.html')) : '<h1>Page not found</h1><a href="/">Home</a>');
  }
  res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Local review: http://127.0.0.1:' + (process.env.PORT || 4173)));
