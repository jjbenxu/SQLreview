/* Routing, unit pages, question engine, flashcards, walkthroughs, join reasoning, bug hunt, mock exam, playground. */
const store = {
  d: (() => { try { return JSON.parse(localStorage.getItem('sqlreview') || '{}'); } catch { return {}; } })(),
  get(k, f) { return this.d[k] ?? f; },
  set(k, v) { this.d[k] = v; try { localStorage.setItem('sqlreview', JSON.stringify(this.d)); } catch {} },
};
const done = () => store.get('q', {});
const mark = (key, ok) => { const q = done(); q[key] = ok ? 1 : 0; store.set('q', q); nav(); };
const unitScore = u => { const q = done(); return u.quiz.filter((_, i) => q[`${u.id}-${i}`] === 1).length; };
const EXTRA = [['walk', 'Query walkthroughs', 'W'], ['reason', 'Join reasoning', 'J'], ['bugs', 'Bug hunt', 'B'], ['interview', 'Interview corner', 'I'], ['order', 'Order of execution', 'O'], ['cheat', 'Function sheet', 'ƒ'], ['glossary', 'Glossary', 'A'], ['mock', 'Mock exam', 'M'], ['play', 'Playground', '▶']];
const KIND = { mc: 'Multiple choice', fill: 'Fill in the blank', short: 'Short answer', num: 'Calculate' };
const PILL = { INNER: 'inner', LEFT: 'left', ANTI: 'anti', NONE: 'none', MIXED: 'left' };

function route() {
  const [page, tab] = location.hash.replace('#', '').split('.');
  return { page: page || 'home', tab: tab || 'notes' };
}
function nav() {
  const { page } = route(), pq = done();
  const wDone = WALK.filter(w => pq['walk-' + w.key] === 1).length, jDone = JOINQ.filter((_, i) => pq['join-' + i] === 1).length, bDone = BUGS.filter((_, i) => pq['bug-' + i] === 1).length;
  const prog = { walk: `${wDone}/${WALK.length}`, reason: `${jDone}/${JOINQ.length}`, bugs: `${bDone}/${BUGS.length}` };
  const full = { walk: wDone === WALK.length, reason: jDone === JOINQ.length, bugs: bDone === BUGS.length };
  $('#nav').innerHTML = `<a href="#home" ${page === 'home' ? 'aria-current="page"' : ''}><span class="num">00</span><span>Overview</span><span></span></a>` +
    UNITS.map((u, i) => { const s = unitScore(u); return `<a href="#${u.id}" ${page === u.id ? 'aria-current="page"' : ''}><span class="num">0${i + 1}</span><span>${u.title}</span><span class="prog ${s === u.quiz.length ? 'done' : ''}">${s}/${u.quiz.length}</span></a>`; }).join('') +
    '<div class="sep"></div>' +
    EXTRA.map(([id, t, g]) => `<a href="#${id}" ${page === id ? 'aria-current="page"' : ''}><span class="num">${g}</span><span>${t}</span><span class="prog ${full[id] ? 'done' : ''}">${prog[id] || ''}</span></a>`).join('');
}

