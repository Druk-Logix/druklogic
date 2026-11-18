/* Druk Logic website: icons, enquiry basket, marketplace, enquiry sending (email / WhatsApp). No server needed. */
(function () {
  const D = window.DL, C = D.company, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const icon = (n, c = 'ico') => `<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${D.icons[n] || ''}</svg>`;
  const nu = (v) => 'Nu ' + Number(v).toLocaleString('en-IN');
  const byId = Object.fromEntries(D.items.map((i) => [i.id, i]));
  window.dlIcon = icon;

  // icons placed in markup: <i data-i="phone"></i>
  $$('[data-i]').forEach((el) => { el.outerHTML = icon(el.dataset.i, el.className || 'ico'); });
  // prices placed in markup: <span data-price="E04"></span>
  $$('[data-price]').forEach((el) => { const it = byId[el.dataset.price]; if (it) el.textContent = it.price ? nu(it.price) : 'On request'; });

  // mobile menu
  const mb = $('.menu-btn'); if (mb) mb.onclick = () => $('nav.main').classList.toggle('open');

  // reveal on scroll
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach((el) => io.observe(el));

  // toast
  const toast = (t) => { let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); } el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2600); };

  // ---------------- enquiry basket ----------------
  const KEY = 'dl_enquiry';
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const put = (b) => { localStorage.setItem(KEY, JSON.stringify(b)); paint(); };
  const add = (id, q = 1) => { const b = get(); b[id] = (b[id] || 0) + Math.max(1, q); put(b); toast(`${byId[id].name} added to your enquiry`); };
  window.dlAdd = add;

  document.body.insertAdjacentHTML('beforeend', `<div class="drawer" id="drawer"><div class="bg"></div><div class="pane">
    <button class="x" aria-label="Close">${icon('close')}</button>
    <span class="kicker">Your enquiry</span><h3>Request a quotation</h3>
    <p class="note">Add services or products, tell us about your site, then send by email or WhatsApp. ${C.founder} replies personally, usually within one working day.</p>
    <div id="lines"></div>
    <form id="dform">
      <label>Your name<input name="name" required></label>
      <label>Organisation<input name="org"></label>
      <label>Phone / WhatsApp<input name="phone" required></label>
      <label>Email<input name="email" type="email"></label>
      <label>Site location<input name="site" placeholder="e.g. Pasakha, Gelephu, Dagachhu"></label>
      <label>Notes<textarea name="msg" placeholder="Quantities, timeline, existing PLC/SCADA brand..."></textarea></label>
      <div class="send"><button class="btn" data-via="mail" type="submit">${icon('mail')} Send by email</button><button class="btn gold" data-via="wa" type="submit">${icon('chat')} WhatsApp</button></div>
      <p class="note">Prices are indicative and exclusive of taxes. A formal quotation follows a short technical review.</p>
    </form></div></div>`);
  const dr = $('#drawer');
  const open = () => { dr.classList.add('open'); paint(); };
  const close = () => dr.classList.remove('open');
  $('.bg', dr).onclick = close; $('.x', dr).onclick = close;
  $$('[data-open-basket]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); open(); }));

  function paint() {
    const b = get(), ids = Object.keys(b).filter((k) => byId[k]);
    $$('.basket-count').forEach((el) => { const n = ids.reduce((s, k) => s + b[k], 0); el.textContent = n; el.style.display = n ? 'grid' : 'none'; });
    const L = $('#lines'); if (!L) return;
    if (!ids.length) { L.innerHTML = '<div class="empty">Nothing added yet. Browse the <a href="marketplace.html" style="color:var(--maroon);text-decoration:underline">marketplace</a>, or just describe what you need below.</div>'; return; }
    let tot = 0, onReq = false;
    L.innerHTML = ids.map((k) => { const it = byId[k], q = b[k]; if (it.price) tot += it.price * q; else onReq = true;
      return `<div class="line-item"><div>${it.name}<small>${it.price ? nu(it.price) : 'On request'} ${it.unit}</small></div>
      <div class="qty"><button type="button" data-d="${k}">${icon('minus')}</button><input value="${q}" data-q="${k}" inputmode="numeric"><button type="button" data-u="${k}">${icon('plus')}</button></div>
      <button type="button" class="rm" data-r="${k}" aria-label="Remove">${icon('close')}</button></div>`; }).join('') +
      `<div class="total"><span>Indicative total</span><span>${nu(tot)}${onReq ? ' + items on request' : ''}</span></div>`;
    $$('[data-d]', L).forEach((x) => (x.onclick = () => { const b = get(); b[x.dataset.d] = Math.max(1, b[x.dataset.d] - 1); put(b); }));
    $$('[data-u]', L).forEach((x) => (x.onclick = () => { const b = get(); b[x.dataset.u]++; put(b); }));
    $$('[data-r]', L).forEach((x) => (x.onclick = () => { const b = get(); delete b[x.dataset.r]; put(b); }));
    $$('[data-q]', L).forEach((x) => (x.onchange = () => { const b = get(); b[x.dataset.q] = Math.max(1, parseInt(x.value) || 1); put(b); }));
  }

  function compose(f) {
    const b = get(), ids = Object.keys(b).filter((k) => byId[k]);
    let t = `Enquiry for ${C.name}\n\nName: ${f.name || ''}\nOrganisation: ${f.org || ''}\nPhone: ${f.phone || ''}\nEmail: ${f.email || ''}\nSite: ${f.site || ''}\n`;
    if (f.service) t += `Service: ${f.service}\n`;
    if (ids.length) t += '\nItems:\n' + ids.map((k) => `- ${byId[k].name} (${byId[k].id}) x ${b[k]}  [${byId[k].price ? nu(byId[k].price) : 'on request'} ${byId[k].unit}]`).join('\n') + '\n';
    if (f.msg) t += `\nMessage:\n${f.msg}\n`;
    return t + `\nSent from ${C.web}`;
  }
  function send(form, via) {
    if (!form.reportValidity()) return;
    const f = Object.fromEntries(new FormData(form).entries()), body = compose(f);
    if (via === 'wa') window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
    else location.href = `mailto:${C.email}?subject=${encodeURIComponent('Enquiry: ' + (f.org || f.name || 'website'))}&body=${encodeURIComponent(body)}`;
    toast(via === 'wa' ? 'Opening WhatsApp with your enquiry' : 'Opening your email app with the enquiry');
  }
  $$('form[data-enquiry], #dform').forEach((fm) => {
    let via = 'mail';
    $$('[data-via]', fm).forEach((b) => b.addEventListener('click', () => (via = b.dataset.via)));
    fm.addEventListener('submit', (e) => { e.preventDefault(); send(fm, via); });
  });

  // add buttons anywhere: <button data-add="E04">
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-add]'); if (!a) return;
    const q = a.closest('.card') && $('.qty input', a.closest('.card')); add(a.dataset.add, q ? parseInt(q.value) || 1 : 1);
    if (a.dataset.buy !== undefined) open();
  });

  // ---------------- marketplace ----------------
  const M = $('#market');
  if (M) {
    let cat = new URLSearchParams(location.search).get('cat') || 'all', qs = '', sort = 'feat';
    $('#filters').innerHTML = `<button data-c="all">All</button>` + Object.entries(D.cats).map(([k, v]) => `<button data-c="${k}">${v}</button>`).join('');
    const draw = () => {
      $$('#filters button').forEach((b) => b.classList.toggle('on', b.dataset.c === cat));
      let list = D.items.filter((i) => (cat === 'all' || i.cat === cat) && (i.name + i.desc + D.cats[i.cat]).toLowerCase().includes(qs));
      if (sort === 'lo') list = list.slice().sort((a, b) => (a.price || 1e12) - (b.price || 1e12));
      if (sort === 'hi') list = list.slice().sort((a, b) => b.price - a.price);
      $('#count').textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;
      M.innerHTML = list.map((i) => `<article class="card prod"><div class="ic">${icon(i.icon)}</div><div class="cat">${D.cats[i.cat]}</div>
        <h3>${i.name}</h3><p>${i.desc}</p><div class="price">${i.price ? nu(i.price) : 'Price on request'}</div><div class="unit">${i.price ? i.unit + '  ·  excl. taxes' : 'landed cost + handling'}</div>
        <div class="acts"><div class="qty"><button type="button" onclick="const n=this.nextElementSibling;n.value=Math.max(1,(+n.value||1)-1)">${icon('minus')}</button><input value="1" inputmode="numeric" aria-label="Quantity"><button type="button" onclick="const n=this.previousElementSibling;n.value=(+n.value||1)+1">${icon('plus')}</button></div>
        <button class="btn sm" data-add="${i.id}">${icon('bag')} Add</button><button class="btn sm line" data-add="${i.id}" data-buy>Enquire now</button></div></article>`).join('') || '<p>No items match. Try another word.</p>';
    };
    $('#filters').onclick = (e) => { const b = e.target.closest('button'); if (b) { cat = b.dataset.c; draw(); } };
    $('#q').oninput = (e) => { qs = e.target.value.toLowerCase(); draw(); };
    $('#sort').onchange = (e) => { sort = e.target.value; draw(); };
    draw();
  }
  paint();
})();
