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

    #__es-highlight {
      position: fixed; pointer-events: none; z-index: 2147483646;
      border-radius: 3px; display: none;
      transition: top .06s, left .06s, width .06s, height .06s;
    }
    #__es-highlight.hover  { outline: 2px solid #1f6feb; background: #1f6feb18; }
    #__es-highlight.locked { outline: 2px solid #ffa657; background: #ffa65718; }

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

    #__es-panel .p-header {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #21262d;
      flex-shrink: 0;
    }
    #__es-panel .p-title { color: #f0f6fc; font-size: 12px; font-weight: 700; }
    #__es-panel .p-count {
      font-size: 10px; color: #484f58;
      background: #21262d; padding: 2px 7px;
      border-radius: 10px;
    }
    #__es-panel .p-close {
      background: none; border: none; color: #484f58;
      font-size: 14px; cursor: pointer; padding: 0;
    }
    #__es-panel .p-close:hover { color: #8b949e; }

    #__es-list {
      overflow-y: auto; flex: 1;
      padding: 8px 0;
    }
    #__es-list::-webkit-scrollbar { width: 4px; }
    #__es-list::-webkit-scrollbar-thumb { background: #30363d; border-radius: 2px; }

    .es-item {
      padding: 10px 16px;
      border-bottom: 1px solid #21262d;
    }
    .es-item:last-child { border-bottom: none; }

    .es-item-header {
      display: flex; align-items: flex-start;
      justify-content: space-between; gap: 8px;
      margin-bottom: 4px;
    }
    .es-item-name {
      color: #58a6ff; font-size: 12px; font-weight: 700;
      flex: 1; word-break: break-all;
    }
    .es-item-name.dom { color: #ffa657; }
    .es-item-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .es-item-btn {
      background: #21262d; border: 1px solid #30363d;
      border-radius: 5px; color: #8b949e;
      font: 600 10px "SF Mono", monospace;
      cursor: pointer; padding: 2px 7px;
      transition: background .15s, color .15s;
    }
    .es-item-btn:hover { background: #2d333b; color: #e2e8f0; }
    .es-item-btn.danger:hover { background: #3d0f0f; color: #f85149; border-color: #f8514940; }

    .es-item-file {
      font-size: 10px; color: #3fb950; margin-bottom: 6px;
      word-break: break-all;
    }
    .es-item-dom {
      font-size: 10px; color: #8b949e; margin-bottom: 6px;
    }

    .es-note {
      width: 100%; padding: 6px 8px;
      background: #0d1117; border: 1px solid #21262d;
      border-radius: 5px; color: #e2e8f0;
      font: 11px/1.5 "SF Mono", monospace;
      resize: none; min-height: 48px; outline: none;
      transition: border-color .15s; box-sizing: border-box;
    }
    .es-note:focus { border-color: #1f6feb; }
    .es-note::placeholder { color: #3d444d; }

    #__es-empty {
      padding: 40px 20px; text-align: center;
      color: #484f58; font-size: 11px; line-height: 1.8;
    }

    #__es-panel .p-footer {
      display: flex; gap: 8px; padding: 12px 16px;
      border-top: 1px solid #21262d; flex-shrink: 0;
    }
    .p-btn {
      flex: 1; padding: 8px 0;
      border: none; border-radius: 7px;
      font: 600 11px "SF Mono", monospace;
      cursor: pointer; transition: background .15s;
    }
    .p-btn.clear {
      background: #21262d; color: #8b949e;
      border: 1px solid #30363d;
    }
    .p-btn.clear:hover { background: #2d333b; color: #f85149; }
    .p-btn.copy  { background: #1f6feb; color: #fff; }
    .p-btn.copy:hover { background: #388bfd; }
    .p-btn.copy.ok { background: #238636; }
  `;
  document.head.appendChild(style);

  // ── DOM elements ──────────────────────────────────────────────────────────
  const badge = document.createElement('div');
  badge.id = '__es-badge';
  badge.textContent = '⬡ Element Selector';
  document.body.appendChild(badge);

  const highlight = document.createElement('div');
  highlight.id = '__es-highlight';
  document.body.appendChild(highlight);

  const tooltip = document.createElement('div');
  tooltip.id = '__es-tooltip';
  document.body.appendChild(tooltip);

  const panel = document.createElement('div');
  panel.id = '__es-panel';
  panel.innerHTML = `
    <div class="p-header">
      <span class="p-title">Element Inspector</span>
      <span class="p-count" id="__es-count">0 selected</span>
      <button class="p-close" id="__es-close">✕</button>
    </div>
    <div id="__es-list">
      <div id="__es-empty">Hover over any element and<br>click to add it to the selection</div>
    </div>
    <div class="p-footer">
      <button class="p-btn clear" id="__es-clear">Clear</button>
      <button class="p-btn copy"  id="__es-copy">Copy All</button>
    </div>
  `;
  document.body.appendChild(panel);

  // ── State ─────────────────────────────────────────────────────────────────
  let active = true;
  // selections: [{ el, stack, domEl, tag, elId, classes, cssPath, html }]
  let selections = [];

  // ── Fiber utils ───────────────────────────────────────────────────────────
  function getFiberFromEl(el) {
    const key = Object.keys(el).find(k =>
      k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
    );
    return key ? el[key] : null;
  }

  function getComponentStack(el) {
    let startFiber = null, domNode = el;
    while (domNode && !startFiber) {
      startFiber = getFiberFromEl(domNode);
      domNode = domNode.parentElement;
    }
    if (!startFiber) return [];
    const stack = [], seen = new WeakSet();
    let node = startFiber;
    while (node) {
      const name = node.type?.displayName || node.type?.name
        || node.type?.render?.displayName || node.type?.render?.name;
      if (name && typeof name === 'string' && /^[A-Z]/.test(name) && !seen.has(node)) {
        seen.add(node);
        const src = node._debugSource;
        stack.push({
          name,
          file: src ? `${src.fileName.replace(/.*\/src\//, 'src/')}:${src.lineNumber}` : null,
          fiber: node,
        });
      }
      node = node.return;
    }
    return stack;
  }

  function getDomEl(fiber) {
    let node = fiber;
    while (node) {
      if (node.stateNode instanceof Element) return node.stateNode;
      node = node.child;
    }
    return null;
  }

  function getCssSelector(el) {
    const parts = [];
    let node = el;
    while (node && node.tagName && node !== document.body) {
      let sel = node.tagName.toLowerCase();
      if (node.id) { sel += `#${node.id}`; parts.unshift(sel); break; }
      const cls = [...node.classList].filter(Boolean).slice(0, 2);
      if (cls.length) sel += `.${cls.join('.')}`;
      parts.unshift(sel);
      node = node.parentElement;
      if (parts.length >= 5) { parts.unshift('…'); break; }
    }
    return parts.join(' > ');
  }

  function getDomAttrs(el) {
    const skip = new Set(['class', 'id', 'style']);
    const attrs = [];
    for (const { name, value } of el.attributes) {
      if (skip.has(name)) continue;
      attrs.push(`${name}="${value.length > 50 ? value.slice(0, 50) + '…' : value}"`);
      if (attrs.length >= 4) break;
    }
    return attrs;
  }

  function truncateHtml(el, maxLen = 300) {
    if (!el) return null;
    const clone = el.cloneNode(true);
    clone.querySelectorAll('script,style,svg').forEach(n => n.remove());
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = walker.nextNode())) {
      if (t.textContent.trim().length > 40)
        t.textContent = t.textContent.trim().slice(0, 40) + '…';
    }
    const html = clone.outerHTML;
    return html.length > maxLen ? html.slice(0, maxLen) + '\n…' : html;
  }

  // Build context object from a DOM element
  function buildContext(el) {
    const stack = getComponentStack(el);
    const hasReact = stack.length > 0;
    const domEl = hasReact ? (getDomEl(stack[0].fiber) ?? el) : el;
    return {
      el,
      stack,
      hasReact,
      domEl,
      tag: domEl?.tagName.toLowerCase(),
      elId: domEl?.id || null,
      classes: domEl ? [...domEl.classList].filter(Boolean) : [],
      attrs: domEl ? getDomAttrs(domEl) : [],
      cssPath: domEl ? getCssSelector(domEl) : null,
      html: truncateHtml(domEl),
      note: '',
    };
  }

  function buildSnippet(ctx) {
    let s = '';
    if (ctx.hasReact) {
      const top = ctx.stack[0], parent = ctx.stack[1];
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

  // ── Render panel ──────────────────────────────────────────────────────────
  function renderPanel() {
    const list = document.getElementById('__es-list');
    const countEl = document.getElementById('__es-count');
    const copyBtn = document.getElementById('__es-copy');

    countEl.textContent = `${selections.length} selected`;
    panel.classList.add('show');

    if (selections.length === 0) {
      list.innerHTML = `<div id="__es-empty">Hover over any element and<br>click to add it to the selection</div>`;
      copyBtn.disabled = true;
      copyBtn.style.opacity = '0.4';
      return;
    }

    copyBtn.disabled = false;
    copyBtn.style.opacity = '1';
    list.innerHTML = '';

    selections.forEach((ctx, idx) => {
      const top = ctx.hasReact ? ctx.stack[0] : null;
      const displayName = top ? `&lt;${top.name}&gt;` : `&lt;${ctx.tag}&gt;`;

      const item = document.createElement('div');
      item.className = 'es-item';
      item.innerHTML = `
        <div class="es-item-header">
          <div class="es-item-name ${top ? '' : 'dom'}">${displayName}</div>
          <div class="es-item-actions">
            <button class="es-item-btn" data-parent="${idx}" title="Go to parent element">↑ Parent</button>
            <button class="es-item-btn danger" data-remove="${idx}" title="Remove">✕</button>
          </div>
        </div>
        ${top?.file ? `<div class="es-item-file">${top.file}</div>` : ''}
        ${ctx.tag ? `<div class="es-item-dom">&lt;${ctx.tag}${ctx.elId ? ` #${ctx.elId}` : ''}${ctx.classes.length ? ` .${ctx.classes.slice(0,2).join('.')}` : ''}&gt;</div>` : ''}
        <textarea class="es-note" data-note="${idx}" placeholder="Add a note…" rows="2">${ctx.note}</textarea>
      `;
      list.appendChild(item);
    });

    // Bind item buttons
    list.querySelectorAll('[data-remove]').forEach(btn => {
      btn.onclick = () => {
        selections.splice(+btn.dataset.remove, 1);
        renderPanel();
      };
    });

    list.querySelectorAll('[data-parent]').forEach(btn => {
      btn.onclick = () => {
        const i = +btn.dataset.parent;
        const parent = selections[i].el?.parentElement;
        if (!parent || parent === document.body || parent === document.documentElement) return;
        const note = selections[i].note;
        selections[i] = buildContext(parent);
        selections[i].note = note;
        renderPanel();
      };
    });

    list.querySelectorAll('[data-note]').forEach(ta => {
      ta.oninput = () => {
        selections[+ta.dataset.note].note = ta.value;
      };
    });
  }

  // ── Panel buttons ─────────────────────────────────────────────────────────
  document.getElementById('__es-close').onclick = () => panel.classList.remove('show');

  document.getElementById('__es-clear').onclick = () => {
    selections = [];
    highlight.style.display = 'none';
    renderPanel();
  };

  document.getElementById('__es-copy').onclick = () => {
    const parts = selections.map((ctx, i) => {
      const name = ctx.hasReact ? `<${ctx.stack[0].name}>` : `<${ctx.tag}>`;
      return `${'='.repeat(40)}\nSelection ${i + 1}: ${name}\n${'='.repeat(40)}\n${buildSnippet(ctx)}`;
    });
    const text = parts.join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('__es-copy');
      btn.textContent = '✓ Copied!';
      btn.classList.add('ok');
      setTimeout(() => {
        btn.textContent = 'Copy All';
        btn.classList.remove('ok');
      }, 2000);
    });
  };

  // ── Badge toggle ──────────────────────────────────────────────────────────
  badge.onclick = () => {
    active = !active;
    badge.textContent = active ? '⬡ Element Selector' : '⬡ Selector OFF';
    badge.classList.toggle('off', !active);
    if (!active) { tooltip.style.display = 'none'; highlight.style.display = 'none'; }
  };

  // ── Mousemove → hover ─────────────────────────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    if (!active) return;
    if (panel.contains(e.target) || e.target === badge) {
      tooltip.style.display = 'none';
      highlight.style.display = 'none';
      return;
    }
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === badge || panel.contains(el)) {
      tooltip.style.display = 'none';
      highlight.style.display = 'none';
      return;
    }

    const rect = el.getBoundingClientRect();
    highlight.className = 'hover';
    highlight.style.cssText = `
      position: fixed; pointer-events: none; z-index: 2147483646;
      outline: 2px solid #1f6feb; background: #1f6feb18;
      border-radius: 3px; transition: top .05s, left .05s, width .05s, height .05s;
      top: ${rect.top}px; left: ${rect.left}px;
      width: ${rect.width}px; height: ${rect.height}px; display: block;
    `;

    const stack = getComponentStack(el);
    const top = stack[0];
    if (top) {
      tooltip.innerHTML = `
        <div class="t-comp">&lt;${top.name}&gt;</div>
        ${top.file ? `<div class="t-file">${top.file}</div>` : ''}
        ${stack[1] ? `<div class="t-hint">in &lt;${stack[1].name}&gt;</div>` : ''}
        <div class="t-hint" style="margin-top:6px">click to add to selection</div>`;
    } else {
      const id = el.id ? `#${el.id}` : '';
      const cls = [...el.classList].slice(0, 2).map(c => `.${c}`).join('');
      tooltip.innerHTML = `
        <div class="t-comp">&lt;${el.tagName.toLowerCase()}${id}${cls}&gt;</div>
        <div class="t-hint">DOM element</div>
        <div class="t-hint" style="margin-top:6px">click to add to selection</div>`;
    }

    const tx = Math.min(e.clientX + 14, window.innerWidth - 360);
    tooltip.style.left = tx + 'px';
    tooltip.style.top  = Math.max(e.clientY - 10, 4) + 'px';
    tooltip.style.display = 'block';
  }, true);

  // ── Click → add to selections ─────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    if (!active) return;
    if (e.target === badge || panel.contains(e.target)) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === badge || panel.contains(el)) return;

    e.preventDefault();
    e.stopPropagation();

    selections.push(buildContext(el));
    tooltip.style.display = 'none';

    // Brief orange flash on the clicked element
    const rect = el.getBoundingClientRect();
    highlight.className = 'locked';
    highlight.style.cssText = `
      position: fixed; pointer-events: none; z-index: 2147483646;
      outline: 2px solid #ffa657; background: #ffa65718;
      border-radius: 3px; transition: opacity .4s;
      top: ${rect.top}px; left: ${rect.left}px;
      width: ${rect.width}px; height: ${rect.height}px; display: block;
    `;
    setTimeout(() => { highlight.style.display = 'none'; }, 600);

    renderPanel();
  }, true);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  window.__elementSelector = {
    destroy() {
      style.remove(); badge.remove(); highlight.remove();
      tooltip.remove(); panel.remove();
      delete window.__elementSelector;
    }
  };

  console.log('%c Element Selector active ', 'background:#1f6feb;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold');
  console.log('Click the extension icon again to deactivate.');
})();