/* ---------- Question engine ---------- */
function question(q, key, label) {
  const el = document.createElement('article'); el.className = 'q';
  const prev = done()[key];
  el.innerHTML = `<div class="q-head"><span class="q-n">${label}</span><span class="q-t">${q.q}</span><span class="q-kind">${KIND[q.t]}${prev === 1 ? ' · ✓' : ''}</span></div>` +
    (q.ctx ? `<div class="ctx">${q.ctx}</div>` : '') + '<div class="body"></div><div class="why" hidden></div>';
  const body = $('.body', el), why = $('.why', el);
  const reveal = (ok, lead) => { why.hidden = false; why.innerHTML = `<b class="${ok ? 'r' : 'w'}">${lead}</b> ${q.why}`; if (ok !== null) mark(key, ok); el.dispatchEvent(new CustomEvent('answered', { bubbles: true, detail: { ok } })); };
  if (q.t === 'mc') {
    body.className = 'opts';
    body.innerHTML = q.o.map((o, i) => `<button class="opt" data-i="${i}">${String.fromCharCode(97 + i)}. ${o}</button>`).join('');
    body.onclick = e => {
      const b = e.target.closest('.opt'); if (!b || b.disabled) return;
      const i = +b.dataset.i, ok = i === q.a;
      $$('.opt', body).forEach((o, k) => { o.disabled = true; if (k === q.a) o.classList.add('good'); else if (k === i) o.classList.add('bad'); });
      reveal(ok, ok ? 'Correct.' : 'Not quite.');
    };
  } else if (q.t === 'fill' || q.t === 'num') {
    body.className = 'row';
    body.innerHTML = `<input type="text" id="in-${key}" placeholder="${q.t === 'num' ? 'Your number' : 'Your answer'}" aria-label="Answer" style="flex:0 1 260px"><button class="btn">Check</button><button class="btn alt">Show answer</button>`;
    const inp = $('input', body), [chk, show] = $$('button', body);
    const ans = q.t === 'num' ? String(q.a) : q.accept[0];
    const check = () => {
      const v = inp.value.trim().toLowerCase().replace(/\s+/g, ' '); if (!v) return;
      const ok = q.t === 'num' ? Math.abs(parseFloat(v.replace(/[%,$]/g, '')) - q.a) <= (q.tol || 0) + 1e-9 : q.accept.some(a => v.includes(a.toLowerCase()));
      reveal(ok, ok ? 'Correct.' : `Not quite. Answer: ${esc(ans)}.`);
    };
    chk.onclick = check; inp.onkeydown = e => { if (e.key === 'Enter') check(); };
    show.onclick = () => reveal(null, `Answer: ${esc(ans)}.`);
  } else {
    body.innerHTML = `<textarea id="in-${key}" placeholder="Write your answer the way you would on the exam, then compare." aria-label="Your answer"></textarea><div class="row" style="margin-top:8px"><button class="btn">Show model answer</button><span class="grade row" hidden><span class="note">How did you do?</span><button class="btn alt" data-ok="1">Got it</button><button class="btn alt" data-ok="0">Missed it</button></span></div>`;
    $('.btn', body).onclick = () => { why.hidden = false; why.innerHTML = `<b class="r">Model answer.</b> ${q.why}`; $('.grade', body).hidden = false; };
    $('.grade', body).onclick = e => { const b = e.target.closest('[data-ok]'); if (!b) return; const ok = b.dataset.ok === '1'; mark(key, ok); $('.grade', body).innerHTML = `<span class="note">${ok ? 'Marked as correct.' : 'Marked for review.'}</span>`; el.dispatchEvent(new CustomEvent('answered', { bubbles: true, detail: { ok } })); };
  }
  return el;
}

