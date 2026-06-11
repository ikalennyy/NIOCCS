/* ============================================================
   NIOCCS dashboard — file registry filtering
   Clicking a KPI card filters the table to that bucket and
   marks the card selected. Search filters within the bucket.
   Shared across all three theme variations.
   ============================================================ */
(function () {
  // bucket meta — totals power the "of N files" count
  const BUCKETS = {
    'available':  { label: 'Available',       total: 165 },
    'ready-qa':   { label: 'Ready for QA',    total: 12  },
    'in-qa':      { label: 'In QA',           total: 5   },
    'completed':  { label: 'Completed by Me', total: 148 },
    'attention':  { label: 'Needs Attention', total: 3   },
  };

  // representative rows. stype drives the (neutral) status dot;
  // only 'attention' carries color. low > 0 renders an amber chip.
  const FILES = [
    // ── Available (pool you can take) ──────────────────────────
    { b:'available', name:'COV2020_11_2020_1.txt', sub:'Not yet started',   up:'Today',     upT:'9:45 AM',  total:245, needs:0,  low:0,  status:'Not started',       stype:'idle',     updt:'Today',     updtT:'10:10 AM' },
    { b:'available', name:'NCH2020_11_2020_4.txt', sub:'Partially reviewed', up:'Yesterday', upT:'3:50 PM',  total:89,  needs:22, low:6,  status:'Partially reviewed', stype:'progress', updt:'Yesterday', updtT:'4:18 PM'  },
    { b:'available', name:'SURVEY_2020_BATCH_8.txt', sub:'Not started',     up:'Yesterday', upT:'10:55 AM', total:96,  needs:18, low:4,  status:'Not started',       stype:'idle',     updt:'Yesterday', updtT:'11:30 AM' },
    { b:'available', name:'NCH2020_11_2020_9.txt', sub:'Previously opened', up:'Jun 4, 2026', upT:'2:40 PM', total:156, needs:27, low:9,  status:'Partially reviewed', stype:'progress', updt:'Jun 4, 2026', updtT:'3:22 PM' },
    { b:'available', name:'IND2020_11_2020_3.txt', sub:'Not yet started',   up:'Jun 3, 2026', upT:'8:15 AM', total:178, needs:0,  low:0,  status:'Not started',       stype:'idle',     updt:'Jun 3, 2026', updtT:'8:40 AM' },

    // ── Ready for QA (you finished, ready to send) ─────────────
    { b:'ready-qa', name:'COV2020_10_2020_5.txt', sub:'Reviewed by you',    up:'Jun 2, 2026', upT:'11:00 AM', total:120, needs:0, low:3,  status:'Ready for QA', stype:'ready', updt:'Jun 9, 2026', updtT:'4:10 PM' },
    { b:'ready-qa', name:'NCH2020_09_2020_7.txt', sub:'Reviewed by you',    up:'May 28, 2026', upT:'9:20 AM', total:142, needs:0, low:5,  status:'Ready for QA', stype:'ready', updt:'Jun 8, 2026', updtT:'2:30 PM' },
    { b:'ready-qa', name:'SURVEY_2020_BATCH_2.txt', sub:'Reviewed by you',  up:'May 26, 2026', upT:'1:05 PM', total:88,  needs:0, low:1,  status:'Ready for QA', stype:'ready', updt:'Jun 8, 2026', updtT:'11:05 AM' },
    { b:'ready-qa', name:'NCH2020_09_2020_2.txt', sub:'Reviewed by you',    up:'May 24, 2026', upT:'3:40 PM', total:134, needs:0, low:2,  status:'Ready for QA', stype:'ready', updt:'Jun 7, 2026', updtT:'5:12 PM' },
    { b:'ready-qa', name:'COV2020_10_2020_1.txt', sub:'Reviewed by you',    up:'May 22, 2026', upT:'10:10 AM', total:97, needs:0, low:0,  status:'Ready for QA', stype:'ready', updt:'Jun 7, 2026', updtT:'9:48 AM' },

    // ── In QA (with the QA reviewer) ───────────────────────────
    { b:'in-qa', name:'NCH2020_08_2020_1.txt', sub:'With QA reviewer',      up:'May 20, 2026', upT:'8:30 AM', total:98,  needs:0, low:0,  status:'In QA', stype:'qa', updt:'Jun 7, 2026', updtT:'9:00 AM' },
    { b:'in-qa', name:'COV2020_08_2020_4.txt', sub:'With QA reviewer',      up:'May 18, 2026', upT:'2:15 PM', total:110, needs:0, low:2,  status:'In QA', stype:'qa', updt:'Jun 6, 2026', updtT:'3:15 PM' },
    { b:'in-qa', name:'SURVEY_2020_BATCH_4.txt', sub:'With QA reviewer',    up:'May 17, 2026', upT:'11:40 AM', total:124, needs:0, low:0, status:'In QA', stype:'qa', updt:'Jun 6, 2026', updtT:'10:02 AM' },
    { b:'in-qa', name:'NCH2020_08_2020_6.txt', sub:'With QA reviewer',      up:'May 15, 2026', upT:'9:55 AM', total:101, needs:0, low:1,  status:'In QA', stype:'qa', updt:'Jun 5, 2026', updtT:'1:20 PM' },
    { b:'in-qa', name:'COV2020_08_2020_9.txt', sub:'With QA reviewer',      up:'May 14, 2026', upT:'4:25 PM', total:139, needs:0, low:0,  status:'In QA', stype:'qa', updt:'Jun 5, 2026', updtT:'11:11 AM' },

    // ── Completed by me ────────────────────────────────────────
    { b:'completed', name:'NCH2020_07_2020_3.txt', sub:'Signed off',        up:'Apr 30, 2026', upT:'10:00 AM', total:132, needs:0, low:0, status:'Completed', stype:'done', updt:'Jun 1, 2026', updtT:'4:30 PM' },
    { b:'completed', name:'SURVEY_2020_BATCH_1.txt', sub:'Signed off',      up:'Apr 28, 2026', upT:'1:30 PM',  total:76,  needs:0, low:0, status:'Completed', stype:'done', updt:'May 30, 2026', updtT:'2:45 PM' },
    { b:'completed', name:'COV2020_07_2020_2.txt', sub:'Signed off',        up:'Apr 26, 2026', upT:'9:15 AM',  total:145, needs:0, low:0, status:'Completed', stype:'done', updt:'May 29, 2026', updtT:'10:50 AM' },
    { b:'completed', name:'NCH2020_07_2020_8.txt', sub:'Signed off',        up:'Apr 24, 2026', upT:'3:05 PM',  total:113, needs:0, low:0, status:'Completed', stype:'done', updt:'May 28, 2026', updtT:'5:20 PM' },
    { b:'completed', name:'IND2020_07_2020_5.txt', sub:'Signed off',        up:'Apr 22, 2026', upT:'11:50 AM', total:90,  needs:0, low:0, status:'Completed', stype:'done', updt:'May 27, 2026', updtT:'9:05 AM' },

    // ── Needs attention (returned from QA) ─────────────────────
    { b:'attention', name:'SURVEY_2020_BATCH_7.txt', sub:'Returned from QA · 2 flags', up:'Yesterday', upT:'1:20 PM', total:132, needs:31, low:9,  status:'Returned from QA', stype:'attention', updt:'Yesterday', updtT:'2:05 PM' },
    { b:'attention', name:'NCH2020_06_2020_2.txt',  sub:'Returned from QA · 1 flag',  up:'Jun 5, 2026', upT:'9:10 AM', total:104, needs:12, low:7,  status:'Returned from QA', stype:'attention', updt:'Jun 9, 2026', updtT:'10:20 AM' },
    { b:'attention', name:'COV2020_05_2020_9.txt',  sub:'Returned from QA · 3 flags',  up:'Jun 3, 2026', upT:'2:35 PM', total:167, needs:19, low:11, status:'Returned from QA', stype:'attention', updt:'Jun 8, 2026', updtT:'4:45 PM' },
  ];

  const PER_PAGE = 8;
  let active = 'available';
  let term = '';

  const els = {
    cards:    Array.from(document.querySelectorAll('.kpi[data-bucket]')),
    rows:     document.getElementById('file-rows'),
    regLabel: document.getElementById('reg-label'),
    regCount: document.getElementById('reg-count'),
    pageInfo: document.getElementById('page-info'),
    search:   document.getElementById('search'),
  };
  if (!els.rows) return;

  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c]));

  function rowHTML(f) {
    const attn  = f.stype === 'attention';
    const needs = f.needs > 0 ? `<span class="num">${f.needs}</span>` : `<span class="dash">—</span>`;
    const low   = f.low   > 0 ? `<span class="lowconf" title="${f.low} low-confidence records">${f.low}</span>` : `<span class="dash">—</span>`;
    return `<tr class="${attn ? 'row-attention' : ''}">
      <td><div class="cell-file"><span class="file-name">${esc(f.name)}</span><span class="file-stage">${esc(f.sub)}</span></div></td>
      <td><div class="cell-stack"><span>${esc(f.up)}</span><span class="sub">${esc(f.upT)}</span></div></td>
      <td class="u-right num">${f.total}</td>
      <td class="u-right">${needs}</td>
      <td class="u-right">${low}</td>
      <td><span class="stage is-${f.stype}"><span class="stage-dot"></span> ${esc(f.status)}</span></td>
      <td><div class="cell-stack"><span>${esc(f.updt)}</span><span class="sub">${esc(f.updtT)}</span></div></td>
      <td class="u-right"><div class="row-actions"><button class="kebab is-disabled" title="Close your active file to use these actions"><svg class="icon" aria-hidden="true"><use href="#i-kebab"/></svg></button></div></td>
    </tr>`;
  }

  function render() {
    const matches = FILES.filter((f) =>
      f.b === active && (!term || f.name.toLowerCase().includes(term)));
    const shown = matches.slice(0, PER_PAGE);

    els.rows.innerHTML = shown.length
      ? shown.map(rowHTML).join('')
      : `<tr><td colspan="8" style="height:96px;text-align:center;color:var(--text-faint)">No files match “${esc(term)}”.</td></tr>`;

    if (els.regLabel) els.regLabel.textContent = BUCKETS[active].label;
    if (els.regCount) els.regCount.textContent = BUCKETS[active].total + ' files';
    if (els.pageInfo) {
      els.pageInfo.innerHTML = shown.length
        ? `Showing <b>1–${shown.length}</b> of ${BUCKETS[active].total} files`
        : `No matches`;
    }
  }

  function select(bucket) {
    active = bucket;
    els.cards.forEach((c) => {
      const on = c.dataset.bucket === bucket;
      c.classList.toggle('is-selected', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    term = '';
    if (els.search) els.search.value = '';
    render();
  }

  els.cards.forEach((card) => {
    card.addEventListener('click', () => select(card.dataset.bucket));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(card.dataset.bucket); }
    });
  });

  if (els.search) {
    els.search.addEventListener('input', (e) => {
      term = e.target.value.trim().toLowerCase();
      render();
    });
  }

  render();
})();
