(() => {
  if (window.__claudeSelector) {
    window.__claudeSelector.destroy();
    return;
  }

  // ── Styles ──────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = '__claude-style';
  style.textContent = `
    #__claude-badge {
      position: fixed; top: 12px; right: 12px; z-index: 2147483647;
      background: #1f6feb; color: #fff;
      font: 600 11px/1 "SF Mono", monospace;
      padding: 6px 12px; border-radius: 20px;
      cursor: pointer; user-select: none;
      box-shadow: 0 2px 8px #0008;
      transition: background .15s;
    }
    #__claude-badge:hover { background: #388bfd; }
    #__claude-badge.off { background: #21262d; color: #8b949e; }

    #__claude-highlight {
      position: fixed; pointer-events: none; z-index: 2147483646;
      border-radius: 3px;
      transition: top .1s, left .1s, width .1s, height .1s;
      display: none;
    }
    #__claude-highlight.hover {
      outline: 2px solid #1f6feb; background: #1f6feb18;
    }
    #__claude-highlight.selected {
      outline: 2px solid #ffa657; background: #ffa65718;
    }

    #__claude-tooltip {
      position: fixed; z-index: 2147483647;
      background: #161b22; color: #e2e8f0;
      font: 12px/1.5 "SF Mono", monospace;
      padding: 8px 12px; border-radius: 8px;
      border: 1px solid #30363d;
      box-shadow: 0 4px 16px #0008;
      pointer-events: none;
      max-width: 340px;
      white-space: nowrap;
      display: none;
    }
    #__claude-tooltip .comp { color: #58a6ff; font-weight: 700; font-size: 13px; }
    #__claude-tooltip .file { color: #3fb950; font-size: 10px; margin-top: 3px; }
    #__claude-tooltip .hint { color: #484f58; font-size: 10px; margin-top: 4px; }

    #__claude-panel {
      position: fixed; bottom: 16px; right: 16px; z-index: 2147483647;
      background: #161b22; border: 1px solid #30363d;
      border-radius: 12px; padding: 16px;
      box-shadow: 0 8px 32px #000a;
      font: 12px/1.6 "SF Mono", monospace;
      width: 320px; display: none;
    }
    #__claude-panel.show { display: block; }

    #__claude-panel .panel-header {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 10px;
    }
    #__claude-panel h3 { color: #58a6ff; font-size: 13px; margin: 0; }

    #__claude-panel .close-btn {
      background: none; border: none; color: #484f58;
      font-size: 14px; cursor: pointer; padding: 0; line-height: 1;
    }
    #__claude-panel .close-btn:hover { color: #8b949e; }

    #__claude-panel .nav-row {
      display: flex; gap: 6px; margin-bottom: 10px;
    }
    #__claude-panel .nav-btn {
      flex: 1; padding: 6px 0;
      background: #21262d; border: 1px solid #30363d;
      border-radius: 7px; color: #8b949e;
      font: 600 10px "SF Mono", monospace;
      cursor: pointer; transition: background .15s, color .15s;
      display: flex; align-items: center; justify-content: center; gap: 4px;
    }
    #__claude-panel .nav-btn:hover:not(:disabled) {
      background: #2d333b; color: #e2e8f0;
    }
    #__claude-panel .nav-btn:disabled { opacity: 0.3; cursor: default; }

    #__claude-panel .breadcrumb {
      font-size: 10px; color: #484f58; margin-bottom: 10px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    #__claude-panel .breadcrumb .cur { color: #ffa657; font-weight: 700; }

    #__claude-panel .snippet {
      background: #0d1117; border: 1px solid #21262d;
      border-radius: 6px; padding: 10px;
      color: #8b949e; font-size: 11px;
      white-space: pre-wrap; margin-bottom: 10px;
      max-height: 220px; overflow-y: auto;
    }
    #__claude-panel .copy-btn {
      width: 100%; padding: 8px;
      background: #1f6feb; border: none; border-radius: 7px;
      color: #fff; font: 600 11px "SF Mono", monospace;
      cursor: pointer; transition: background .15s;
    }
    #__claude-panel .copy-btn:hover { background: #388bfd; }
    #__claude-panel .copy-btn.ok { background: #238636; }
  `;
  document.head.appendChild(style);

  // ── DOM elements ──────────────────────────────────────────────────────────
  const badge = document.createElement('div');
  badge.id = '__claude-badge';
  badge.textContent = '⬡ Claude Selector';
  document.body.appendChild(badge);

  const highlight = document.createElement('div');
  highlight.id = '__claude-highlight';
  document.body.appendChild(highlight);

  const tooltip = document.createElement('div');
  tooltip.id = '__claude-tooltip';
  document.body.appendChild(tooltip);

  const panel = document.createElement('div');
  panel.id = '__claude-panel';
  panel.innerHTML = `
    <div class="panel-header">
      <h3 id="__claude-comp-name"></h3>
      <button class="close-btn" id="__claude-close">✕</button>
    </div>
    <div class="nav-row">
      <button class="nav-btn" id="__claude-nav-parent">↑ Pai</button>
    </div>
    <div class="breadcrumb" id="__claude-breadcrumb"></div>
    <div class="snippet" id="__claude-snippet"></div>
    <button class="copy-btn" id="__claude-copy">Copiar contexto para Claude</button>
  `;
  document.body.appendChild(panel);

  // ── State ─────────────────────────────────────────────────────────────────
  let active = true;
  let currentStack = [];
  let currentIndex = 0;
  let selectedEl = null; // raw DOM element clicked (used when no React)

  // ── Fiber utils ───────────────────────────────────────────────────────────
  function getFiberFromEl(el) {
    const key = Object.keys(el).find(k =>
      k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
    );
    return key ? el[key] : null;
  }

  function getComponentStack(el) {
    // Try to get fiber from the element or walk up the DOM until we find one
    let startFiber = null;
    let domNode = el;
    while (domNode && !startFiber) {
      startFiber = getFiberFromEl(domNode);
      domNode = domNode.parentElement;
    }
    if (!startFiber) return [];

    const stack = [];
    const seen = new WeakSet();
    let node = startFiber;

    while (node) {
      // Get component name: function components have type.name, class components too,
      // forwardRef/memo have displayName or inner render.name
      const name =
        node.type?.displayName ||
        node.type?.name ||
        node.type?.render?.displayName ||
        node.type?.render?.name;

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
    return stack; // [0]=innermost … [N]=outermost
  }

  function getDomEl(fiber) {
    let node = fiber;
    while (node) {
      if (node.stateNode instanceof Element) return node.stateNode;
      node = node.child;
    }
    return null;
  }

  // Build a readable CSS selector path for any DOM element
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

  // Get useful attributes from a DOM element (skip long/data attrs)
  function getDomAttrs(el) {
    const skip = new Set(['class', 'id', 'style']);
    const attrs = [];
    for (const { name, value } of el.attributes) {
      if (skip.has(name)) continue;
      const v = value.length > 50 ? value.slice(0, 50) + '…' : value;
      attrs.push(`${name}="${v}"`);
      if (attrs.length >= 5) break;
    }
    return attrs;
  }

  function truncateHtml(el, maxLen = 400) {
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

  // ── Render panel ──────────────────────────────────────────────────────────
  function renderPanel() {
    const hasReact = currentStack.length > 0;
    const item = hasReact ? currentStack[currentIndex] : null;
    const domEl = hasReact ? getDomEl(item.fiber) : selectedEl;

    // Title + position counter
    const titleEl = document.getElementById('__claude-comp-name');
    const counter = hasReact && currentStack.length > 1
      ? ` <span style="color:#484f58;font-size:10px;font-weight:400">${currentIndex + 1}/${currentStack.length}</span>`
      : '';
    titleEl.innerHTML = hasReact
      ? `&lt;${item.name}&gt;${counter}`
      : `&lt;${domEl?.tagName.toLowerCase() ?? 'element'}&gt;`;

    // Nav parent button (only relevant with React)
    document.getElementById('__claude-nav-parent').disabled =
      !hasReact || currentIndex >= currentStack.length - 1;

    // Breadcrumb
    const breadcrumbEl = document.getElementById('__claude-breadcrumb');
    if (hasReact) {
      const start = Math.max(0, currentIndex - 1);
      const end = Math.min(currentStack.length, currentIndex + 4);
      const crumbs = currentStack.slice(start, end).map((s, i) => {
        const realIdx = start + i;
        const label = `&lt;${s.name}&gt;`;
        return realIdx === currentIndex
          ? `<span class="cur">${label}</span>`
          : `<span>${label}</span>`;
      });
      if (start > 0) crumbs.unshift('…');
      if (end < currentStack.length) crumbs.push('…');
      breadcrumbEl.innerHTML = crumbs.join(' › ');
    } else {
      breadcrumbEl.innerHTML = `<span style="color:#484f58">DOM puro — sem componente React</span>`;
    }

    // DOM info (shared for both modes)
    const tag = domEl?.tagName.toLowerCase() ?? null;
    const elId = domEl?.id || null;
    const classes = domEl ? [...domEl.classList].filter(Boolean) : [];
    const attrs = domEl ? getDomAttrs(domEl) : [];
    const cssPath = domEl ? getCssSelector(domEl) : null;
    const htmlSnippet = truncateHtml(domEl);

    // Build snippet
    let snippet = '';
    if (hasReact) {
      const parent = currentStack[currentIndex + 1];
      snippet += `[Componente: <${item.name}>]\n`;
      if (item.file) snippet += `Arquivo: ${item.file}\n`;
      if (parent)    snippet += `Pai: <${parent.name}>\n`;
    } else {
      snippet += `[Elemento DOM]\n`;
    }

    snippet += `Rota: ${window.location.pathname}\n`;
    snippet += `URL: ${window.location.href}\n`;

    if (tag) {
      let domLine = `DOM: <${tag}`;
      if (elId) domLine += ` id="${elId}"`;
      if (classes.length) domLine += ` class="${classes.join(' ')}"`;
      if (attrs.length) domLine += ` ${attrs.join(' ')}`;
      domLine += '>';
      snippet += domLine + '\n';
    }
    if (cssPath) snippet += `Seletor: ${cssPath}\n`;
    if (htmlSnippet) snippet += `\nHTML:\n${htmlSnippet}`;

    document.getElementById('__claude-snippet').textContent = snippet;

    // Orange highlight
    const domRect = domEl?.getBoundingClientRect();
    if (domRect) {
      highlight.className = 'selected';
      highlight.style.cssText = `
        position: fixed; pointer-events: none; z-index: 2147483646;
        outline: 2px solid #ffa657; background: #ffa65718;
        border-radius: 3px; transition: top .1s, left .1s, width .1s, height .1s;
        top: ${domRect.top}px; left: ${domRect.left}px;
        width: ${domRect.width}px; height: ${domRect.height}px;
        display: block;
      `;
    }

    const btn = document.getElementById('__claude-copy');
    btn.textContent = 'Copiar contexto para Claude';
    btn.classList.remove('ok');

    panel.classList.add('show');
  }

  // ── Nav: only parent ──────────────────────────────────────────────────────
  document.getElementById('__claude-nav-parent').onclick = () => {
    if (currentIndex < currentStack.length - 1) {
      currentIndex++;
      renderPanel();
    }
  };

  document.getElementById('__claude-close').onclick = () => {
    panel.classList.remove('show');
    highlight.style.display = 'none';
  };

  document.getElementById('__claude-copy').onclick = () => {
    const text = document.getElementById('__claude-snippet').textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('__claude-copy');
      btn.textContent = '✓ Copiado!';
      btn.classList.add('ok');
      setTimeout(() => {
        btn.textContent = 'Copiar contexto para Claude';
        btn.classList.remove('ok');
      }, 2000);
    });
  };

  // ── Badge toggle ──────────────────────────────────────────────────────────
  badge.onclick = () => {
    active = !active;
    badge.textContent = active ? '⬡ Claude Selector' : '⬡ Selector OFF';
    badge.classList.toggle('off', !active);
    if (!active) {
      tooltip.style.display = 'none';
      // keep highlight if panel is open (selected), else hide
      if (!panel.classList.contains('show')) highlight.style.display = 'none';
    }
  };

  // ── Mousemove → hover ─────────────────────────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    if (!active) return;
    if (panel.contains(e.target) || e.target === badge) {
      tooltip.style.display = 'none';
      return;
    }

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === badge || panel.contains(el)) {
      highlight.style.display = 'none';
      tooltip.style.display = 'none';
      return;
    }

    const rect = el.getBoundingClientRect();
    highlight.className = 'hover';
    highlight.style.cssText = `
      position: fixed; pointer-events: none; z-index: 2147483646;
      outline: 2px solid #1f6feb; background: #1f6feb18;
      border-radius: 3px; transition: top .05s, left .05s, width .05s, height .05s;
      top: ${rect.top}px; left: ${rect.left}px;
      width: ${rect.width}px; height: ${rect.height}px;
      display: block;
    `;

    const stack = getComponentStack(el);
    const top = stack[0];
    if (top) {
      tooltip.innerHTML = `
        <div class="comp">&lt;${top.name}&gt;</div>
        ${top.file ? `<div class="file">${top.file}</div>` : ''}
        ${stack[1] ? `<div class="hint">em &lt;${stack[1].name}&gt;</div>` : ''}
        <div class="hint" style="margin-top:6px">clique para selecionar</div>`;
    } else {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const cls = [...el.classList].slice(0, 2).map(c => `.${c}`).join('');
      tooltip.innerHTML = `
        <div class="comp">&lt;${tag}${id}${cls}&gt;</div>
        <div class="hint">elemento DOM</div>
        <div class="hint" style="margin-top:6px">clique para selecionar</div>`;
    }

    const tx = Math.min(e.clientX + 14, window.innerWidth - 360);
    const ty = Math.max(e.clientY - 10, 4);
    tooltip.style.left = tx + 'px';
    tooltip.style.top = ty + 'px';
    tooltip.style.display = 'block';
  }, true);

  // ── Click → select + deactivate hover ────────────────────────────────────
  document.addEventListener('click', (e) => {
    if (!active) return;
    if (e.target === badge || panel.contains(e.target)) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === badge || panel.contains(el)) return;

    e.preventDefault();
    e.stopPropagation();

    const stack = getComponentStack(el);

    currentStack = stack;
    currentIndex = 0;
    selectedEl = el;

    // Deactivate hover mode after selection
    active = false;
    badge.textContent = '⬡ Selector OFF';
    badge.classList.add('off');
    tooltip.style.display = 'none';

    renderPanel();
  }, true);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  window.__claudeSelector = {
    destroy() {
      style.remove(); badge.remove(); highlight.remove();
      tooltip.remove(); panel.remove();
      delete window.__claudeSelector;
    }
  };

  console.log('%c Claude Selector ativo ', 'background:#1f6feb;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold');
  console.log('Cole o script de novo para desativar.');
})();