/* ---------- Pages ---------- */
function home(main) {
  const total = UNITS.reduce((s, u) => s + u.quiz.length, 0), got = UNITS.reduce((s, u) => s + unitScore(u), 0);
  main.innerHTML = `<div class="col">
    <header><p class="eyebrow">Database querying · PostgreSQL</p><h1>SQL midterm review</h1></header>
    <p class="lede">Four units, one per lecture deck. Each has notes, an interactive lab, flashcards and a quiz. You get a function sheet on the exam, so nothing here is about memorizing syntax: it is about knowing what each tool does and the logic that gets from a business question to the query.</p>
    <div class="stats"><div><span>Quiz questions correct</span><strong>${got} / ${total}</strong></div><div><span>Query walkthroughs</span><strong>${WALK.length}</strong></div><div><span>Join reasoning</span><strong>${JOINQ.length}</strong></div><div><span>Bug hunts</span><strong>${BUGS.length}</strong></div></div>
    <div class="grid">${UNITS.map((u, i) => `<a class="tile" href="#${u.id}"><span class="num">UNIT 0${i + 1}</span><strong>${u.title}</strong><span class="d">${u.lede}</span><div class="bar"><i style="width:${unitScore(u) / u.quiz.length * 100}%"></i></div></a>`).join('')}</div>
    <div class="sec"><h2>The logic, not the syntax</h2><div class="grid">
      <a class="tile" href="#walk"><span class="num">START HERE</span><strong>Query walkthroughs</strong><span class="d">Every practice question, lecture exercise and lab question. Reason it out step by step, then reveal the query clause by clause.</span></a>
      <a class="tile" href="#reason"><span class="num">BEFORE ANY SQL</span><strong>Join reasoning</strong><span class="d">Twenty questions: pick the tables and the join, then compare with the four-step reasoning.</span></a>
      <a class="tile" href="#bugs"><span class="num">INTERVIEW-STYLE</span><strong>Bug hunt</strong><span class="d">${BUGS.length} broken queries that run cleanly and return the wrong answer, or fail. Say what went wrong, then see the fix.</span></a>
      <a class="tile" href="#order"><span class="num">THE ONE TABLE</span><strong>Order of execution</strong><span class="d">Why an alias works in ORDER BY but not WHERE, why HAVING exists, and why WHERE cannot see a window.</span></a>
    </div></div>
    <div class="sec"><h2>When you are short on time</h2><div class="grid">
      <a class="tile" href="#interview"><span class="num">SAY IT ALOUD</span><strong>Interview corner</strong><span class="d">The 22 interview questions from the decks, each with a one-sentence answer.</span></a>
      <a class="tile" href="#mock"><span class="num">TEST YOURSELF</span><strong>Mock exam</strong><span class="d">Twenty questions drawn at random from all four units.</span></a>
      <a class="tile" href="#cheat"><span class="num">LOOK UP</span><strong>Function sheet</strong><span class="d">What each function and clause does, with the trap that goes with it.</span></a>
      <a class="tile" href="#play"><span class="num">RUN IT</span><strong>Playground</strong><span class="d">A real PostgreSQL in your browser, loaded with a sample of northgate. Type a query, see the rows.</span></a>
    </div></div>
    <p class="note">Built from Dr. R. Justin Martin's four lecture decks, the four practice sets with solutions, the join-reasoning set and the four Northgate labs. Progress is saved in this browser only.</p></div>`;
}

function unit(main, u, tab) {
  const i = UNITS.indexOf(u), tabs = [['notes', 'Notes'], ['lab', 'Lab'], ['cards', 'Flashcards'], ['quiz', `Quiz (${u.quiz.length})`]];
  main.innerHTML = `<div class="col">
    <header><p class="eyebrow">Unit 0${i + 1} · ${u.deck}</p><h1>${u.title}</h1></header>
    <p class="lede">${u.lede}</p>
    <div class="tabs" role="tablist">${tabs.map(([k, t]) => `<button role="tab" aria-selected="${k === tab}" data-tab="${k}">${t}</button>`).join('')}</div>
    <div id="pane"></div>
    <div class="pager">${i ? `<a href="#${UNITS[i - 1].id}">← ${UNITS[i - 1].title}</a>` : '<span></span>'}${i < UNITS.length - 1 ? `<a href="#${UNITS[i + 1].id}">${UNITS[i + 1].title} →</a>` : '<a href="#walk">Query walkthroughs →</a>'}</div></div>`;
  $('.tabs', main).onclick = e => { const b = e.target.closest('[data-tab]'); if (b) location.hash = `${u.id}.${b.dataset.tab}`; };
  const pane = $('#pane', main);
  if (tab === 'lab') { pane.className = 'panel'; LABS[u.id](pane); }
  else if (tab === 'cards') cards(pane, u);
  else if (tab === 'quiz') { pane.className = 'col'; pane.style.gap = '14px'; u.quiz.forEach((q, k) => pane.append(question(q, `${u.id}-${k}`, `Q${k + 1}`))); }
  else {
    pane.className = 'col';
    pane.innerHTML = u.secs.map(s => `<section class="sec"><h2>${s.h}</h2><div class="prose">${s.b}</div></section>`).join('') +
      `<section class="sec"><h2>Practice this unit</h2><div class="prose"><ul>
        <li><a href="#walk.${u.id}">Query walkthroughs for ${u.title}</a></li>
        <li><a href="#bugs.${u.id}">Bug hunts for ${u.title}</a></li>
        <li><a href="#interview.${u.id}">Interview questions for ${u.title}</a></li></ul></div>
      <div class="row"><button class="btn" data-go="lab">Open the lab</button><button class="btn alt" data-go="quiz">Take the quiz</button></div></section>`;
    $$('[data-go]', pane).forEach(b => b.onclick = () => location.hash = `${u.id}.${b.dataset.go}`);
  }
}

