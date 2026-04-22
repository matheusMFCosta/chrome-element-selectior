(() => {
  if (window.__elementSelector) {
    window.__elementSelector.destroy();
    return;
  }

  // ── Styles ───────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #__es-badge {
      position: fixed; top: 12px; right: 12px; z-index: 2147483647;
      background: #1f6feb; color: #fff;
      font: 600 11px/1 "SF Mono", monospace;
      padding: 6px 12px; border-radius: 20px;
      cursor: pointer; user-select: none;
      box-shadow: 0 2px 8px #0008;
      transition: background .15s;
    }
    #__es-badge:hover { background: #388bfd; }
    #__es-badge.off { background: #21262d; color: #8b949e; }
    #__es-badge.picking { background: #238636; animation: es-pulse 1.2s infinite; }
    @keyframes es-pulse {
      0%, 100% { box-shadow: 0 0 0 0 #23863680; }
      50%       { box-shadow: 0 0 0 6px #23863600; }
    }

    #__es-hover {
      position: fixed; pointer-events: none; z-index: 2147483645;
      outline: 2px solid #1f6feb; background: #1f6feb18;
      border-radius: 3px; display: none;
      transition: top .05s, left .05s, width .05s, height .05s;
    }

    .es-sel-highlight {
      position: fixed; pointer-events: none; z-index: 2147483644;
      outline: 2px solid #ffa657; background: #ffa65715;
      border-radius: 3px;
    }
    .es-sel-label {
      position: fixed; pointer-events: none; z-index: 2147483644;
      background: #ffa657; color: #0d1117;
      font: 700 9px/1 "SF Mono", monospace;
      padding: 2px 5px; border-radius: 3px 3px 3px 0;
    }

    #__es-tooltip {
      position: fixed; z-index: 2147483647;
      background: #161b22; color: #e2e8f0;
      font: 12px/1.5 "SF Mono", monospace;
      padding: 8px 12px; border-radius: 8px;
      border: 1px solid #30363d; box-shadow: 0 4px 16px #0008;
      pointer-events: none; max-width: 340px;
      white-space: nowrap; display: none;
    }
    #__es-tooltip .t-comp { color: #58a6ff; font-weight: 700; font-size: 13px; }
    #__es-tooltip .t-file { color: #3fb950; font-size: 10px; margin-top: 3px; }
    #__es-tooltip .t-hint { color: #484f58; font-size: 10px; margin-top: 4px; }

    #__es-panel {
      position: fixed; bottom: 16px; right: 16px; z-index: 2147483647;
      background: #161b22; border: 1px solid #30363d;
      border-radius: 12px; box-shadow: 0 8px 32px #000a;
      font: 12px/1.6 "SF Mono", monospace;
      width: 320px; display: none; flex-direction: column;
      max-height: 80vh;
    }
    #__es-panel.show { display: flex; }

    .p-header {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; border-bottom: 1px solid #21262d; flex-shrink: 0;
    }
    .p-title { color: #f0f6fc; font-size: 12px; font-weight: 700; flex: 1; }
    .p-count {
      font-size: 10px; color: #484f58;
      background: #21262d; padding: 2px 7px; border-radius: 10px;
    }
    .p-close {
      background: none; border: none; color: #484f58;
      font-size: 14px; cursor: pointer; padding: 0;
    }
    .p-close:hover { color: #8b949e; }

    #__es-list { overflow-y: auto; flex: 1; padding: 6px 0; }
    #__es-list::-webkit-scrollbar { width: 4px; }
    #__es-list::-webkit-scrollbar-thumb { background: #30363d; border-radius: 2px; }

    .es-item { padding: 10px 16px; border-bottom: 1px solid #21262d; }
    .es-item:last-child { border-bottom: none; }

    .es-item-header {
      display: flex; align-items: flex-start;
      justify-content: space-between; gap: 8px; margin-bottom: 4px;
    }
    .es-item-num { color: #484f58; font-size: 10px; margin-top: 2px; flex-shrink: 0; }
    .es-item-name { color: #58a6ff; font-size: 12px; font-weight: 700; flex: 1; word-break: break-all; }
    .es-item-name.dom { color: #ffa657; }
    .es-item-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .es-btn {
      background: #21262d; border: 1px solid #30363d;
      border-radius: 5px; color: #8b949e;
      font: 600 10px "SF Mono", monospace;
      cursor: pointer; padding: 2px 7px;
      transition: background .15s, color .15s;
    }
    .es-btn:hover { background: #2d333b; color: #e2e8f0; }
    .es-btn.danger:hover { background: #3d0f0f; color: #f85149; border-color: #f8514940; }

    .es-item-file { font-size: 10px; color: #3fb950; margin-bottom: 4px; word-break: break-all; }
    .es-item-dom  { font-size: 10px; color: #8b949e; margin-bottom: 6px; }

    .es-note {
      width: 100%; padding: 6px 8px;
      background: #0d1117; border: 1px solid #21262d;
      border-radius: 5px; color: #e2e8f0;
      font: 11px/1.5 "SF Mono", monospace;
      resize: none; min-height: 44px; outline: none;
      transition: border-color .15s; box-sizing: border-box;
    }
    .es-note:focus { border-color: #1f6feb; }
    .es-note::placeholder { color: #3d444d; }

    #__es-empty {
      padding: 32px 20px; text-align: center;
      color: #484f58; font-size: 11px; line-height: 2;
    }

    .p-footer {
      display: flex; gap: 6px; padding: 12px 16px;
      border-top: 1px solid #21262d; flex-shrink: 0;
    }
    .p-btn {
      flex: 1; padding: 7px 0;
      border: none; border-radius: 7px;
      font: 600 10px "SF Mono", monospace;
      cursor: pointer; transition: background .15s, opacity .15s;
    }
    .p-btn.add   { background: #238636; color: #fff; }
    .p-btn.add:hover  { background: #2ea043; }
    .p-btn.add.picking { background: #21262d; color: #8b949e; border: 1px solid #30363d; cursor: default; }
    .p-btn.clear { background: #21262d; color: #8b949e; border: 1px solid #30363d; }
    .p-btn.clear:hover { background: #2d333b; color: #f85149; }
    .p-btn.copy  { background: #1f6feb; color: #fff; }
    .p-btn.copy:hover { background: #388bfd; }
    .p-btn.copy.ok { background: #238636; }
    .p-btn:disabled { opacity: 0.35; cursor: default; pointer-events: none; }
  `;
  document.head.appendChild(style);

  // ── Fixed DOM elements ────────────────────────────────────────────────────
  const badge   = Object.assign(document.createElement('div'), { id: '__es-badge', textContent: '⬡ Picking…' });
  const hover   = Object.assign(document.createElement('div'), { id: '__es-hover' });
  const tooltip = Object.assign(document.createElement('div'), { id: '__es-tooltip' });
  const panel   = document.createElement('div');
  panel.id = '__es-panel';
  panel.innerHTML = `
    <div class="p-header">
      <span class="p-title">Element Inspector</span>
      <span class="p-count" id="__es-count">0 selected</span>
      <button class="p-close" id="__es-close">✕</button>
    </div>
    <div id="__es-list">
      <div id="__es-empty">Click <b>Add Element</b> then click<br>anything on the page to select it</div>
    </div>
    <div class="p-footer">
      <button class="p-btn add"   id="__es-add">+ Add Element</button>
      <button class="p-btn clear" id="__es-clear">Clear</button>
      <button class="p-btn copy"  id="__es-copy" disabled>Copy All</button>
    </div>
  `;
  [badge, hover, tooltip, panel].forEach(el => document.body.appendChild(el));

  // ── State ─────────────────────────────────────────────────────────────────
  let picking = false; // true = hover mode active, waiting for a click
  // selections[i] = { el, stack, hasReact, tag, elId, classes, attrs, cssPath, html, note, hDiv, lDiv }
  let selections = [];

  // ── Fiber & DOM utils ─────────────────────────────────────────────────────
  function getFiber(el) {
    const k = Object.keys(el).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
    return k ? el[k] : null;
  }

  function getStack(el) {
    let f = null, node = el;
    while (node && !f) { f = getFiber(node); node = node.parentElement; }
    if (!f) return [];
    const out = [], seen = new WeakSet();
    let n = f;
    while (n) {
      const name = n.type?.displayName || n.type?.name || n.type?.render?.displayName || n.type?.render?.name;
      if (name && /^[A-Z]/.test(name) && !seen.has(n)) {
        seen.add(n);
        const s = n._debugSource;
        out.push({ name, file: s ? `${s.fileName.replace(/.*\/src\//, 'src/')}:${s.lineNumber}` : null, fiber: n });
      }
      n = n.return;
    }
    return out;
  }

  function domFromFiber(fiber) {
    let n = fiber;
    while (n) { if (n.stateNode instanceof Element) return n.stateNode; n = n.child; }
    return null;
  }

  function cssSelector(el) {
    const parts = [];
    let n = el;
    while (n && n.tagName && n !== document.body) {
      let s = n.tagName.toLowerCase();
      if (n.id) { parts.unshift(s + `#${n.id}`); break; }
      const c = [...n.classList].filter(Boolean).slice(0, 2);
      if (c.length) s += `.${c.join('.')}`;
      parts.unshift(s);
      n = n.parentElement;
      if (parts.length >= 5) { parts.unshift('…'); break; }
    }
    return parts.join(' > ');
  }

  function domAttrs(el) {
    const skip = new Set(['class','id','style']);
    const out = [];
    for (const { name, value } of el.attributes) {
      if (skip.has(name)) continue;
      out.push(`${name}="${value.length > 50 ? value.slice(0,50)+'…' : value}"`);
      if (out.length >= 4) break;
    }
    return out;
  }

  function truncHtml(el, max = 300) {
    if (!el) return null;
    const c = el.cloneNode(true);
    c.querySelectorAll('script,style,svg').forEach(n => n.remove());
    const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = w.nextNode())) if (t.textContent.trim().length > 40) t.textContent = t.textContent.trim().slice(0,40)+'…';
    const h = c.outerHTML;
    return h.length > max ? h.slice(0, max) + '\n…' : h;
  }

  function buildCtx(el) {
    const stack = getStack(el);
    const hasReact = stack.length > 0;
    const domEl = hasReact ? (domFromFiber(stack[0].fiber) ?? el) : el;
    return {
      el, stack, hasReact,
      tag: domEl?.tagName.toLowerCase(),
      elId: domEl?.id || null,
      classes: domEl ? [...domEl.classList].filter(Boolean) : [],
      attrs: domEl ? domAttrs(domEl) : [],
      cssPath: domEl ? cssSelector(domEl) : null,
      html: truncHtml(domEl),
      note: '',
      hDiv: null, lDiv: null,
    };
  }

  function buildSnippet(ctx) {
    let s = '';
    if (ctx.hasReact) {
      const [top, parent] = ctx.stack;
      s += `[Component: <${top.name}>]\n`;
      if (top.file) s += `File: ${top.file}\n`;
      if (parent)   s += `Parent: <${parent.name}>\n`;
    } else {
      s += `[DOM Element]\n`;
    }
    s += `Route: ${window.location.pathname}\n`;
    s += `URL: ${window.location.href}\n`;
    if (ctx.tag) {
      let d = `DOM: <${ctx.tag}`;
      if (ctx.elId) d += ` id="${ctx.elId}"`;
      if (ctx.classes.length) d += ` class="${ctx.classes.join(' ')}"`;
      if (ctx.attrs.length) d += ` ${ctx.attrs.join(' ')}`;
      s += d + '>\n';
    }
    if (ctx.cssPath) s += `Selector: ${ctx.cssPath}\n`;
    if (ctx.html) s += `\nHTML:\n${ctx.html}`;
    if (ctx.note?.trim()) s = `Note: ${ctx.note.trim()}\n\n` + s;
    return s;
  }

  // ── Persistent highlights ─────────────────────────────────────────────────
  function positionDiv(div, el, label) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    div.style.top = r.top + 'px'; div.style.left = r.left + 'px';
    div.style.width = r.width + 'px'; div.style.height = r.height + 'px';
    div.style.display = r.width > 0 ? 'block' : 'none';
    if (label) {
      label.style.top = (r.top - 14) + 'px';
      label.style.left = r.left + 'px';
      label.style.display = div.style.display;
    }
  }

  function addHighlight(ctx, idx) {
    const hDiv = document.createElement('div');
    hDiv.className = 'es-sel-highlight';
    const lDiv = document.createElement('div');
    lDiv.className = 'es-sel-label';
    lDiv.textContent = `${idx + 1}`;
    document.body.appendChild(hDiv);
    document.body.appendChild(lDiv);
    ctx.hDiv = hDiv; ctx.lDiv = lDiv;
    positionDiv(hDiv, ctx.el, lDiv);
  }

  function removeHighlight(ctx) {
    ctx.hDiv?.remove(); ctx.lDiv?.remove();
    ctx.hDiv = null; ctx.lDiv = null;
  }

  function refreshHighlights() {
    selections.forEach((ctx, i) => {
      if (ctx.hDiv) positionDiv(ctx.hDiv, ctx.el, ctx.lDiv);
      if (ctx.lDiv) ctx.lDiv.textContent = `${i + 1}`;
    });
  }

  window.addEventListener('scroll', refreshHighlights, true);
  window.addEventListener('resize', refreshHighlights);

  // ── Picking mode ──────────────────────────────────────────────────────────
  function setPicking(val) {
    picking = val;
    badge.textContent = val ? '⬡ Picking…' : '⬡ Element Selector';
    badge.className = val ? 'picking' : 'off';
    const addBtn = document.getElementById('__es-add');
    if (addBtn) {
      addBtn.textContent = val ? '● Picking…' : '+ Add Element';
      addBtn.classList.toggle('picking', val);
    }
    if (!val) { hover.style.display = 'none'; tooltip.style.display = 'none'; }
  }

  // ── Render panel ──────────────────────────────────────────────────────────
  function renderPanel() {
    const list     = document.getElementById('__es-list');
    const countEl  = document.getElementById('__es-count');
    const copyBtn  = document.getElementById('__es-copy');

    countEl.textContent = `${selections.length} selected`;
    copyBtn.disabled = selections.length === 0;
    panel.classList.add('show');

    if (selections.length === 0) {
      list.innerHTML = `<div id="__es-empty">Click <b>+ Add Element</b> then click<br>anything on the page to select it</div>`;
      return;
    }

    list.innerHTML = '';
    selections.forEach((ctx, idx) => {
      const top  = ctx.hasReact ? ctx.stack[0] : null;
      const name = top ? `&lt;${top.name}&gt;` : `&lt;${ctx.tag}&gt;`;
      const item = document.createElement('div');
      item.className = 'es-item';
      item.innerHTML = `
        <div class="es-item-header">
          <span class="es-item-num">${idx + 1}.</span>
          <div class="es-item-name ${top ? '' : 'dom'}">${name}</div>
          <div class="es-item-actions">
            <button class="es-btn" data-parent="${idx}">↑ Parent</button>
            <button class="es-btn danger" data-remove="${idx}">✕</button>
          </div>
        </div>
        ${top?.file ? `<div class="es-item-file">${top.file}</div>` : ''}
        ${ctx.tag ? `<div class="es-item-dom">&lt;${ctx.tag}${ctx.elId ? ` #${ctx.elId}` : ''}${ctx.classes.length ? ` .${ctx.classes.slice(0,2).join('.')}` : ''}&gt;</div>` : ''}
        <textarea class="es-note" data-note="${idx}" placeholder="Add a note…" rows="2">${ctx.note}</textarea>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll('[data-remove]').forEach(btn => {
      btn.onclick = () => {
        const i = +btn.dataset.remove;
        removeHighlight(selections[i]);
        selections.splice(i, 1);
        refreshHighlights();
        renderPanel();
      };
    });

    list.querySelectorAll('[data-parent]').forEach(btn => {
      btn.onclick = () => {
        const i = +btn.dataset.parent;
        const parent = selections[i].el?.parentElement;
        if (!parent || parent === document.body || parent === document.documentElement) return;
        const note = selections[i].note;
        removeHighlight(selections[i]);
        selections[i] = buildCtx(parent);
        selections[i].note = note;
        addHighlight(selections[i], i);
        renderPanel();
      };
    });

    list.querySelectorAll('[data-note]').forEach(ta => {
      ta.oninput = () => { selections[+ta.dataset.note].note = ta.value; };
    });
  }

  // ── Panel events ──────────────────────────────────────────────────────────
  document.getElementById('__es-close').onclick = () => panel.classList.remove('show');

  document.getElementById('__es-add').onclick = () => {
    if (picking) { setPicking(false); return; }
    setPicking(true);
    panel.classList.add('show');
  };

  document.getElementById('__es-clear').onclick = () => {
    selections.forEach(removeHighlight);
    selections = [];
    setPicking(false);
    renderPanel();
  };

  document.getElementById('__es-copy').onclick = () => {
    const parts = selections.map((ctx, i) => {
      const name = ctx.hasReact ? `<${ctx.stack[0].name}>` : `<${ctx.tag}>`;
      return `${'─'.repeat(40)}\nSelection ${i+1}: ${name}\n${'─'.repeat(40)}\n${buildSnippet(ctx)}`;
    });
    navigator.clipboard.writeText(parts.join('\n\n')).then(() => {
      const btn = document.getElementById('__es-copy');
      btn.textContent = '✓ Copied!';
      btn.classList.add('ok');
      setTimeout(() => { btn.textContent = 'Copy All'; btn.classList.remove('ok'); }, 2000);
    });
  };

  // Badge click → toggle picking
  badge.onclick = () => setPicking(!picking);

  // ── Hover ─────────────────────────────────────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    if (!picking) return;
    if (panel.contains(e.target) || e.target === badge) {
      tooltip.style.display = 'none'; hover.style.display = 'none'; return;
    }
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === badge || panel.contains(el)) {
      tooltip.style.display = 'none'; hover.style.display = 'none'; return;
    }
    const r = el.getBoundingClientRect();
    hover.style.cssText = `
      position:fixed; pointer-events:none; z-index:2147483645;
      outline:2px solid #1f6feb; background:#1f6feb18; border-radius:3px;
      transition:top .05s,left .05s,width .05s,height .05s; display:block;
      top:${r.top}px; left:${r.left}px; width:${r.width}px; height:${r.height}px;
    `;
    const stack = getStack(el);
    const top = stack[0];
    if (top) {
      tooltip.innerHTML = `
        <div class="t-comp">&lt;${top.name}&gt;</div>
        ${top.file ? `<div class="t-file">${top.file}</div>` : ''}
        ${stack[1] ? `<div class="t-hint">in &lt;${stack[1].name}&gt;</div>` : ''}
        <div class="t-hint" style="margin-top:6px">click to select</div>`;
    } else {
      const id = el.id ? `#${el.id}` : '';
      const cls = [...el.classList].slice(0,2).map(c => `.${c}`).join('');
      tooltip.innerHTML = `
        <div class="t-comp">&lt;${el.tagName.toLowerCase()}${id}${cls}&gt;</div>
        <div class="t-hint">DOM element — click to select</div>`;
    }
    const tx = Math.min(e.clientX + 14, window.innerWidth - 360);
    tooltip.style.cssText += `left:${tx}px; top:${Math.max(e.clientY-10,4)}px; display:block;`;
  }, true);

  // ── Click → add selection ─────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    if (!picking) return;
    if (e.target === badge || panel.contains(e.target)) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === badge || panel.contains(el)) return;

    e.preventDefault();
    e.stopPropagation();

    const ctx = buildCtx(el);
    selections.push(ctx);
    addHighlight(ctx, selections.length - 1);

    setPicking(false); // stop picking after each selection
    tooltip.style.display = 'none';
    hover.style.display = 'none';
    renderPanel();
  }, true);

  // ── Init ──────────────────────────────────────────────────────────────────
  // Start by opening the panel and activating picking immediately
  renderPanel();
  setPicking(true);
  panel.classList.add('show');

  // ── Cleanup ───────────────────────────────────────────────────────────────
  window.__elementSelector = {
    destroy() {
      selections.forEach(removeHighlight);
      window.removeEventListener('scroll', refreshHighlights, true);
      window.removeEventListener('resize', refreshHighlights);
      [style, badge, hover, tooltip, panel].forEach(el => el.remove());
      delete window.__elementSelector;
    }
  };

  console.log('%c Element Selector active ', 'background:#238636;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold');
})();
