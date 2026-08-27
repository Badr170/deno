(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = (value) => /^(https?:\/\/|\.\/|\/)/i.test(String(value || ''));
  const packageUrl = (id) => `cydia://package/${encodeURIComponent(id)}`;

  const parsePackages = (text) => text.split(/\n\s*\n/).map((block) => {
    const p = {};
    block.split(/\r?\n/).forEach((line) => {
      const i = line.indexOf(':');
      if (i > 0) p[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    if (!p.Package) return null;
    return { id:p.Package, name:p.Name||p.Package, version:p.Version||'', section:p.Section||'Other', desc:p.Description||'لا يوجد وصف', author:p.Author||p.Maintainer||'', arch:p.Architecture||'', filename:p.Filename||'', size:p.Size||'', icon:p.Icon||'' };
  }).filter(Boolean);

  const iconHtml = (icon) => safeUrl(icon) ? `<img src="${esc(icon)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '📦';

  // Every package card opens its package directly in Cydia.
  const cardHtml = (p) => `<article class="card package-card"><a class="card-link" href="package.html?id=${encodeURIComponent(p.id)}"><div class="card-top"><div class="icon">${iconHtml(p.icon)}</div><div><h3>${esc(p.name)}</h3><div class="meta">الإصدار ${esc(p.version||'غير محدد')}</div></div></div><p class="desc">${esc(p.desc)}</p><div class="meta">${esc(p.section)}${p.author ? ` • ${esc(p.author)}` : ''}</div></a><a class="install-btn" href="${packageUrl(p.id)}" aria-label="تثبيت ${esc(p.name)}" title="تثبيت ${esc(p.name)}">تثبيت</a></article>`;

  const featureHtml = (p) => `<article class="card feature-card featured-card"><a class="card-link" href="package.html?id=${encodeURIComponent(p.id)}"><div class="card-top"><div class="icon">${iconHtml(p.icon)}</div><div><h3>${esc(p.name)}</h3><div class="meta">الإصدار ${esc(p.version||'غير محدد')}</div></div></div><p class="desc">${esc(p.desc)}</p><div class="meta">${esc(p.section)}${p.author ? ` • ${esc(p.author)}` : ''}</div></a><a class="install-btn" href="${packageUrl(p.id)}" aria-label="تثبيت ${esc(p.name)}" title="تثبيت ${esc(p.name)}">تثبيت</a></article>`;
  const setStatus = (text) => { const el=$('stats-status'); if(el) el.textContent=text; };

  async function loadStats() {
    try { setStatus('إحصائيات الزيارات تُسجّل عبر GoatCounter.'); }
    catch (_) { setStatus('تعذر تحميل الإحصائيات حاليًا.'); }
  }

  function render(packages) {
    const grid=$('package-grid'), count=$('count'), search=$('package-search'), filters=$('filters');
    if($('package-total')) $('package-total').textContent=packages.length.toLocaleString('ar-SA');
    const sections=[...new Set(packages.map(p=>p.section).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));
    let active='الكل';
    if(filters){
      filters.innerHTML=['الكل',...sections].map(s=>`<button type="button" class="filter${s===active?' active':''}" data-filter="${esc(s)}">${esc(s)}</button>`).join('');
      filters.addEventListener('click',(event)=>{ const button=event.target.closest('[data-filter]'); if(!button)return; active=button.dataset.filter; filters.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b===button)); apply(); });
    }
    if($('updates-grid')) $('updates-grid').innerHTML=packages.slice(0,3).map(featureHtml).join('');
    if($('popular-grid')) $('popular-grid').innerHTML=packages.slice(0,3).map(featureHtml).join('');
    function apply(){
      const query=String(search?.value||'').trim().toLowerCase();
      const filtered=packages.filter(p=>{ const sectionOk=active==='الكل'||p.section===active; const haystack=`${p.name} ${p.id} ${p.desc} ${p.author} ${p.section}`.toLowerCase(); return sectionOk&&(!query||haystack.includes(query)); });
      if(count) count.textContent=`${filtered.length.toLocaleString('ar-SA')} حزمة`;
      if(grid) grid.innerHTML=filtered.length?filtered.map(cardHtml).join(''):'<div class="empty">لا توجد حزم مطابقة لبحثك.</div>';
    }
    search?.addEventListener('input',apply); apply();
  }

  async function init(){
    try{
      const response=await fetch(`Packages?v=${Date.now()}`,{cache:'no-store'});
      if(!response.ok) throw new Error('Packages request failed');
      const packages=parsePackages(await response.text());
      render(packages); loadStats();
    }catch(error){
      console.error(error);
      if($('count')) $('count').textContent='تعذر التحميل';
      if($('package-grid')) $('package-grid').innerHTML='<div class="empty">تعذر تحميل الحزم حاليًا. حاول تحديث الصفحة.</div>';
      setStatus('تعذر تحميل البيانات حاليًا.');
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
