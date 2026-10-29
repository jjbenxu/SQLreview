/* Interactive labs, one per unit, the order-of-execution stepper, and the PGlite playground. */
const LABS = {};
const fmt2 = x => Number(x).toFixed(2);
const tbl = (cols, rows, cap, cls) => RES(cols, rows, cap).replace('<table class="res">', `<table class="res ${cls || ''}">`);
const chip = (label, pressed, data) => `<button class="chip" aria-pressed="${pressed}" ${data}>${label}</button>`;

/* ---------- Unit 1: build a single-table query and watch it run ---------- */
const PRODUCTS = [
  ['Espresso Double', 'Beverages', 3.00], ['Herbal Tea 12oz', 'Beverages', 3.25], ['Cold Brew 12oz', 'Beverages', 3.75], ['Latte 16oz', 'Beverages', 5.10],
  ['Blueberry Muffin', 'Bakery', 3.50], ['Almond Croissant', 'Bakery', 4.25], ['Cinnamon Roll', 'Bakery', 4.75], ['Sourdough Loaf', 'Bakery', 6.50],
  ['Cocoa Tin', 'Packaged Goods', 9.75], ['Ground Coffee 12oz', 'Packaged Goods', 13.50], ['Whole Bean 12oz', 'Packaged Goods', 15.00], ['Gift Box', 'Packaged Goods', 28.00],
  ['Ceramic Mug', 'Merchandise', 12.50], ['Canvas Tote', 'Merchandise', 14.00], ['Logo Tumbler', 'Merchandise', 18.00], ['Ball Cap', 'Merchandise', 22.00],
];
LABS.single = pane => {
  const s = { cats: new Set(), min: 0, group: false, having: 0, order: 'unit_price', desc: false, limit: 0 };
  pane.innerHTML = `<h3>Build a query on lecture.products</h3>
    <p>Sixteen products. Add clauses and watch which rows survive and how the result changes shape. The SQL updates as you go.</p>
    <div class="ctl"><span>WHERE category IN (…)</span><div class="chips" id="l-cats">${['Beverages', 'Bakery', 'Packaged Goods', 'Merchandise'].map(c => chip(c, false, `data-c="${c}"`)).join('')}</div></div>
    <div class="row"><label class="ctl"><span>AND unit_price >= <output id="l-min">0</output></span><input type="range" id="l-minr" min="0" max="20" step="1" value="0"></label>
      <label class="ctl"><span>GROUP BY category</span><div class="toggle" id="l-group"><button aria-pressed="false" data-g="0">off</button><button aria-pressed="false" data-g="1">on</button></div></label>
      <label class="ctl"><span>HAVING COUNT(*) >= <output id="l-hav">0</output></span><input type="range" id="l-havr" min="0" max="4" step="1" value="0" disabled></label></div>
    <div class="row"><label class="ctl"><span>ORDER BY</span><select id="l-ord"><option value="unit_price">unit_price</option><option value="product_name">product_name</option><option value="category">category</option><option value="">none</option></select></label>
      <label class="ctl"><span>Direction</span><div class="toggle" id="l-dir"><button aria-pressed="true" data-d="0">ASC</button><button aria-pressed="false" data-d="1">DESC</button></div></label>
      <label class="ctl"><span>LIMIT <output id="l-lim">none</output></span><input type="range" id="l-limr" min="0" max="8" step="1" value="0"></label></div>
    <div id="l-sql"></div><div id="l-out"></div>
    <h3 style="margin-top:10px">COUNT three ways</h3>
    <p>Six rows of one column. Click a cell to make it NULL or to change it, then read the counts. This is the question on every interview list.</p>
    <div class="row" id="l-cells"></div><div id="l-counts"></div>`;
  const draw = () => {
    let rows = PRODUCTS.filter(r => (!s.cats.size || s.cats.has(r[1])) && r[2] >= s.min);
    const where = [];
    if (s.cats.size) where.push(`category IN (${[...s.cats].map(c => `'${c}'`).join(', ')})`);
    if (s.min) where.push(`unit_price >= ${s.min}`);
    let sql, cols, out, note;
    if (s.group) {
      const g = {}; rows.forEach(r => { (g[r[1]] = g[r[1]] || []).push(r); });
      let groups = Object.entries(g).map(([c, rs]) => [c, rs.length, fmt2(Math.min(...rs.map(r => r[2]))), fmt2(rs.reduce((a, r) => a + r[2], 0) / rs.length)]);
      const before = groups.length;
      groups = groups.filter(r => r[1] >= s.having);
      const ordCol = { unit_price: 3, product_name: null, category: 0 }[s.order];
      if (s.order && ordCol !== null) groups.sort((a, b) => (a[ordCol] > b[ordCol] ? 1 : -1) * (s.desc ? -1 : 1));
      if (s.limit) groups = groups.slice(0, s.limit);
      cols = ['category', 'products', 'cheapest', 'avg_price']; out = groups;
      sql = `SELECT   category,\n         COUNT(*)                  AS products,\n         MIN(unit_price)           AS cheapest,\n         ROUND(AVG(unit_price), 2) AS avg_price\nFROM     lecture.products` + (where.length ? `\nWHERE    ${where.join('\n  AND    ')}` : '') + `\nGROUP BY category` + (s.having ? `\nHAVING   COUNT(*) >= ${s.having}` : '') + (s.order && ordCol !== null ? `\nORDER BY ${s.order === 'unit_price' ? 'avg_price' : 'category'}${s.desc ? ' DESC' : ''}` : '') + (s.limit ? `\nLIMIT    ${s.limit}` : '') + ';';
      note = `${rows.length} rows in, ${before} groups, ${groups.length} after HAVING${s.limit ? ' and LIMIT' : ''}. One row per category: that is the granularity now. product_name cannot appear in SELECT, because a group has several.`;
    } else {
      const ordCol = { unit_price: 2, product_name: 0, category: 1 }[s.order];
      if (s.order) rows = [...rows].sort((a, b) => (a[ordCol] > b[ordCol] ? 1 : -1) * (s.desc ? -1 : 1));
      if (s.limit) rows = rows.slice(0, s.limit);
      cols = ['product_name', 'category', 'unit_price']; out = rows.map(r => [r[0], r[1], fmt2(r[2])]);
      sql = `SELECT   product_name, category, unit_price\nFROM     lecture.products` + (where.length ? `\nWHERE    ${where.join('\n  AND    ')}` : '') + (s.order ? `\nORDER BY ${s.order}${s.desc ? ' DESC' : ''}` : '') + (s.limit ? `\nLIMIT    ${s.limit}` : '') + ';';
      note = `${out.length} of 16 rows. ${!s.order && s.limit ? 'LIMIT without ORDER BY: these are some rows, not the top rows.' : ''}`;
    }
    $('#l-sql', pane).innerHTML = SQL(sql); $('#l-out', pane).innerHTML = tbl(cols, out, note);
    $('#l-havr', pane).disabled = !s.group;
  };
  $('#l-cats', pane).onclick = e => { const b = e.target.closest('.chip'); if (!b) return; const c = b.dataset.c; s.cats.has(c) ? s.cats.delete(c) : s.cats.add(c); b.setAttribute('aria-pressed', s.cats.has(c)); draw(); };
  $('#l-minr', pane).oninput = e => { s.min = +e.target.value; $('#l-min', pane).value = s.min; draw(); };
  $('#l-group', pane).onclick = e => { const b = e.target.closest('[data-g]'); if (!b) return; s.group = b.dataset.g === '1'; $$('[data-g]', pane).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); };
  $('#l-havr', pane).oninput = e => { s.having = +e.target.value; $('#l-hav', pane).value = s.having; draw(); };
  $('#l-ord', pane).onchange = e => { s.order = e.target.value; draw(); };
  $('#l-dir', pane).onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; s.desc = b.dataset.d === '1'; $$('[data-d]', pane).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); };
  $('#l-limr', pane).oninput = e => { s.limit = +e.target.value; $('#l-lim', pane).value = s.limit || 'none'; draw(); };
  draw();
  /* COUNT three ways */
  const cells = [10, null, 20, 10, null, 30];
  const drawC = () => {
    $('#l-cells', pane).innerHTML = cells.map((v, i) => `<button class="chip ${v === null ? 'bad' : ''}" data-i="${i}">${v === null ? 'NULL' : v}</button>`).join('') + '<span class="note">click: 10 → 20 → 30 → NULL</span>';
    const nn = cells.filter(v => v !== null);
    $('#l-counts', pane).innerHTML = tbl(['COUNT(*)', 'COUNT(x)', 'COUNT(DISTINCT x)', 'SUM(x)', 'AVG(x)', 'AVG(COALESCE(x, 0))'],
      [[cells.length, nn.length, new Set(nn).size, nn.reduce((a, b) => a + b, 0), nn.length ? fmt2(nn.reduce((a, b) => a + b, 0) / nn.length) : null, fmt2(nn.reduce((a, b) => a + b, 0) / cells.length)]],
      'COUNT(*) counts rows; COUNT(x) skips NULLs; AVG divides by the values present unless you COALESCE first.');
  };
  $('#l-cells', pane).onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; const i = +b.dataset.i; cells[i] = cells[i] === null ? 10 : cells[i] === 30 ? null : cells[i] + 10; drawC(); };
  drawC();
};

