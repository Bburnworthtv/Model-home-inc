"""Apply bounded content/contact/SEO edits to the captured live template."""
from pathlib import Path
from copy import deepcopy
from lxml import html, etree
import json, re

ROOT = Path(__file__).resolve().parents[1]
CONTENT = json.loads((ROOT/'tools/content.json').read_text())
BASE = 'https://www.modelhomeinc.com'

def fragment(text):
    return html.fragment_fromstring(text, create_parent='div')

def replace_content(el, text):
    for child in list(el): el.remove(child)
    el.text = None
    for child in fragment(text): el.append(child)

def paragraphs(values):
    return ''.join('<p>'+v+'</p>' for v in values)

def text_in_element(doc, id, text):
    el = doc.get_element_by_id(id, None)
    if el is None: return
    # Preserve the template's span styles and paragraph/heading wrappers.
    leaf = el.xpath('.//span[not(*)]')
    if leaf:
        first=leaf[0]
        for node in el.iter():
            if node is not el: node.text=None;node.tail=None
        first.text=text
    else: el.text=text

def head_meta(doc, page, route):
    head=doc.find('head')
    for selector,value in [('title',page.get('title')),('meta[@name="description"]',page.get('description')),('meta[@property="og:title"]',page.get('title')),('meta[@property="og:description"]',page.get('description'))]:
        if value is None: continue
        matches=head.xpath(selector)
        if not matches:
            node=etree.SubElement(head, 'title' if selector=='title' else 'meta')
            if selector!='title':
                field=re.search(r'@(name|property)="([^"]+)"',selector)
                node.set(field[1],field[2])
        else:node=matches[0]
        if selector=='title':node.text=value
        else:node.set('content',value)
    url=BASE+'/'+route
    canonical=head.xpath('link[@rel="canonical"]')
    if canonical:canonical[0].set('href',url)
    else:etree.SubElement(head,'link',rel='canonical',href=url)
    for node in head.xpath('meta[@property="og:url"]'):node.set('content',url)
    site=head.xpath('meta[@property="og:site_name"]')
    site=site[0] if site else etree.SubElement(head,'meta',property='og:site_name')
    site.set('content',CONTENT['business']['name'])
    for name,value in [('twitter:title',page.get('title')),('twitter:description',page.get('description'))]:
        for node in head.xpath('meta[@name="%s"]'%name):
            if value:node.set('content',value)

# Service area is stated in the visible homepage copy; schema lists the same places only.
AREAS=[{'@type':'AdministrativeArea' if name=='North County San Diego' else 'Place','name':name if name=='North County San Diego' else name+', California'} for name in CONTENT['business']['area_served']]

def set_link(doc, id, href, label=None):
    node=doc.get_element_by_id(id,None)
    if node is None:return
    node.set('href',href)
    if label:
        spans=node.xpath('.//span[@class="text"]')
        if spans:spans[0].text=label