function cards(pane, u) {
  let order = u.cards.map((_, i) => i), i = 0, back = false;
  pane.className = 'col'; pane.style.gap = '12px';
  pane.innerHTML = `<div class="card"><button class="card-in" aria-live="polite"></button></div>
    <div class="row"><button class="btn alt" data-a="prev">← Previous</button><button class="btn" data-a="flip">Flip</button><button class="btn alt" data-a="next">Next →</button><button class="ghost" data-a="mix">Shuffle</button><span class="mono note" id="cd-n"></span></div>
    <p class="note">Click the card or press space to flip. Arrow keys move between cards.</p>`;
  const face = $('.card-in', pane);
  const draw = () => { const [f, b] = u.cards[order[i]]; face.classList.toggle('back', back); face.innerHTML = `<span><span class="side-l">${back ? 'Answer' : 'Prompt'}</span><span class="txt">${back ? b : f}</span></span>`; $('#cd-n', pane).textContent = `${i + 1} / ${order.length}`; };
  const act = a => { if (a === 'flip') back = !back; else { back = false; if (a === 'next') i = (i + 1) % order.length; if (a === 'prev') i = (i - 1 + order.length) % order.length; if (a === 'mix') { order.sort(() => Math.random() - 0.5); i = 0; } } draw(); };
  face.onclick = () => act('flip');
  pane.onclick = e => { const b = e.target.closest('[data-a]'); if (b) act(b.dataset.a); };
  pane.tabIndex = 0;
  pane.onkeydown = e => { if (e.key === 'ArrowRight') act('next'); else if (e.key === 'ArrowLeft') act('prev'); else if (e.key === ' ' && e.target !== face) { e.preventDefault(); act('flip'); } };
  draw();
}

/* ---------- Query walkthroughs ---------- */
const SETS = [['single', 'Single table'], ['joins', 'Joins'], ['shaping', 'Shaping data'], ['multi', 'Multi-step']];
const SRC = { practice: 'Practice set', lecture: 'Lecture exercise', lab: 'Lab' };
function walkCard(w) {
  const key = 'walk-' + w.key, el = document.createElement('article'); el.className = 'q';
  const prev = done()[key];
  el.innerHTML = `<div class="q-head"><span class="q-n">${w.label}</span><span class="q-t">${w.q}</span><span class="q-kind">${SRC[w.src]} · ${w.db}${prev === 1 ? ' · ✓' : ''}</span></div>
    <textarea placeholder="Say what one row of the answer is, which tables, which join, which clause each condition lives in. Then draft the query." aria-label="Your reasoning"></textarea>
    <div class="steps" hidden></div><div class="sqlbox" hidden></div>
    <div class="row"><button class="btn" data-a="step">Next step</button><button class="btn alt" data-a="all">Show everything</button><span class="grade row" hidden><span class="note">Did your query match?</span><button class="btn alt" data-ok="1">Got it</button><button class="btn alt" data-ok="0">Missed it</button></span></div>`;
  const steps = $('.steps', el), box = $('.sqlbox', el); let k = 0;
  const show = n => {
    steps.hidden = false;
    while (k < Math.min(n, w.steps.length)) { const s = w.steps[k]; const trap = /^(Trap|Watch)/.test(s); steps.insertAdjacentHTML('beforeend', `<div class="step ${trap ? 'trap' : ''}"><span class="k">${trap ? '⚠' : k + 1}</span><span>${s}</span></div>`); k++; }
    if (k >= w.steps.length && n > w.steps.length) { box.hidden = false; box.innerHTML = SQL(w.sql) + (w.note ? `<p class="note" style="margin-top:8px">${w.note}</p>` : ''); $('[data-a=step]', el).disabled = true; $('[data-a=all]', el).disabled = true; $('.grade', el).hidden = false; }
    else $('[data-a=step]', el).textContent = k >= w.steps.length ? 'Show the query' : 'Next step';
  };
  el.onclick = e => {
    const b = e.target.closest('[data-a],[data-ok]'); if (!b) return;
    if (b.dataset.a === 'step') show(k + 1); else if (b.dataset.a === 'all') show(99);
    else { const ok = b.dataset.ok === '1'; mark(key, ok); $('.grade', el).innerHTML = `<span class="note">${ok ? 'Marked as correct.' : 'Marked for review.'}</span>`; }
  };
  return el;
}
function walk(main, tab) {
  const set = SETS.find(s => s.includes(tab)) ? tab : store.get('wset', 'single');
  store.set('wset', set);
  const src = store.get('wsrc', 'all');
  main.innerHTML = `<div class="col"><header><p class="eyebrow">The logic behind every query</p><h1>Query walkthroughs</h1></header>
    <p class="lede">${WALK.length} questions: the practice sets (reelhouse), the lecture exercises (blue_line) and the labs (northgate). Write your reasoning, then reveal it one step at a time and compare the query. Lab answers are model answers written for this site, not the instructor's key.</p>
    <div class="filters"><div class="toggle" id="w-set">${SETS.map(([k, t]) => `<button aria-pressed="${k === set}" data-s="${k}">${t}</button>`).join('')}</div>
    <div class="toggle" id="w-src"><button aria-pressed="${src === 'all'}" data-r="all">All</button><button aria-pressed="${src === 'practice'}" data-r="practice">Practice set</button><button aria-pressed="${src === 'lecture'}" data-r="lecture">Lecture</button><button aria-pressed="${src === 'lab'}" data-r="lab">Lab</button></div></div>
    <div class="schema" id="w-schema"></div>
    <div class="col" id="wq" style="gap:14px"></div></div>`;
  $('#w-set', main).onclick = e => { const b = e.target.closest('[data-s]'); if (b) location.hash = 'walk.' + b.dataset.s; };
  $('#w-src', main).onclick = e => { const b = e.target.closest('[data-r]'); if (b) { store.set('wsrc', b.dataset.r); walk(main, set); } };
  const list = WALK.filter(w => w.set === set && (src === 'all' || w.src === src));
  $('#w-schema', main).innerHTML = SCHEMA[set] || '';
  list.forEach(w => $('#wq', main).append(walkCard(w)));
}