/* ---------- Unit 2: join visualizer ---------- */
const CUST = [[3, 'Sofia'], [6, 'Amara'], [11, 'Fiona'], [40, 'Hugo']];
const ORD = [['ORD-1089', 3, '2026-02-10'], ['ORD-1078', 6, '2026-01-20'], ['ORD-1108', 6, '2026-03-05'], ['ORD-1150', 99, '2026-03-12']];
const ITEMS = [['ORD-1078', 106, 17], ['ORD-1078', 116, 3], ['ORD-1108', 101, 10], ['ORD-1108', 104, 25], ['ORD-1089', 102, 4]];
LABS.joins = pane => {
  const s = { kind: 'INNER', anti: false, filter: 'none' };
  const venn = (l, r, m) => `<svg viewBox="0 0 64 40"><circle cx="24" cy="20" r="15" fill="${l ? 'var(--accent)' : 'none'}" stroke="var(--muted)" opacity=".8"/><circle cx="40" cy="20" r="15" fill="${r ? 'var(--accent)' : 'none'}" stroke="var(--muted)" opacity=".8"/><path d="M32 8.5a15 15 0 0 1 0 23a15 15 0 0 1 0-23z" fill="${m ? 'var(--accent)' : 'var(--surface)'}" stroke="var(--muted)"/></svg>`;
  pane.innerHTML = `<h3>customers ⋈ orders, row by row</h3>
    <p>Four customers, four orders. Pick a join, then try the anti-join and the March filter in ON versus WHERE. Dropped rows are struck through; rows made by the join are tinted.</p>
    <div class="two">${tbl(['customer_id', 'first_name'], CUST, 'customers (4)')}${tbl(['order_id', 'customer_id', 'order_date'], ORD, 'orders (4): one has customer 99, who is not on file')}</div>
    <div class="venn" id="j-kind">${[['INNER', 'INNER JOIN', 0, 0, 1], ['LEFT', 'LEFT JOIN', 1, 0, 1], ['RIGHT', 'RIGHT JOIN', 0, 1, 1], ['FULL', 'FULL JOIN', 1, 1, 1]].map(([k, t, l, r, m]) => `<button aria-pressed="${k === s.kind}" data-k="${k}">${venn(l, r, m)}${t}</button>`).join('')}</div>
    <div class="row"><label class="ctl"><span>Anti-join</span><div class="toggle" id="j-anti"><button aria-pressed="true" data-a="0">no</button><button aria-pressed="false" data-a="1">WHERE o.order_id IS NULL</button></div></label>
      <label class="ctl"><span>March filter</span><div class="toggle" id="j-f"><button aria-pressed="true" data-f="none">none</button><button aria-pressed="false" data-f="on">in ON</button><button aria-pressed="false" data-f="where">in WHERE</button></div></label></div>
    <div id="j-sql"></div><div id="j-out"></div><div id="j-count"></div>
    <h3 style="margin-top:10px">Fan-out: orders ⋈ order_items</h3>
    <p>Three orders have line items; one order has two of them. Count the result three ways.</p>
    <div class="two">${tbl(['order_id', 'product_id', 'units'], ITEMS, 'order_items (5): one product on one order')}<div id="j-fan"></div></div>`;
  const draw = () => {
    const march = d => d >= '2026-03-01';
    const matchOk = (c, o) => o[1] === c[0] && (s.filter !== 'on' || march(o[2]));
    let rows = [];
    CUST.forEach(c => { const ms = ORD.filter(o => matchOk(c, o)); if (ms.length) ms.forEach(o => rows.push({ c, o, cls: '' })); else if (s.kind === 'LEFT' || s.kind === 'FULL') rows.push({ c, o: null, cls: 'new' }); });
    if (s.kind === 'RIGHT' || s.kind === 'FULL') ORD.forEach(o => { if (!CUST.some(c => matchOk(c, o))) rows.push({ c: null, o, cls: 'new' }); });
    rows.forEach(r => { if (s.filter === 'where' && !(r.o && march(r.o[2]))) r.cls = 'drop'; if (s.anti && r.o) r.cls = 'drop'; });
    const kept = rows.filter(r => r.cls !== 'drop');
    const sql = `SELECT   c.customer_id, c.first_name, o.order_id, o.order_date\nFROM     customers AS c\n${s.kind} JOIN orders AS o\n  ON     o.customer_id = c.customer_id${s.filter === 'on' ? "\n AND     o.order_date >= '2026-03-01'" : ''}` + (s.filter === 'where' || s.anti ? `\nWHERE    ${[s.filter === 'where' ? "o.order_date >= '2026-03-01'" : null, s.anti ? 'o.order_id IS NULL' : null].filter(Boolean).join('\n  AND    ')}` : '') + ';';
    $('#j-sql', pane).innerHTML = SQL(sql);
    const html = `<div class="tw"><table class="res"><caption>result: ${kept.length} row${kept.length === 1 ? '' : 's'}</caption><tr><th>customer_id</th><th>first_name</th><th>order_id</th><th>order_date</th></tr>` +
      rows.map(r => `<tr class="${r.cls}">${[r.c ? r.c[0] : null, r.c ? r.c[1] : null, r.o ? r.o[0] : null, r.o ? r.o[2] : null].map(v => v === null ? '<td class="null">NULL</td>' : `<td>${v}</td>`).join('')}</tr>`).join('') + '</table></div>';
    $('#j-out', pane).innerHTML = html;
    let say;
    if (s.anti) say = kept.length ? `The anti-join: only the ${s.kind === 'INNER' ? '' : ''}rows where the orders side came back NULL survive. ${s.filter === 'on' ? 'With the March test in ON, "no March order" is answered correctly: Sofia and Amara\'s older orders did not count as matches.' : s.filter === 'where' ? 'With the March test in WHERE as well, nothing can satisfy both NULL and >= March: 0 rows.' : 'Customers who never ordered.'}` : `0 rows. ${s.kind === 'INNER' || s.kind === 'RIGHT' ? 'An INNER or RIGHT JOIN keeps no unmatched customers, so there is nothing for IS NULL to find.' : 'With the March test in WHERE as well, no row can be both NULL and >= March.'}`;
    else if (s.filter === 'where' && (s.kind === 'LEFT' || s.kind === 'FULL')) say = 'The WHERE runs after the join. For the kept customers, o.order_date is NULL, the comparison is unknown, and the row is dropped: the LEFT JOIN has quietly become an INNER JOIN.';
    else if (s.filter === 'on' && (s.kind === 'LEFT' || s.kind === 'FULL')) say = 'ON decides what counts as a match. Customers with no March order are still kept, with NULLs. COUNT(o.order_id) per customer would give the zeros the business wants.';
    else if (s.kind === 'INNER') say = 'One row per match. Amara has two orders, so she appears twice. Fiona and Hugo have none, so they are gone. Order ORD-1150 belongs to nobody on file, so it is gone too.';
    else if (s.kind === 'LEFT') say = 'Every customer survives. Fiona and Hugo are kept with NULL order columns. The orphan order ORD-1150 is not: it is on the right.';
    else if (s.kind === 'RIGHT') say = 'Every order survives, including ORD-1150 with NULL customer columns. Fiona and Hugo are gone. Analysts write this as orders LEFT JOIN customers.';
    else say = 'Every row of both tables. Unmatched on either side comes back with NULLs: the shape you use to reconcile two lists.';
    const perC = CUST.map(c => { const rs = kept.filter(r => r.c && r.c[0] === c[0]); return [c[1], rs.length, rs.filter(r => r.o).length]; });
    $('#j-count', pane).innerHTML = `<p class="note">${say}</p>` + ((s.kind === 'LEFT' || s.kind === 'FULL') && !s.anti ? tbl(['first_name', 'COUNT(*)', 'COUNT(o.order_id)'], perC, 'GROUP BY customer: COUNT(*) counts the kept NULL row as 1; COUNT(o.order_id) skips it.') : '');
  };
  $('#j-kind', pane).onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; s.kind = b.dataset.k; $$('[data-k]', pane).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); };
  $('#j-anti', pane).onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; s.anti = b.dataset.a === '1'; $$('[data-a]', pane).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); };
  $('#j-f', pane).onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; s.filter = b.dataset.f; $$('[data-f]', pane).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); };
  draw();
  const joined = []; ORD.forEach(o => ITEMS.filter(i => i[0] === o[0]).forEach(i => joined.push([o[0], o[1], i[1], i[2]])));
  $('#j-fan', pane).innerHTML = tbl(['order_id', 'customer_id', 'product_id', 'units'], joined, `orders JOIN order_items: ${joined.length} rows from ${ORD.length} orders`) +
    tbl(['COUNT(*)', 'COUNT(DISTINCT order_id)', 'SUM(units)'], [[joined.length, new Set(joined.map(r => r[0])).size, joined.reduce((a, r) => a + r[3], 0)]], 'COUNT(*) counted line items and called them orders. SUM(units) is fine: units live on the line rows.');
};

