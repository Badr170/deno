(() => {
  'use strict';

  const grid = document.getElementById('package-grid');
  const updatesGrid = document.getElementById('updates-grid');
  const popularGrid = document.getElementById('popular-grid');
  const search = document.getElementById('package-search');
  const filters = document.getElementById('filters');
  const count = document.getElementById('count');
  let all = [];
  let category = 'all';

  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const safeIcon = s => /^(https?:\/\/|\/|\.\/)/i.test(s || '');

  function parse(text) {
    return text.split(/\n\s*\n/).map(block => {
      const p = {};
      block.split('\n').forEach(line => {
        const i = line.indexOf(':');
        if (i > 0) p[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      });
      return p.Package ? {
        id: p.Package,
        name: p.Name || p.Package,
        version: p.Version || '',
        section: p.Section || 'Other',
        desc: p.Description || 'لا يوجد وصف',
        author: p.Author || p.Maintainer || '',
        icon: p.Icon || '',
        filename: p.Filename || ''
      } : null;
    }).filter(Boolean);
  }

  function versionParts(v) {
    return String(v || '').toLowerCase().replace(/[^0-9.]+/g, '.').split('.').map(n => parseInt(n, 10) || 0);
  }

  function compareVersions(a, b) {
    const av = versionParts(a.version), bv = versionParts(b.version);
    for (let i = 0; i < Math.max(av.length, bv.length); i++) {
      if ((bv[i] || 0) !== (av[i] || 0)) return (bv[i] || 0) - (av[i] || 0);
    }
    return a.name.localeCompare(b.name);
  }

  function card(p, featured = false) {
    return `<article class="card ${featured ? 'featured-card' : ''}">
      <div class="card-top">
        <div class="icon">${safeIcon(p.icon) ? `<img src="${esc(p.icon)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '📦'}</div>
        <div><h3>${esc(p.name)}</h3><div class="meta">الإصدار ${esc(p.version)}</div></div>
      </div>
      <p class="desc">${esc(p.desc)}</p>
      <div class="tags"><span class="tag">${esc(p.section)}</span>${p.author ? `<span class="tag">${esc(p.author)}</span>` : ''}</div>
    </article>`;
  }

  function render() {
    const q = search.value.trim().toLowerCase();
    const list = all.filter(p =>
      (category === 'all' || p.section.toLowerCase() === category) &&
      (p.name + ' ' + p.id + ' ' + p.desc + ' ' + p.author).toLowerCase().includes(q)
    );
    count.textContent = `${list.length} حزمة`;
    grid.innerHTML = list.length ? list.map(p => card(p)).join('') : '<div class="empty">لا توجد حزم مطابقة للبحث.</div>';
  }

  function renderHighlights() {
    const latest = [...all].sort(compareVersions).slice(0, 6);
    const preferred = [
      'com.BA7DR.sileoarabic',
      'com.BADR.a-bypass',
      'com.BADR.a-font',
      'com.BADR.activator',
      'com.BADR.addsource',
      'com.BADR.addtofolder'
    ];
    const popular = preferred.map(id => all.find(p => p.id === id)).filter(Boolean);
    const fallback = all.filter(p => !popular.includes(p)).slice(0, 6 - popular.length);

    updatesGrid.innerHTML = latest.length ? latest.map(p => card(p, true)).join('') : '<div class="empty">لا توجد تحديثات حاليًا.</div>';
    popularGrid.innerHTML = [...popular, ...fallback].slice(0, 6).map(p => card(p, true)).join('') || '<div class="empty">لا توجد حزم مميزة حاليًا.</div>';
  }

  function makeFilters() {
    const cats = [...new Set(all.map(p => p.section))].sort((a, b) => a.localeCompare(b));
    filters.innerHTML = '<button class="filter active" data-cat="all">الكل</button>' +
      cats.map(c => `<button class="filter" data-cat="${esc(c.toLowerCase())}">${esc(c)}</button>`).join('');

    filters.addEventListener('click', e => {
      const button = e.target.closest('.filter');
      if (!button) return;
      category = button.dataset.cat;
      document.querySelectorAll('.filter').forEach(x => x.classList.remove('active'));
      button.classList.add('active');
      render();
    });
  }

  search.addEventListener('input', render);

  fetch('Packages', { cache: 'no-store' })
    .then(r => { if (!r.ok) throw Error('Packages unavailable'); return r.text(); })
    .then(text => {
      all = parse(text);
      makeFilters();
      renderHighlights();
      render();
    })
    .catch(() => {
      grid.innerHTML = '<div class="empty">تعذر تحميل قائمة الحزم حاليًا.</div>';
      updatesGrid.innerHTML = '<div class="empty">تعذر تحميل التحديثات حاليًا.</div>';
      popularGrid.innerHTML = '<div class="empty">تعذر تحميل الحزم المميزة حاليًا.</div>';
      count.textContent = '';
    });
})();