/* ---------- Join reasoning ---------- */
function joins(main) {
  main.innerHTML = `<div class="col"><header><p class="eyebrow">Choosing the tables and the join</p><h1>Join reasoning</h1></header>
    <p class="lede">Most join questions go wrong before the first line of SQL. For each question, decide which tables the answer walks through and which join connects them, then compare with the four-step reasoning. All twenty run on reelhouse.</p>
    ${SCHEMA.joins}
    <div class="col" id="jq" style="gap:14px"></div></div>`;
  JOINQ.forEach((j, i) => {
    const key = 'join-' + i, el = document.createElement('article'); el.className = 'q'; const prev = done()[key];
    const kinds = [['INNER', 'INNER JOIN'], ['LEFT', 'LEFT JOIN'], ['ANTI', 'Anti-join'], ['NONE', 'No join']];
    el.innerHTML = `<div class="q-head"><span class="q-n">Q${i + 1}</span><span class="q-t">${j.q}</span><span class="q-kind">${j.group}${prev === 1 ? ' · ✓' : ''}</span></div>
      <div class="ctl"><span>Tables, in the order you would walk through them</span><input type="text" placeholder="e.g. actor, film_actor, film" aria-label="Tables"></div>
      <div class="ctl"><span>Join</span><div class="chips">${kinds.map(([k, t]) => `<button class="chip" data-k="${k}">${t}</button>`).join('')}</div></div>
      <div class="why" hidden></div>`;
    $('.chips', el).onclick = e => {
      const b = e.target.closest('.chip'); if (!b || $('.why', el).hidden === false) return;
      const typed = $('input', el).value.toLowerCase().replace(/[^a-z_]+/g, ' ').trim().split(' ').filter(Boolean);
      const opt = j.optional || [];
      const tOk = j.tables.every(t => typed.includes(t)) && typed.every(t => j.tables.includes(t) || opt.includes(t));
      const jOk = j.join === b.dataset.k || (j.join === 'MIXED' && (b.dataset.k === 'ANTI' || b.dataset.k === 'INNER'));
      $$('.chip', el).forEach(c => { c.disabled = true; if (c.dataset.k === j.join || (j.join === 'MIXED' && c.dataset.k === 'ANTI')) c.classList.add('good'); else if (c === b) c.classList.add('bad'); });
      const ok = tOk && jOk; mark(key, ok);
      $('.why', el).hidden = false;
      $('.why', el).innerHTML = `<b class="${ok ? 'r' : 'w'}">${ok ? 'Correct.' : tOk ? 'Tables right, join wrong.' : jOk ? 'Join right, tables off.' : 'Not quite.'}</b> <b>Tables:</b> <span class="mono">${j.tables.join(' → ')}</span>. <b>Join:</b> <span class="pill ${PILL[j.join]}">${j.joinText}</span><ol style="margin:8px 0 0;padding-left:20px">${j.steps.map(s => `<li>${s}</li>`).join('')}</ol>${j.watch ? `<p class="trap" style="margin-top:8px"><b>Watch for</b>${j.watch}</p>` : ''}<p class="note" style="margin-top:6px">Check: ${j.check}</p>`;
    };
    $('#jq', main).append(el);
  });
}