/* ---------- Unit 3: CASE builder, NULL and division calculator, dates ---------- */
LABS.shaping = pane => {
  const prices = [3.00, 4.75, 5.10, 9.75, 14.00, 15.00, 18.00, 28.00];
  const whens = [{ op: '<', v: 5, label: 'Under $5' }, { op: '<', v: 15, label: '$5 to $15' }];
  let useElse = true;
  pane.innerHTML = `<h3>CASE: first match wins</h3>
    <p>Two WHENs and an ELSE, applied to eight prices. Swap the WHENs, change the operators, or drop the ELSE, and watch where each price lands.</p>
    <div class="clauses" id="c-whens"></div>
    <div class="row"><button class="btn alt" id="c-swap">Swap the two WHENs</button><label class="ctl" style="flex:0 1 auto"><span>ELSE '$15 and up'</span><div class="toggle" id="c-else"><button aria-pressed="true" data-e="1">on</button><button aria-pressed="false" data-e="0">off</button></div></label></div>
    <div class="two"><div id="c-sql"></div><div id="c-out"></div></div>
    <h3 style="margin-top:10px">NULL, integer division and NULLIF</h3>
    <p>Each row is one expression PostgreSQL will happily evaluate. Nothing errors except the last one.</p>
    <div id="c-calc"></div>
    <h3 style="margin-top:10px">Dates against a timestamp</h3>
    <p>Pick a day. The filters below are what the slides compare: BETWEEN up to that day, and the half-open range up to the next day.</p>
    <div class="row"><label class="ctl" style="flex:0 1 220px"><span>order timestamp</span><input type="datetime-local" id="c-ts" value="2026-03-31T14:05"></label></div>
    <div id="c-dates"></div>`;
  const drawCase = () => {
    $('#c-whens', pane).innerHTML = whens.map((w, i) => `<div class="clause"><span class="n">WHEN</span><span class="c"><select data-i="${i}" data-k="op"><option ${w.op === '<' ? 'selected' : ''}>&lt;</option><option ${w.op === '>=' ? 'selected' : ''}>&gt;=</option></select> ${w.v}</span><span>THEN '${w.label}'</span></div>`).join('');
    const bucket = p => { for (const w of whens) if (w.op === '<' ? p < w.v : p >= w.v) return w.label; return useElse ? '$15 and up' : null; };
    const sql = `SELECT product_name, unit_price,\n       CASE\n${whens.map(w => `         WHEN unit_price ${w.op} ${w.v} THEN '${w.label}'`).join('\n')}${useElse ? "\n         ELSE '$15 and up'" : ''}\n       END AS price_tier\nFROM   lecture.products;`;
    $('#c-sql', pane).innerHTML = SQL(sql);
    const counts = {}; prices.forEach(p => { const b = bucket(p); counts[b] = (counts[b] || 0) + 1; });
    const bad = whens[0].op === '>=' && whens[1].op === '>=' && whens[0].v < whens[1].v;
    $('#c-out', pane).innerHTML = tbl(['unit_price', 'price_tier'], prices.map(p => [fmt2(p), bucket(p)]), 'row by row') + tbl(['price_tier', 'products'], Object.entries(counts), 'GROUP BY price_tier') +
      `<p class="note">${bad ? 'Trap: every price that is >= 15 is also >= 5, so the first WHEN claims it and the second never fires. Most specific first.' : whens[0].op === '<' && whens[1].op === '<' && whens[0].v > whens[1].v ? 'Trap: the first WHEN (< 15) swallows everything under 15, so "Under $5" is never reached.' : !useElse ? 'No ELSE: rows that match no WHEN get NULL, silently. GROUP BY shows a NULL bucket.' : 'Each row takes the first WHEN that is true. Sort the buckets with ORDER BY MIN(unit_price), not by the label.'}</p>`;
  };
  $('#c-whens', pane).onchange = e => { const t = e.target; if (t.dataset.k === 'op') whens[+t.dataset.i].op = t.value.replace('&gt;=', '>=').replace('&lt;', '<'); drawCase(); };
  $('#c-swap', pane).onclick = () => { whens.reverse(); drawCase(); };
  $('#c-else', pane).onclick = e => { const b = e.target.closest('[data-e]'); if (!b) return; useElse = b.dataset.e === '1'; $$('[data-e]', pane).forEach(x => x.setAttribute('aria-pressed', x === b)); drawCase(); };
  drawCase();
  $('#c-calc', pane).innerHTML = tbl(['expression', 'result', 'why'], [
    ['5 + NULL', null, 'Any arithmetic with a NULL is NULL'],
    ["'Amara ' || NULL", null, 'Concatenation too'],
    ['COALESCE(NULL, 0) + 5', 5, 'COALESCE first, then add'],
    ['11 / 24', 0, 'integer / integer: the fraction is dropped'],
    ['CAST(11 AS numeric) / 24', '0.4583…', 'one numeric side keeps it'],
    ['100.0 * 11 / 24', '45.83…', 'a decimal literal does the same'],
    ['ROUND(100.0 * 11 / 24, 1)', '45.8', 'round only at the end'],
    ['7 / 2', 3, 'not 3.5, and not rounded: truncated'],
    ['10 / NULLIF(0, 0)', null, 'NULLIF makes the 0 a NULL; dividing by NULL is NULL'],
    ['10 / 0', 'ERROR', 'division by zero stops the query'],
    ["COUNT(NULLIF(address2, ''))", '0 of 1003', "'' becomes NULL, so COUNT skips it"],
    ["COALESCE(return_date, 'none')", 'ERROR', 'all arguments must share a type; CAST the date to text first'],
  ], '');
  const drawDates = () => {
    const v = $('#c-ts', pane).value; if (!v) return;
    const d = new Date(v); const day = v.slice(0, 10); const next = new Date(d); next.setDate(next.getDate() + 1); const nextDay = next.toISOString().slice(0, 10);
    const month = day.slice(0, 7) + '-01'; const dow = d.getDay(); const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const atMidnight = v.slice(11) === '00:00';
    $('#c-dates', pane).innerHTML = tbl(['expression', 'result'], [
      [`ordered_at BETWEEN '${month}' AND '${day}'`, atMidnight ? 'kept (exactly midnight)' : 'DROPPED: the upper bound means midnight at the start of the day'],
      [`ordered_at >= '${month}' AND ordered_at < '${nextDay}'`, 'kept'],
      [`CAST(ordered_at AS date)`, day],
      [`CAST(DATE_TRUNC('month', ordered_at) AS date)`, month],
      [`EXTRACT(MONTH FROM ordered_at)`, String(d.getMonth() + 1)],
      [`EXTRACT(DOW FROM ordered_at)`, `${dow} (${names[dow]}; 0 is Sunday)`],
      [`DATE '${day}' + 30`, new Date(d.getTime() + 30 * 864e5).toISOString().slice(0, 10) + ' (a date)'],
      [`DATE '2026-03-31' - DATE '${day}'`, Math.round((new Date('2026-03-31') - new Date(day)) / 864e5) + ' (an integer, days)'],
    ], '');
  };
  $('#c-ts', pane).oninput = drawDates; drawDates();
};

