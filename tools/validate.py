from pathlib import Path
from lxml import html, etree
from urllib.parse import urlparse
import json
ROOT=Path(__file__).resolve().parents[1]
content=json.loads((ROOT/'tools/content.json').read_text())
results=[];errors=[]
for kind in ['desktop','mobile','tablet']:
  titles=[];descriptions=[]
  for route in content['pages']:
    path=ROOT/'site'/route/'index.html' if kind=='desktop' else ROOT/'site/_variants'/kind/route/'index.html'
    doc=html.fromstring(path.read_text());url='https://www.modelhomeinc.com/'+route
    h1=doc.xpath('//h1');title=doc.xpath('//title/text()');desc=doc.xpath('//meta[@name="description"]/@content')
    assert len(h1)==1,(kind,route,'H1 count');assert title and title[0];assert desc and desc[0]
    assert doc.xpath('//link[@rel="canonical"]/@href')==[url],(kind,route,'canonical')
    graph=json.loads(doc.xpath('//script[@type="application/ld+json"]/text()')[0])
    assert 'null' not in json.dumps(graph);assert 'Embs' not in json.dumps(graph);assert 'Washington' not in json.dumps(graph)
    for node in graph['@graph']:
      if node['@type']=='Service':assert node['name'] and node['serviceType'] and node['@id'] and node['provider']['@id']=='https://www.modelhomeinc.com/#business'
    assert len(doc.xpath('//script[@src="/assets/site.js"]'))==1
    assert title[0]==title[0].strip() and '| USA' not in title[0],(kind,route,'legacy title')
    assert 30<=len(title[0])<=65 and 70<=len(desc[0])<=160,(kind,route,'metadata length',len(title[0]),len(desc[0]))
    assert doc.xpath('//meta[@property="og:site_name"]/@content')==['Model Home Inc.'],(kind,route,'og:site_name')
    assert doc.xpath('//meta[@property="og:title"]/@content')==[title[0]],(kind,route,'og:title')
    types=[node['@type'] for node in graph['@graph']]
    for node in graph['@graph']:
      if node['@type']=='BreadcrumbList':assert all(item.get('name') and item.get('item') for item in node['itemListElement']),(kind,route,'breadcrumb')
      if node['@type']=='FAQPage':
        visible=[' '.join(x.text_content().split()) for x in doc.xpath('//details[@class="mh-answer"]/summary')]
        assert [q['name'] for q in node['mainEntity']]==visible,(kind,route,'FAQ schema must match visible questions')
    assert ('FAQPage' in types)==(route in ['custom','wood']),(kind,route,'FAQ scope')
    for banned in ['streetAddress','927826','Dustin']:assert banned not in json.dumps(graph),(kind,route,'unconfirmed fact published',banned)
    if not route:
      main=doc.get_element_by_id('dmFirstContainer')
      assert not main.xpath('.//a[@href="/"]'),(kind,'homepage button links back to itself')
      text=' '.join(main.text_content().split())
      for place in content['business']['area_served']:assert place in text,(kind,'area in schema but not in visible copy',place)
    else:assert doc.xpath('//a[@href="/custom" or @href="/wood"]') or route in ['tile','faucet'],(kind,route,'no path to a core page')
    assert not doc.xpath('//script[contains(@src,"googletagmanager")]')
    for el in doc.xpath('//*[@href] | //*[@src]'):
      link=el.get('href') or el.get('src');target=urlparse(link)
      if target.scheme or target.netloc or not target.path.startswith('/'):continue
      local=ROOT/'site'/target.path.lstrip('/')
      if target.path=='/api/contact':assert (ROOT/'site/api/contact.js').exists();continue
      if target.path=='/':local=ROOT/'site/index.html'
      elif local.is_dir():local=local/'index.html'
      if not local.exists():errors.append({'kind':kind,'route':route,'broken':link})
      if target.fragment and local.suffix=='.html':
        other=html.fromstring(local.read_text())
        if not other.xpath('//*[@id=$id or @name=$id]',id=target.fragment):errors.append({'route':route,'missing_anchor':link})
    titles.append(title[0]);descriptions.append(desc[0]);results.append({'device':kind,'route':'/'+route,'h1':' '.join(h1[0].text_content().split()),'title':title[0],'canonical':url,'schema':'valid JSON and asserted graph fields'})
  assert len(set(titles))==11,'Duplicate titles';assert len(set(descriptions))==11,'Duplicate descriptions'
sitemap=etree.parse(str(ROOT/'site/sitemap.xml'))
sitemap_urls=set(sitemap.xpath('//*[local-name()="loc"]/text()'))
assert {'https://www.modelhomeinc.com/'+r for r in content['pages']}.issubset({u+'/' if u=='https://www.modelhomeinc.com' else u for u in sitemap_urls})
original=etree.parse(str(ROOT/'review/live-sitemap.xml'))
assert sitemap_urls==set(original.xpath('//*[local-name()="loc"]/text()')),'Live sitemap URLs must be retained until migration approval'
config=json.loads((ROOT/'site/vercel.json').read_text());assert not any('/store' in r['source'] for r in config.get('redirects',[]));assert 'immutable' not in json.dumps(config)
for rewrite in config['rewrites']:assert (ROOT/'site'/rewrite['destination'].lstrip('/')).exists()
report={'routes':results,'errors':errors,'sitemap_urls':len(sitemap_urls),'sitemap_scope':'Original live sitemap preserved; catalog routing is a launch dependency.','blanket_store_redirect':False,'vocabulary_validation':'Local graph checks; external rich-result validation remains a staging check.'}
(ROOT/'review/static-validation.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'page_variants':len(results),'errors':errors,'sitemap_urls':len(sitemap_urls)},indent=2))
assert not errors,errors