/* ---------- Bug hunt ---------- */
function bugs(main, tab) {
  const set = SETS.find(s => s[0] === tab) ? tab : 'all';
  main.innerHTML = `<div class="col"><header><p class="eyebrow">Queries that run and lie, or fail</p><h1>Bug hunt</h1></header>
    <p class="lede">Each query below is one a colleague wrote. Most run without an error and return a believable table. Decide what went wrong before you look, then see the fix. These are the interview-style questions from every practice set and deck.</p>
    <div class="toggle" id="b-set"><button aria-pressed="${set === 'all'}" data-s="all">All</button>${SETS.map(([k, t]) => `<button aria-pressed="${k === set}" data-s="${k}">${t}</button>`).join('')}</div>
    <div class="col" id="bq" style="gap:14px"></div></div>`;
  $('#b-set', main).onclick = e => { const b = e.target.closest('[data-s]'); if (b) location.hash = 'bugs' + (b.dataset.s === 'all' ? '' : '.' + b.dataset.s); };
  BUGS.forEach((bg, i) => {
    if (set !== 'all' && bg.set !== set) return;
    const key = 'bug-' + i, el = document.createElement('article'); el.className = 'q'; const prev = done()[key];
    el.innerHTML = `<div class="q-head"><span class="q-n">B${i + 1}</span><span class="q-t">${bg.q}</span><span class="q-kind">${SETS.find(s => s[0] === bg.set)[1]}${prev === 1 ? ' · ✓' : ''}</span></div>
      ${SQL(bg.bad, 'bad')}<p class="note">${bg.symptom}</p>
      <div class="opts">${bg.o.map((o, k) => `<button class="opt" data-i="${k}">${String.fromCharCode(97 + k)}. ${o}</button>`).join('')}</div><div class="why" hidden></div>`;
    $('.opts', el).onclick = e => {
      const b = e.target.closest('.opt'); if (!b || b.disabled) return; const k = +b.dataset.i, ok = k === bg.a;
      $$('.opt', el).forEach((o, n) => { o.disabled = true; if (n === bg.a) o.classList.add('good'); else if (n === k) o.classList.add('bad'); });
      mark(key, ok); $('.why', el).hidden = false; $('.why', el).innerHTML = `<b class="${ok ? 'r' : 'w'}">${ok ? 'Correct.' : 'Not quite.'}</b> ${bg.why}<div style="margin-top:10px">${SQL(bg.fix)}</div>`;
    };
    $('#bq', main).append(el);
  });
}