/* ---------- Unit 4: window function playground ---------- */
const PROD = [['Bakery', 'Blueberry Muffin', 777.00], ['Bakery', 'Sourdough Loaf', 728.00], ['Bakery', 'Cinnamon Roll', 726.75], ['Bakery', 'Almond Croissant', 629.00],
  ['Beverages', 'Latte 16oz', 2356.20], ['Beverages', 'Cold Brew 12oz', 1121.25], ['Beverages', 'Herbal Tea 12oz', 1121.25], ['Beverages', 'Espresso Double', 646.25]];
const MONTHS = [['2026-01-01', 3731.70], ['2026-02-01', 3906.20], ['2026-03-01', 5495.55], ['2026-04-01', 4120.00], ['2026-05-01', 4120.00], ['2026-06-01', 3980.50]];
LABS.multi = pane => {
  let fn = 'sum', part = false;
  let tfn = 'lag', drop = false;
  pane.innerHTML = `<h3>Aggregate, or window?</h3>
    <p>Eight products with revenue. Pick a function and toggle PARTITION BY category. Every row stays; a new column appears beside it. Two Beverages tie at 1,121.25 on purpose.</p>
    <div class="row"><div class="chips" id="m-fn">${[['sum', 'SUM(revenue) OVER'], ['pct', '100 * revenue / SUM(revenue) OVER'], ['row', 'ROW_NUMBER() OVER (ORDER BY revenue DESC)'], ['rank', 'RANK() OVER (ORDER BY revenue DESC)'], ['dense', 'DENSE_RANK() OVER (ORDER BY revenue DESC)'], ['group', 'plain GROUP BY (collapses)']].map(([k, t]) => chip(t, k === fn, `data-fn="${k}"`)).join('')}</div></div>
    <div class="row"><label class="ctl" style="flex:0 1 auto"><span>PARTITION BY category</span><div class="toggle" id="m-part"><button aria-pressed="true" data-p="0">off</button><button aria-pressed="false" data-p="1">on</button></div></label></div>
    <div class="two"><div id="m-sql"></div><div id="m-out"></div></div>
    <h3 style="margin-top:10px">Over time: LAG, running total, moving average</h3>
    <p>Six months of revenue. Remove February and watch what LAG and the frame do: they read rows, not months.</p>
    <div class="row"><div class="chips" id="m-tfn">${[['lag', 'LAG(revenue) OVER (ORDER BY month)'], ['lead', 'LEAD(revenue) OVER (ORDER BY month)'], ['run', 'SUM … ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW'], ['mov', 'AVG … ROWS BETWEEN 2 PRECEDING AND CURRENT ROW']].map(([k, t]) => chip(t, k === tfn, `data-t="${k}"`)).join('')}</div>
      <label class="ctl" style="flex:0 1 auto"><span>February row</span><div class="toggle" id="m-drop"><button aria-pressed="true" data-d="0">present</button><button aria-pressed="false" data-d="1">missing (WHERE removed it)</button></div></label></div>
    <div class="two"><div id="m-tsql"></div><div id="m-tout"></div></div>`;
  const draw = () => {
    const over = part ? 'PARTITION BY category' : '';
    let sql, cols, rows, note;
    const groups = {}; PROD.forEach(r => { (groups[r[0]] = groups[r[0]] || []).push(r); });
    const total = PROD.reduce((a, r) => a + r[2], 0);
    const rankIn = (list, r, kind) => { const sorted = [...list].sort((a, b) => b[2] - a[2]); if (kind === 'row') return sorted.indexOf(r) + 1; const higher = sorted.filter(x => x[2] > r[2]); if (kind === 'rank') return higher.length + 1; return new Set(higher.map(x => x[2])).size + 1; };
    if (fn === 'group') {
      cols = part ? ['category', 'SUM(revenue)'] : ['SUM(revenue)']; rows = part ? Object.entries(groups).map(([c, rs]) => [c, fmt2(rs.reduce((a, r) => a + r[2], 0))]) : [[fmt2(total)]];
      sql = `SELECT ${part ? 'category, ' : ''}SUM(revenue)\nFROM   by_product${part ? '\nGROUP BY category' : ''};`; note = `${rows.length} row${rows.length > 1 ? 's' : ''}. The 8 products are gone: an aggregate collapses rows.`;
    } else {
      const win = r => { const list = part ? groups[r[0]] : PROD; const t = list.reduce((a, x) => a + x[2], 0); if (fn === 'sum') return fmt2(t); if (fn === 'pct') return (100 * r[2] / t).toFixed(1); return rankIn(list, r, fn); };
      const name = { sum: 'total', pct: 'pct', row: 'row_num', rank: 'rnk', dense: 'dense' }[fn];
      const expr = { sum: `SUM(revenue) OVER (${over})`, pct: `ROUND(100 * revenue / SUM(revenue) OVER (${over}), 1)`, row: `ROW_NUMBER() OVER (${over}${over ? ' ' : ''}ORDER BY revenue DESC)`, rank: `RANK() OVER (${over}${over ? ' ' : ''}ORDER BY revenue DESC)`, dense: `DENSE_RANK() OVER (${over}${over ? ' ' : ''}ORDER BY revenue DESC)` }[fn];
      cols = ['category', 'product_name', 'revenue', name]; rows = PROD.map(r => [r[0], r[1], fmt2(r[2]), win(r)]);
      sql = `SELECT category, product_name, revenue,\n       ${expr} AS ${name}\nFROM   by_product\nORDER BY category, revenue DESC;`;
      note = { sum: part ? 'Each row carries its own category\'s total. GROUP BY for a window: nothing collapsed.' : 'The same total on every row. Now a row can be compared with the whole.', pct: part ? 'Each category\'s products add up to 100.' : 'The eight shares add up to 100. Group first (the CTE), window second.', row: 'No ties: the two Beverages at 1,121.25 get different numbers, and which is first is arbitrary without a tie-breaker.', rank: 'The tie shares a place and the next place is skipped (1, 2, 2, 4).', dense: 'The tie shares a place and nothing is skipped (1, 2, 2, 3). DENSE_RANK = 2 is "the second-highest value".' }[fn];
    }
    $('#m-sql', pane).innerHTML = SQL(sql); $('#m-out', pane).innerHTML = tbl(cols, rows, note);
  };
  $('#m-fn', pane).onclick = e => { const b = e.target.closest('[data-fn]'); if (!b) return; fn = b.dataset.fn; $$('[data-fn]', pane).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); };
  $('#m-part', pane).onclick = e => { const b = e.target.closest('[data-p]'); if (!b) return; part = b.dataset.p === '1'; $$('[data-p]', pane).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); };
  draw();
  const drawT = () => {
    const ms = drop ? MONTHS.filter(m => !m[0].startsWith('2026-02')) : MONTHS;
    const rows = ms.map((m, i) => {
      let v, change = null;
      if (tfn === 'lag') { v = i ? fmt2(ms[i - 1][1]) : null; change = i ? fmt2(m[1] - ms[i - 1][1]) : null; }
      else if (tfn === 'lead') v = i < ms.length - 1 ? fmt2(ms[i + 1][1]) : null;
      else if (tfn === 'run') v = fmt2(ms.slice(0, i + 1).reduce((a, x) => a + x[1], 0));
      else { const w = ms.slice(Math.max(0, i - 2), i + 1); v = fmt2(w.reduce((a, x) => a + x[1], 0) / w.length) + ` (${w.length} row${w.length > 1 ? 's' : ''})`; }
      return tfn === 'lag' ? [m[0], fmt2(m[1]), v, change] : [m[0], fmt2(m[1]), v];
    });
    const expr = { lag: 'LAG(revenue) OVER (ORDER BY month) AS prev_month,\n       revenue - LAG(revenue) OVER (ORDER BY month) AS change', lead: 'LEAD(revenue) OVER (ORDER BY month) AS next_month', run: 'SUM(revenue) OVER (ORDER BY month\n           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total', mov: 'ROUND(AVG(revenue) OVER (ORDER BY month\n           ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS avg_3' }[tfn];
    $('#m-tsql', pane).innerHTML = SQL(`WITH monthly AS (\n  SELECT month, revenue FROM …${drop ? "\n  WHERE  month <> '2026-02-01'   -- February removed" : ''}\n)\nSELECT month, revenue,\n       ${expr}\nFROM   monthly\nORDER BY month;`);
    const cols = tfn === 'lag' ? ['month', 'revenue', 'prev_month', 'change'] : ['month', 'revenue', { lead: 'next_month', run: 'running_total', mov: 'avg_3' }[tfn]];
    const note = { lag: drop ? 'March\'s "previous month" is now January: LAG reads the previous ROW. The first row is NULL either way, which is right: there is nothing before it.' : 'January has no previous row, so its LAG is NULL and the change is NULL. Correct, not a bug.', lead: 'The mirror image: the last row has no next row.', run: drop ? 'The running total silently skips February\'s revenue; nothing says a month is missing.' : 'The last running total is the whole period.', mov: drop ? 'March\'s "three-row" average now spans January to March with February missing: three rows are not three months. Start from a calendar.' : 'A frame counts rows. The first rows have fewer than three.' }[tfn];
    $('#m-tout', pane).innerHTML = tbl(cols, rows, note);
  };
  $('#m-tfn', pane).onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; tfn = b.dataset.t; $$('[data-t]', pane).forEach(x => x.setAttribute('aria-pressed', x === b)); drawT(); };
  $('#m-drop', pane).onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; drop = b.dataset.d === '1'; $$('[data-d]', pane).forEach(x => x.setAttribute('aria-pressed', x === b)); drawT(); };
  drawT();
};

