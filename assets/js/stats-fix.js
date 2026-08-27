(() => {
  'use strict';
  const pageEl = document.getElementById('goatcounter-page-count');
  const totalEl = document.getElementById('goatcounter-total-count');
  const statusEl = document.getElementById('stats-status');
  if (!pageEl) return;

  const base = 'https://badr170.goatcounter.com/counter/';
  const toEnglishDigits = value => String(value ?? '')
    .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

  async function getCount(path) {
    const url = `${base}${encodeURIComponent(path)}.json`;
    const response = await fetch(url, { method: 'GET', mode: 'cors', cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data?.count === undefined || data?.count === null || data?.count === '') throw new Error('count missing');
    return toEnglishDigits(data.count);
  }

  async function fixPageCount() {
    try {
      pageEl.textContent = await getCount(window.location.pathname || '/');
      if (totalEl && totalEl.textContent && totalEl.textContent !== '…' && totalEl.textContent !== '—') {
        if (statusEl) statusEl.textContent = 'أعداد الزوار محدثة عبر GoatCounter.';
      }
    } catch (error) {
      console.error('GoatCounter page counter failed:', error);
      pageEl.textContent = '—';
    }
  }

  fixPageCount();
})();