/* ---------- Interview corner ---------- */
function interview(main, tab) {
  main.innerHTML = `<div class="col"><header><p class="eyebrow">Answer each in one sentence, then write the query</p><h1>Interview corner</h1></header>
    <p class="lede">The "possible interview questions" slide from each deck. Say the answer aloud before you open it. Every one of these was on a slide.</p>
    <div class="col" id="iq" style="gap:14px"></div></div>`;
  UNITS.forEach(u => {
    if (tab !== 'notes' && tab !== u.id) return;
    const h = document.createElement('h2'); h.textContent = u.title; $('#iq', main).append(h);
    INTERVIEW.filter(q => q.u === u.id).forEach((q, i) => {
      const el = document.createElement('article'); el.className = 'q';
      el.innerHTML = `<div class="q-head"><span class="q-n">${i + 1}</span><span class="q-t">${q.q}</span></div><div class="row"><button class="btn alt">Show answer</button></div><div class="why" hidden></div>`;
      $('.btn', el).onclick = () => { $('.why', el).hidden = false; $('.why', el).innerHTML = q.a + (q.sql ? `<div style="margin-top:8px">${SQL(q.sql)}</div>` : ''); $('.row', el).remove(); };
      $('#iq', main).append(el);
    });
  });
}

/* ---------- Order of execution ---------- */
function order(main) {
  main.innerHTML = `<div class="col"><header><p class="eyebrow">The one table that explains three errors</p><h1>Order of execution</h1></header>
    <p class="lede">You write the clauses in one order. The database runs them in another. Every "column does not exist" error in this course comes from asking a clause for something that has not been made yet.</p>
    <div class="panel" id="ox"></div>
    <section class="sec"><h2>What it explains</h2><div class="prose">
      <ul>
        <li><b>An alias works in ORDER BY but not in WHERE or HAVING.</b> Aliases are created at SELECT, step 5. WHERE (2) and HAVING (4) run before it. ORDER BY (6) runs after. Fix: repeat the expression.</li>
        <li><b>WHERE SUM(units) > 200 is an error.</b> When WHERE runs there are no sums yet; grouping has not happened. That is what HAVING is for.</li>
        <li><b>WHERE rn <= 3 beside the ROW_NUMBER that makes rn fails.</b> Window functions run after HAVING and before SELECT. WHERE cannot see them. Put the window in a CTE and filter in the query after.</li>
        <li><b>SUM(p.amount) OVER () in a grouped query fails.</b> Windows run after GROUP BY, when the rows are already one per group and p.amount is gone. Group in a CTE, then window over its rows.</li>
        <li><b>A WHERE before LAG removes the previous row.</b> Windows only see the rows that survive WHERE. Compute LAG over every row in a CTE, then filter outside.</li>
        <li><b>PostgreSQL lets you GROUP BY an alias.</b> A convenience: GROUP BY price_tier and GROUP BY month both work. HAVING still cannot use the alias.</li>
      </ul></div></section></div>`;
  LABS.order($('#ox', main));
}