/* ---------- Order of execution stepper and sorter ---------- */
const CLAUSES = [
  ['FROM', 'lecture.orders AS o JOIN lecture.customers AS c ON …', 'Finds the tables and joins them. Every column of both is now available.', 1],
  ['WHERE', "o.order_date >= '2026-03-01'", 'Keeps rows. No aliases exist yet, no counts exist yet. On a LEFT JOIN this is where a test on the right table drops the NULL rows.', 2],
  ['GROUP BY', 'c.customer_id', 'Makes one row per customer. From here on, columns that are not grouped only exist inside aggregates.', 3],
  ['HAVING', 'COUNT(*) >= 2', 'Keeps groups. The count exists now, but the alias order_count still does not.', 4],
  ['window', 'ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC)', 'Window functions run over the grouped rows. WHERE and HAVING could not see this column; only the next query (a CTE) can filter on it.', 5],
  ['SELECT', 'c.customer_id, COUNT(*) AS order_count, ROW_NUMBER() … AS rn', 'Picks and computes the columns and names the aliases. This is when order_count is born.', 6],
  ['ORDER BY', 'order_count DESC', 'Sorts, and can use the alias because it runs after SELECT.', 7],
  ['LIMIT', '5', 'Cuts the sorted rows.', 8],
];
LABS.order = pane => {
  const written = [5, 0, 1, 2, 3, 6, 7];
  let step = 0;
  pane.innerHTML = `<p>Written order on the left; click <b>Run next clause</b> to watch the database work through it in its own order.</p>
    <div class="clauses" id="o-list"></div>
    <div class="row"><button class="btn" id="o-next">Run next clause</button><button class="btn alt" id="o-reset">Start over</button><span class="note" id="o-say">Nothing has run yet.</span></div>
    <h3 style="margin-top:10px">Put them in running order</h3><p>Click the clauses in the order the database runs them.</p>
    <div class="seq" id="o-seq"></div><p class="note" id="o-seqsay"></p>`;
  const draw = () => {
    $('#o-list', pane).innerHTML = written.map(i => { const c = CLAUSES[i]; const ran = c[3] <= step; const now = c[3] === step; return `<div class="clause ${now ? 'on' : ''} ${ran || now ? '' : 'dim'}"><span class="n">${ran || now ? 'ran ' + c[3] : ''}</span><span class="c">${c[0] === 'window' ? '(window)' : c[0]}</span><span>${esc(c[1])}</span></div>`; }).join('');
    const cur = CLAUSES.find(c => c[3] === step);
    $('#o-say', pane).innerHTML = cur ? `<b>${cur[0]}.</b> ${cur[2]}` : 'Nothing has run yet.';
    $('#o-next', pane).disabled = step >= 8;
  };
  $('#o-next', pane).onclick = () => { step = Math.min(8, step + 1); draw(); };
  $('#o-reset', pane).onclick = () => { step = 0; draw(); };
  draw();
  const names = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'window functions', 'ORDER BY', 'LIMIT'];
  const answer = ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'window functions', 'SELECT', 'ORDER BY', 'LIMIT'];
  let placed = [];
  const drawSeq = () => {
    $('#o-seq', pane).innerHTML = names.map(n => { const k = placed.indexOf(n); return `<button data-n="${n}" class="${k < 0 ? '' : answer[k] === n ? 'placed' : 'wrong'}" ${k < 0 ? '' : 'disabled'}>${k < 0 ? '' : (k + 1) + '. '}${n}</button>`; }).join('') + (placed.length ? '<button data-n="" class="ghost">reset</button>' : '');
    const wrong = placed.filter((n, i) => answer[i] !== n).length;
    $('#o-seqsay', pane).textContent = placed.length === 8 ? (wrong ? `${wrong} out of place. The order is ${answer.join(' → ')}.` : 'Correct: ' + answer.join(' → ')) : '';
  };
  $('#o-seq', pane).onclick = e => { const b = e.target.closest('[data-n]'); if (!b) return; if (!b.dataset.n) placed = []; else placed.push(b.dataset.n); drawSeq(); };
  drawSeq();
};

