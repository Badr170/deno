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
    // GoatCounter direct JSON endpoint expects the full page path URL-encoded.
    const counterPath = path === 'TOTAL' ? 'TOTAL' : encodeURIComponent(path || '/');
    const url = `${base}${counterPath}.json`;
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data?.count === undefined || data?.count === null || data?.count === '') {
      throw new Error('count missing');
    }
    return toEnglishDigits(data.count);
  }

  async function fixPageCount() {
    try {
      const path = window.location.pathname || '/';
      pageEl.textContent = await getCount(path);
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
