/* Druk Logic admin: list, filter and update website enquiries; download as Excel. Data lives in the Google Sheet backend. */
(function () {
  const C = window.DL.company, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const icon = window.dlIcon, nu = (v) => 'Nu ' + Number(v || 0).toLocaleString('en-IN');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let KEY = sessionStorage.getItem('dl_admin') || '', DATA = null, filt = 'All', q = '', open = null;
  const F = { at: 0, ref: 1, st: 2, name: 3, org: 4, phone: 5, email: 6, site: 7, svc: 8, items: 9, total: 10, msg: 11, ch: 12, page: 13, notes: 14 };
  const msg = (t, cls = '') => { const m = $('#amsg'); m.textContent = t; m.className = 'result ' + cls; };
  const call = async (body) => (await fetch(C.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })).json();
  const show = (on) => { $('#login').style.display = on ? 'none' : 'block'; $('#panel').style.display = on ? 'block' : 'none'; };

  if (!C.api) { show(false); msg('The enquiries backend is not connected yet. Deploy backend/Code.gs and put its URL in company.py (api).', 'err'); $('#lform button').disabled = true; return; }

  async function load() {
    msg('Loading enquiries...', 'busy');
    try {
      const j = await call({ action: 'list', key: KEY });
      if (!j.ok) { sessionStorage.removeItem('dl_admin'); show(false); msg(j.error, 'err'); return; }
      DATA = j; sessionStorage.setItem('dl_admin', KEY); show(true); $('#sheet').href = j.sheetUrl; if ($('#prices')) $('#prices').href = j.sheetUrl;
      $('#fst').innerHTML = ['All'].concat(j.statuses).map((s) => `<option>${s}</option>`).join('');
      $('#fst').value = filt; render(); msg('Updated ' + new Date().toLocaleTimeString());
    } catch (e) { msg('Could not reach the server. Check your internet connection.', 'err'); }
  }

  function render() {
    const rows = DATA.rows.slice().reverse(), now = new Date();
    const cnt = (s) => rows.filter((r) => r[F.st] === s).length;
    const month = rows.filter((r) => { const d = new Date(r[F.at]); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
    $('#kpi').innerHTML = [['Total', rows.length], ['New', cnt('New')], ['Contacted', cnt('Contacted')], ['Quoted', cnt('Quoted')], ['Won', cnt('Won')], ['This month', month]]
      .map(([a, b]) => `<div><b>${b}</b><span>${a}</span></div>`).join('');
    const list = rows.filter((r) => (filt === 'All' || r[F.st] === filt) && r.join(' ').toLowerCase().includes(q));
    $('#count').textContent = `${list.length} shown`;
    $('#rows').innerHTML = list.map((r) => {
      const d = new Date(r[F.at]), ph = String(r[F.phone]).replace(/^'/, ''), wa = ph.replace(/\D/g, '');
      const main = `<tr data-ref="${esc(r[F.ref])}" class="${open === r[F.ref] ? 'open' : ''}" style="cursor:pointer">
        <td>${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}<br><small>${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</small></td>
        <td><b>${esc(r[F.ref])}</b></td>
        <td><select data-st="${esc(r[F.ref])}">${DATA.statuses.map((s) => `<option ${s === r[F.st] ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
        <td><b>${esc(r[F.name])}</b><br><small>${esc(r[F.org])}</small></td>
        <td><a href="tel:${esc(ph)}">${esc(ph)}</a><br><a href="https://wa.me/${wa.length === 8 ? '975' + wa : wa}" target="_blank" rel="noopener" style="color:var(--gold)">WhatsApp</a></td>
        <td>${r[F.email] ? `<a href="mailto:${esc(r[F.email])}?subject=${encodeURIComponent('Your enquiry ' + r[F.ref])}">${esc(r[F.email])}</a>` : ''}</td>
        <td>${esc(r[F.svc])}</td><td style="text-align:right">${r[F.total] ? nu(r[F.total]) : ''}</td></tr>`;
      const det = open === r[F.ref] ? `<tr class="open"><td></td><td colspan="7"><div class="grid g3" style="gap:20px">
        <div><label>Items requested</label><div class="det">${esc(r[F.items]) || '-'}</div></div>
        <div><label>Message</label><div class="det">${esc(r[F.msg]) || '-'}</div><label style="margin-top:12px">Site · channel · page</label><div class="det">${esc(r[F.site]) || '-'} · ${esc(r[F.ch])} · ${esc(r[F.page])}</div></div>
        <div><label>Admin notes<textarea data-notes="${esc(r[F.ref])}">${esc(r[F.notes])}</textarea></label><button class="btn sm" data-save="${esc(r[F.ref])}">Save notes</button></div></div></td></tr>` : '';
      return main + det;
    }).join('') || '<tr><td colspan="8" style="padding:30px;color:var(--stone)">No enquiries yet.</td></tr>';
  }

  async function upd(ref, body) {
    msg('Saving...', 'busy');
    const j = await call(Object.assign({ action: 'update', key: KEY, ref }, body));
    if (!j.ok) return msg(j.error, 'err');
    const r = DATA.rows.find((x) => x[F.ref] === ref); if (body.status) r[F.st] = body.status; if (body.notes !== undefined) r[F.notes] = body.notes;
    render(); msg('Saved', 'ok');
  }

  function excel() {
    const head = DATA.head, rows = DATA.rows.map((r) => r.map((v, i) => (i === F.at ? new Date(v) : i === F.phone ? String(v).replace(/^'/, '') : v)));
    const ws = XLSX.utils.aoa_to_sheet([head].concat(rows), { cellDates: true });
    ws['!cols'] = [18, 16, 11, 22, 24, 16, 26, 18, 22, 50, 14, 50, 10, 14, 30].map((w) => ({ wch: w }));
    rows.forEach((_, i) => { const c = ws[XLSX.utils.encode_cell({ r: i + 1, c: F.at })]; if (c) c.z = 'dd-mmm-yyyy hh:mm'; });
    const sum = [['Status', 'Count']].concat(DATA.statuses.map((s) => [s, DATA.rows.filter((r) => r[F.st] === s).length]), [['Total', DATA.rows.length]]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Enquiries'); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sum), 'Summary');
    XLSX.writeFile(wb, `Druk_Logic_Enquiries_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  $('#lform').addEventListener('submit', (e) => { e.preventDefault(); KEY = $('#akey').value.trim(); load(); });
  $('#refresh').onclick = load; $('#xls').onclick = excel;
  $('#logout').onclick = () => { sessionStorage.removeItem('dl_admin'); KEY = ''; DATA = null; show(false); msg(''); };
  $('#fst').onchange = (e) => { filt = e.target.value; render(); };
  $('#fq').oninput = (e) => { q = e.target.value.toLowerCase(); render(); };
  $('#rows').addEventListener('change', (e) => { const s = e.target.closest('[data-st]'); if (s) upd(s.dataset.st, { status: s.value }); });
  $('#rows').addEventListener('click', (e) => {
    if (e.target.closest('select,a,textarea,button')) { const b = e.target.closest('[data-save]'); if (b) upd(b.dataset.save, { notes: $(`[data-notes="${b.dataset.save}"]`).value }); return; }
    const tr = e.target.closest('tr[data-ref]'); if (tr) { open = open === tr.dataset.ref ? null : tr.dataset.ref; render(); }
  });
  if (KEY) load(); else show(false);
})();