/* ---------- Playground: PGlite with the northgate sample ---------- */
let PG = null, PG_READY = null;
const EXAMPLES = () => WALK.filter(w => w.src === 'lab').map(w => [`${SETS.find(s => s[0] === w.set)[1]} lab ${w.label}: ${w.q.slice(0, 70)}…`, w.sql]);
async function loadPG(status) {
  if (PG_READY) return PG_READY;
  PG_READY = (async () => {
    status('Loading PostgreSQL (about 4 MB, once)…');
    const mod = await import('https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.2.17/dist/index.js');
    const db = new mod.PGlite('idb://sqlreview-northgate');
    const have = await db.query("SELECT COUNT(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'");
    const man = await (await fetch('data/northgate/manifest.json')).json();
    if (have.rows[0].n < man.tables.length) {
      await db.exec(man.schema);
      for (const t of man.tables) {
        status(`Loading ${t.name} (${t.rows.toLocaleString()} rows)…`);
        const res = await fetch('data/northgate/' + t.file);
        const blob = await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).blob();
        await db.query(`COPY ${t.name} FROM '/dev/blob' WITH (FORMAT csv, HEADER true)`, [], { blob });
      }
    }
    status('Indexing…');
    await db.exec("CREATE INDEX IF NOT EXISTS ix_ol_order ON order_lines(order_id); CREATE INDEX IF NOT EXISTS ix_ol_prod ON order_lines(product_id); CREATE INDEX IF NOT EXISTS ix_o_id ON orders(order_id); CREATE INDEX IF NOT EXISTS ix_o_cust ON orders(customer_id); CREATE INDEX IF NOT EXISTS ix_o_store ON orders(store_id); CREATE INDEX IF NOT EXISTS ix_o_date ON orders(order_date); CREATE INDEX IF NOT EXISTS ix_c_id ON customers(customer_id); CREATE INDEX IF NOT EXISTS ix_p_id ON products(product_id); CREATE INDEX IF NOT EXISTS ix_er ON exchange_rates(rate_date, from_currency, to_currency); CREATE INDEX IF NOT EXISTS ix_cal ON calendar(calendar_date); ANALYZE;");
    PG = db; status('Ready.'); return db;
  })();
  PG_READY.catch(() => { PG_READY = null; });
  return PG_READY;
}
/* Run the student's query and the model query; compare shape, row count, values and order the way the lab grader does. */
const normCell = v => v === null || v === undefined ? 'NULL' : v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'object' ? JSON.stringify(v) : String(v);
const sameCell = (a, b) => { if (a === b) return true; const x = parseFloat(a), y = parseFloat(b); return a !== 'NULL' && b !== 'NULL' && !isNaN(x) && !isNaN(y) && /^-?[\d.]+$/.test(a) && /^-?[\d.]+$/.test(b) && Math.abs(x - y) < 0.006; };
async function checkQuery(mine, model) {
  const fail = html => ({ ok: false, html });
  let r1; try { r1 = await PG.query(mine); } catch (e) { return fail(`<b>Your query failed.</b> ${esc(e.message)}`); }
  const r2 = await PG.query(model);
  const c1 = r1.fields.map(f => f.name), c2 = r2.fields.map(f => f.name);
  const rows1 = r1.rows.map(r => c1.map(c => normCell(r[c]))), rows2 = r2.rows.map(r => c2.map(c => normCell(r[c])));
  const peek = rows => rows.slice(0, 3).map(r => r.join(' | ')).join('<br>');
  if (c1.length !== c2.length) return fail(`<b>Column count differs.</b> You returned ${c1.length} (${c1.join(', ')}); expected ${c2.length} (${c2.join(', ')}). Column names are not checked, but the number and order are.`);
  if (rows1.length !== rows2.length) return fail(`<b>Row count differs.</b> You returned ${rows1.length.toLocaleString()} rows; expected ${rows2.length.toLocaleString()}.${rows1.length ? '<br>Yours start:<br><span class="mono">' + peek(rows1) + '</span>' : ''}<br>Expected start:<br><span class="mono">${peek(rows2)}</span>`);
  for (let i = 0; i < rows1.length; i++) for (let j = 0; j < c1.length; j++) if (!sameCell(rows1[i][j], rows2[i][j])) {
    const asSet = rows1.every(r => rows2.some(e => r.every((v, k) => sameCell(v, e[k]))));
    return fail(`<b>${asSet ? 'Right rows, wrong order' : 'Row ' + (i + 1) + ' differs'}${asSet ? '' : ' in column ' + (j + 1) + ' (' + c2[j] + ')'}.</b> Yours: <span class="mono">${esc(rows1[i].join(' | '))}</span><br>Expected: <span class="mono">${esc(rows2[i].join(' | '))}</span>${asSet ? '<br>The sort is part of the answer: right rows in the wrong order earn half the points.' : ''}`);
  }
  return { ok: true, html: `<b>Match.</b> ${rows1.length.toLocaleString()} row${rows1.length === 1 ? '' : 's'}, ${c1.length} column${c1.length === 1 ? '' : 's'}, same values in the same order.` };
}
function PLAY(main) {
  main.innerHTML = `<div class="col"><header><p class="eyebrow">A real PostgreSQL, in this tab</p><h1>Playground</h1></header>
    <p class="lede">The northgate lab database, running in your browser. Orders and order lines are a 1-in-10 sample (every order_id divisible by 10), customers are the ones on those orders, and exchange rates are USD-from only. Everything else is whole. Counts are about a tenth of the lab key; the logic is identical.</p>
    <div class="row"><span class="note" id="p-status">Not loaded.</span><button class="btn" id="p-load">Load the database</button></div>
    <div class="row"><select id="p-ex" style="max-width:100%"><option value="">Load an example query…</option>${EXAMPLES().map(([t, s], i) => `<option value="${i}">${esc(t)}</option>`).join('')}</select></div>
    <textarea id="p-sql" style="min-height:160px;font-family:var(--mono);font-size:13.5px" spellcheck="false" placeholder="SELECT * FROM stores LIMIT 20;">SELECT   country_name, COUNT(*) AS stores
FROM     stores
GROUP BY country_name
ORDER BY stores DESC, country_name;</textarea>
    <div class="row"><button class="btn" id="p-run" disabled>Run (⌘/Ctrl + Enter)</button><span class="note" id="p-meta"></span></div>
    <div id="p-out"></div>
    ${SCHEMA.north}
    <p class="note">The database persists in this browser, so the load happens once. If a query hangs, reload the page. Nothing you run here changes the files on disk.</p></div>`;
  const status = m => { $('#p-status', main).textContent = m; };
  const ex = EXAMPLES();
  $('#p-ex', main).onchange = e => { if (e.target.value !== '') $('#p-sql', main).value = ex[+e.target.value][1]; };
  const run = async () => {
    if (!PG) return; const sql = $('#p-sql', main).value.trim(); if (!sql) return;
    const out = $('#p-out', main), meta = $('#p-meta', main); meta.textContent = 'Running…'; out.innerHTML = '';
    const t0 = performance.now();
    try {
      const res = await PG.query(sql);
      const ms = Math.round(performance.now() - t0);
      const cols = res.fields.map(f => f.name), rows = res.rows.slice(0, 500).map(r => cols.map(c => r[c] === null ? null : r[c] instanceof Date ? r[c].toISOString().slice(0, 10) : String(r[c])));
      meta.textContent = `${res.rows.length.toLocaleString()} row${res.rows.length === 1 ? '' : 's'} in ${ms} ms${res.rows.length > 500 ? ', first 500 shown' : ''}`;
      out.innerHTML = rows.length ? tbl(cols, rows, '') : '<p class="note">No rows.</p>';
    } catch (err) { meta.textContent = ''; out.innerHTML = `<div class="verdict bad"><b>ERROR:</b> ${esc(err.message)}</div>`; }
  };
  $('#p-run', main).onclick = run;
  $('#p-sql', main).onkeydown = e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); } };
  const load = async () => { $('#p-load', main).disabled = true; try { await loadPG(status); $('#p-run', main).disabled = false; $('#p-load', main).hidden = true; } catch (err) { status('Could not load: ' + err.message + '. Serve the folder with python3 -m http.server and open it over http, not file://.'); $('#p-load', main).disabled = false; } };
  $('#p-load', main).onclick = load;
  if (PG) { status('Ready.'); $('#p-run', main).disabled = false; $('#p-load', main).hidden = true; }
}