def schema(doc, route, page):
    for node in doc.xpath('//script[@type="application/ld+json"]'):node.getparent().remove(node)
    b=CONTENT['business']
    business={'@type':'HomeAndConstructionBusiness','@id':BASE+'/#business','name':b['name'],'url':BASE+'/','telephone':b['telephone'],'email':b['email'],'description':b['description'],'address':{'@type':'PostalAddress','addressLocality':b['locality'],'addressRegion':b['region'],'addressCountry':'US'},'areaServed':AREAS}
    business['logo']=BASE+'/assets/img/logo.png'
    business['hasOfferCatalog']={'@type':'OfferCatalog','name':'Flooring, Cabinetry and Interior Materials','itemListElement':[{'@type':'Offer','itemOffered':{'@type':'Service','@id':BASE+'/'+key+'#service','name':value['name'],'url':BASE+'/'+key}} for key,value in CONTENT['pages'].items() if key]}
    graph=[business]
    url=BASE+'/'+route
    if route:
        desc=page.get('description') or (doc.xpath('//meta[@name="description"]/@content') or [''])[0]
        graph += [{'@type':'Service','@id':url+'#service','name':page['name'],'serviceType':page['name'],'url':url,'description':desc,'provider':{'@id':BASE+'/#business'},'areaServed':AREAS}, {'@type':'BreadcrumbList','@id':url+'#breadcrumb','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':BASE+'/'},{'@type':'ListItem','position':2,'name':page['name'],'item':url}]}]
        graph += [{'@type':'WebPage','@id':url+'#webpage','url':url,'name':page.get('title') or page['name'],'about':{'@id':url+'#service'},'breadcrumb':{'@id':url+'#breadcrumb'}}]
        if route in CONTENT and CONTENT[route].get('questions'):
            # Mirrors the visible "Questions before you book" answers exactly.
            graph += [{'@type':'FAQPage','@id':url+'#faq','isPartOf':{'@id':url+'#webpage'},'mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in CONTENT[route]['questions']]}]
    else:graph += [{'@type':'WebSite','@id':BASE+'/#website','url':url,'name':b['name'],'publisher':{'@id':BASE+'/#business'}},{'@type':'WebPage','@id':url+'#webpage','url':url,'name':page['title'],'isPartOf':{'@id':BASE+'/#website'},'about':{'@id':BASE+'/#business'}}]
    node=etree.SubElement(doc.find('head'),'script',type='application/ld+json')
    node.text=json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False)

def clean_tracking(doc):
    for node in list(doc.xpath('//script')):
        ident=node.get('id','');src=node.get('src','');text=node.text or ''
        if ident.startswith('d_track_') or 'googletagmanager.com' in src or 'snowplow' in text.lower() or 'sp-2.0.0-dm' in src:
            node.getparent().remove(node)
    # Baseline runtime expects these variables, but preview collects no account analytics.
    node=etree.SubElement(doc.find('head'),'script')
    node.text='var _dm_gaq = {}; var _gaq = []; var _dm_insite = [];'

def build_form(doc):
    forms=doc.xpath('//form')
    if not forms:return
    form=forms[0];form.set('id','cform');form.set('action','/api/contact');form.set('method','post');form.set('novalidate','novalidate')
    parent=form.getparent().getparent()
    for key in ['dmle_extension','data-element-type','data-require-captcha','data-captcha-position','captcha','captcha-id','data-binding']:
        if key in parent.attrib:del parent.attrib[key]
    form.getparent().attrib.pop('captcha-lang',None)
    for node in list(form.xpath('.//input[@type="hidden"]')):node.getparent().remove(node)
    fields=[('name','Full Name','name',100),('email','Email (or callback number)','email',254),('phone','Phone (or email)','tel',40),('message','Project description','off',4000)]
    for node,field in zip(form.xpath('.//input[not(@type="submit")] | .//textarea'),fields):
        name,label,autocomplete,limit=field
        node.set('name',name);node.set('aria-label',label);node.set('placeholder',label);node.set('autocomplete',autocomplete);node.set('maxlength',str(limit))
        if name in ['name','message']:node.set('required','required')
        else:node.attrib.pop('required',None)
    submit=form.xpath('.//*[@type="submit"]')[0];submit.set('value','Send Inquiry');submit.attrib.pop('name',None)
    before=submit.getparent()
    choices=''.join('<option>'+x+'</option>' for x in ['']+['Cabinets with installation','Flooring with installation','Combined cabinetry and flooring','Custom interior project','Materials only','Other'])
    extra=fragment('<div class="dmforminput small-12 dmRespDesignCol medium-6 large-6"><label for="project-type" class="mh-label">Project type</label><select id="project-type" name="project_type" required aria-label="Project type">'+choices+'</select></div><div class="dmforminput small-12 dmRespDesignCol medium-6 large-6"><label for="project-city" class="mh-label">Project city</label><input id="project-city" name="city" required maxlength="100" autocomplete="address-level2" placeholder="Project city" aria-label="Project city"></div><div class="dmforminput small-12 dmRespDesignCol medium-12 large-12"><label for="project-timeline" class="mh-label">Timeline (optional)</label><input id="project-timeline" name="timeline" maxlength="100" placeholder="Preferred timing (optional)" aria-label="Timeline (optional)"></div>')
    message=form.xpath('.//textarea')[0].getparent()
    for node in list(extra):form.insert(form.index(message),node)
    hp=etree.SubElement(form,'input',name='company',tabindex='-1',autocomplete='off');hp.set('aria-hidden','true');hp.set('class','mh-hp')
    note=etree.SubElement(form,'p');note.set('class','mh-privacy');note.text='We use your contact details and project information to respond to this inquiry. Please do not include sensitive information. '
    etree.SubElement(note,'a',href='tel:760-682-5027').text='Call 760-682-5027'
    note[-1].tail=' or '
    etree.SubElement(note,'a',href='mailto:info@modelhomeinc.com').text='email info@modelhomeinc.com'
    for cls,role in [('ok','status'),('err','alert')]:
        node=etree.SubElement(form,'p',role=role);node.set('class','fmsg '+cls);node.set('hidden','hidden');node.set('aria-live','polite' if cls=='ok' else 'assertive');node.set('aria-atomic','true')
    # Retire the builder's unconnected newsletter/success placeholders only.
    for node in list(doc.xpath('//*[contains(@class,"dmform-success") or contains(@class,"dmform-error") or @class="dmform-title dmwidget-title"]')):
        if not form in node.iterancestors():node.getparent().remove(node)

for kind in ['desktop','mobile','tablet']:
  for route,page in CONTENT['pages'].items():
    source=ROOT/'live-source'/kind/route/'index.html'
    doc=html.fromstring(source.read_text())
    head_meta(doc,page,route);schema(doc,route,page);clean_tracking(doc)
    contact_info=doc.get_element_by_id('1617448979',None)
    if contact_info is not None:
        p=etree.SubElement(contact_info,'p');p.text='San Marcos, California'
    if route:
        heading=doc.get_element_by_id('1743015651').xpath('.//h3')[0]
        if route in ['custom','wood']:
            heading.tag='h1';heading.set('class',(heading.get('class','')+' mh-service-heading').strip())
            text_in_element(doc,'1743015651',page['h1'])
            leaf=heading.xpath('.//span[not(*)]')
            if len(leaf)>1:
                leaf[0].text=page['h1'].replace('North County San Diego','').strip()+' '
                leaf[-1].text='North County San Diego'
            text_in_element(doc,'1689997905','Materials, custom requests & installation' if route=='custom' else 'Wood flooring materials & installation')
            replace_content(doc.get_element_by_id('1330027818'),paragraphs(CONTENT[route]['intro']))
            text_in_element(doc,'1332028869','PLANNING YOUR PROJECT')
            # Retain the live 'Crafting Your Dream Spaces' heading and its original styled spans.
            questions=''.join('<details class="mh-answer"><summary>'+q+'</summary><p>'+a+'</p></details>' for q,a in CONTENT[route]['questions'])
            links='<p>Compare <a href="/semi-custom">semi-custom cabinets</a> and <a href="/rta">RTA cabinets</a>, or plan your <a href="/wood">wood flooring</a>.</p>' if route=='custom' else '<p>Compare <a href="/waterproof">waterproof flooring</a>, browse <a href="https://www.modelhomeinc.com/store/Laminate-c161564962">laminate materials</a>, or discuss <a href="/custom">cabinetry</a> for the same project.</p>'
            replace_content(doc.get_element_by_id('1507881592'),'<div class="mh-project-guide">'+paragraphs(CONTENT[route]['process'])+'</div>'+links+'<h2 class="mh-questions-title">Questions before you book</h2>'+questions)
        # Preserve other destinations' existing metadata and copy. Name their H1 only.
        else:
            # Elevate the existing hero title semantically; keep secondary-page copy intact.
            hero_heading=doc.get_element_by_id('1818480987').xpath('.//h2')[0]
            hero_heading.tag='h1';hero_heading.set('class',hero_heading.get('class','')+' mh-hero-heading')
            labels=CONTENT['link_labels'];related=page.get('related',[])
            if related:
                items=['<a href="/%s">%s</a>'%(key,labels[key]) for key in related]
                joined=items[0] if len(items)==1 else ', '.join(items[:-1])+' or '+items[-1]
                guide=doc.get_element_by_id('1507881592',None)
                if guide is not None:guide.append(fragment('<p class="mh-related">Planning a larger project? See '+joined+', or <a href="/#Contact">tell us about your project</a>.</p>')[0])
        crumb=fragment('<p class="mh-breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> '+page['name']+'</p>')[0]
        intro=doc.get_element_by_id('1330027818');intro.insert(0,crumb)
        for node in doc.xpath('//a[@popup_target="quote"]'):
            node.set('href','/#Contact');node.attrib.pop('popup_target',None);node.attrib.pop('onclick',None)
            node.attrib.pop('link_type',None)
            if route in ['custom','wood']:
                spans=node.xpath('.//span[@class="text"]')
                if spans:spans[0].text='Discuss Your Project'
    else:
        text_in_element(doc,'1882875877','Flooring, Cabinetry & Custom Interior Work in North County San Diego')
        for id,label in [('1000516574','Flooring Materials & Installation'),('1889816509','Cabinetry Materials & Installation'),('1414553920','Bathroom Materials'),('1826233051','Doors for Your Home'),('1765856950','Moulding & Interior Details')]:text_in_element(doc,id,label)
        text_in_element(doc,'1969111330',CONTENT['business']['about'])
        for node in doc.xpath('//a[@popup_target="quote"]'):
            node.set('href','#Contact');node.attrib.pop('popup_target',None)
            node.attrib.pop('link_type',None)
            spans=node.xpath('.//span[@class="text"]')
            if spans:spans[0].text='Discuss Your Project'
        # Hero and card buttons: lead to an inquiry or the matching service page, never back to '/'.
        set_link(doc,'1585402858','#Contact','Discuss Your Project')
        for id,label in [('1441435920','Cabinetry & Flooring Together'),('1860717011','Materials & Installation'),('1586717651','Semi-Custom & RTA Options')]:text_in_element(doc,id,label)
        for id,href,label in [('1438979613','/wood','Plan Both'),('1612889581','/semi-custom','Compare Options'),('1036778408','#Contact',None),('1177686870','/tile',None),('1223696892','/vanity',None),('1227403310','/doors',None),('1461293461','/doors',None),('1118025133','#Contact','Discuss Your Project'),('1954786854','#Contact',None),('1714303192','/store/Laminate-c161564962',None),('1272547174','/waterproof',None)]:set_link(doc,id,href,label)
        # Any remaining card button that still points at '/' goes to its own section's page.
        section_pages={'FLOORING':'/wood','KITCHEN':'/custom','BATH':'/tile','DOORS':'/doors','MOULDING':'/moulding'}
        for node in doc.get_element_by_id('dmFirstContainer').xpath('.//a[@href="/"]'):
            section=node.xpath('preceding::h2[1]')
            node.set('href',section_pages.get(' '.join(section[0].text_content().split()) if section else '','#Contact'))
        build_form(doc)
        contact=doc.get_element_by_id('1407431586',None)
        if contact is not None:replace_content(contact,'<p>Tell us about your flooring or cabinetry installation project, custom request or material inquiry. <a href="tel:760-682-5027">Call 760-682-5027</a> or <a href="mailto:info@modelhomeinc.com">email info@modelhomeinc.com</a>.</p>')
    # Keep the active catalog hosted on the existing public site during local review.
    for node in doc.xpath('//a[@href]'):
        href=node.get('href')
        if href.startswith('tel:'):node.set('href','tel:760-682-5027')
        if href.startswith('mailto:'):node.set('href','mailto:info@modelhomeinc.com')
        if href.startswith('/store'):node.set('href',BASE+href)
        if href=='/#Wholesale':node.set('href',BASE+href)
    # Mark the page content as a landmark without changing any wrappers/styles.
    main=doc.get_element_by_id('dmFirstContainer',None)
    if main is not None:main.set('role','main')
    link=etree.SubElement(doc.find('head'),'link',rel='stylesheet',href='/assets/repairs.css')
    for src in ['/assets/contact-rules.js','/assets/site.js']:
        node=etree.SubElement(doc.find('body'),'script',src=src);node.set('defer','defer')
    target=ROOT/'site'/route/'index.html' if kind=='desktop' else ROOT/'site/_variants'/kind/route/'index.html'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html'))
print('Updated 11 routes using the original live desktop, phone and tablet templates.')