/* ---------- Function sheet, glossary ---------- */
function cheat(main) {
  main.innerHTML = `<div class="col"><header><p class="eyebrow">You get a function sheet on the exam. This is what each line on it means.</p><h1>Function sheet</h1></header>
    <p class="lede">What each clause and function does, in one line, and the trap that goes with it. Use it to check that you can explain every entry, not to memorize it.</p>
    <div class="cheat">${CHEAT.map(([h, rows]) => `<section class="sec"><h3>${h}</h3><div class="tw"><table><tr><th>Syntax</th><th>What it does</th><th>Watch for</th></tr>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2] || ''}</td></tr>`).join('')}</table></div></section>`).join('')}</div></div>`;
}
function glossary(main) {
  main.innerHTML = `<div class="col"><header><p class="eyebrow">Every term in one list</p><h1>Glossary</h1></header>
    <p class="lede">${GLOSSARY.length} terms from the four decks and the practice sets. Type to filter; each term links to the unit that explains it.</p>
    <input type="text" id="gl-q" placeholder="Search terms and definitions" aria-label="Search the glossary" style="max-width:420px">
    <p class="note" id="gl-n"></p><div class="tw"><table id="gl-t"></table></div></div>`;
  const draw = () => {
    const q = $('#gl-q', main).value.trim().toLowerCase();
    const rows = GLOSSARY.filter(([t, d]) => !q || (t + ' ' + d).toLowerCase().includes(q));
    $('#gl-n', main).textContent = rows.length === GLOSSARY.length ? '' : `${rows.length} of ${GLOSSARY.length} terms`;
    $('#gl-t', main).innerHTML = rows.map(([t, d, u]) => `<tr><td><b>${t}</b></td><td>${d}</td><td><a href="#${u}">${UNITS.find(x => x.id === u).title}</a></td></tr>`).join('') || '<tr><td>No term matches that search.</td></tr>';
  };
  $('#gl-q', main).oninput = draw; draw();
}

/* ---------- Mock exam ---------- */
function mock(main) {
  const pool = UNITS.flatMap(u => u.quiz.map((q, i) => ({ q, key: `${u.id}-${i}`, u })));
  const pick = pool.sort(() => Math.random() - 0.5).slice(0, 20);
  let right = 0, seen = 0;
  main.innerHTML = `<div class="col"><header><p class="eyebrow">Mixed review</p><h1>Mock exam</h1></header>
    <p class="lede">Twenty questions drawn at random across all four units. Use New draw for a fresh set. For query-writing practice, use the walkthroughs instead.</p>
    <div class="row"><div class="stats" style="flex:1 1 260px"><div><span>Score</span><strong id="mk-s">0 / 0</strong></div><div><span>Remaining</span><strong id="mk-r">20</strong></div></div><button class="btn alt" id="mk-n">New draw</button></div>
    <div class="col" id="mq" style="gap:14px"></div><div class="verdict" id="mk-v" hidden></div></div>`;
  pick.forEach((p, i) => { const el = question(p.q, p.key, `${i + 1}`); const t = document.createElement('span'); t.className = 'note'; t.textContent = p.u.title; el.append(t); el.dataset.u = p.u.title; $('#mq', main).append(el); });
  const missed = {};
  $('#mq', main).addEventListener('answered', e => {
    if (e.detail.ok === null || e.target.dataset.done) return; e.target.dataset.done = 1;
    seen++; if (e.detail.ok) right++; else missed[e.target.dataset.u] = (missed[e.target.dataset.u] || 0) + 1;
    $('#mk-s', main).textContent = `${right} / ${seen}`; $('#mk-r', main).textContent = 20 - seen;
    if (seen === 20) { const v = $('#mk-v', main), m = Object.entries(missed).sort((a, b) => b[1] - a[1]); v.hidden = false; v.className = 'verdict ' + (right >= 16 ? 'good' : 'warn'); v.innerHTML = `<b>${right} of 20.</b> ` + (m.length ? `Most misses: ${m.map(([u, n]) => `${u} (${n})`).join(', ')}.` : 'A clean sweep.'); }
  });
  $('#mk-n', main).onclick = () => mock(main);
}

function render() {
  const { page, tab } = route(), main = $('#main'), u = UNITS.find(x => x.id === page);
  if (u) unit(main, u, ['notes', 'lab', 'cards', 'quiz'].includes(tab) ? tab : 'notes');
  else if (page === 'walk') walk(main, tab); else if (page === 'reason') joins(main); else if (page === 'bugs') bugs(main, tab); else if (page === 'interview') interview(main, tab);
  else if (page === 'order') order(main); else if (page === 'cheat') cheat(main); else if (page === 'glossary') glossary(main); else if (page === 'mock') mock(main); else if (page === 'play') PLAY(main);
  else home(main);
  nav(); document.title = (u ? u.title : page === 'home' ? 'Overview' : EXTRA.find(e => e[0] === page)?.[1] || 'Overview') + ' · SQL Midterm Review';
  window.scrollTo(0, 0);
}

/* ---------- Theme and reset ---------- */
const themes = ['auto', 'light', 'dark'];
function applyTheme() { const t = store.get('theme', 'auto'); if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t; $('#theme').textContent = 'Theme: ' + t; }
$('#theme').onclick = () => { store.set('theme', themes[(themes.indexOf(store.get('theme', 'auto')) + 1) % 3]); applyTheme(); render(); };
let armed = false;
$('#reset').onclick = e => { if (!armed) { armed = true; e.target.textContent = 'Click again to confirm'; setTimeout(() => { armed = false; e.target.textContent = 'Reset progress'; }, 3000); return; } armed = false; store.set('q', {}); e.target.textContent = 'Reset progress'; render(); };
window.addEventListener('hashchange', render);
applyTheme(); render();
