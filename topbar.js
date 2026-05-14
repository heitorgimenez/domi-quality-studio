/**
 * DQS Shared Topbar
 * Single source of truth for the topbar across all DQS wireframe pages.
 *
 * Usage: each page sets window._topbar before loading this script:
 *   <script>window._topbar = { tool: 'conv-explorer', page: 'overview' }</script>
 *   <script src="topbar.js"></script>
 *
 * tool: 'conv-explorer' | 'playground'
 * page: 'overview' | 'dashboard' | 'sessions' | 'lab' | 'tests'
 */
(function () {
  'use strict';

  var cfg = window._topbar || { tool: 'conv-explorer', page: 'overview' };

  /* ── Navigation map ──────────────────────────────────────────── */
  var TOOL_PAGES = {
    'conv-explorer': 'conv-explorer-overview.html',
    'playground':    'playground-lab.html',
  };

  var TOOLS = [
    {
      id: 'conv-explorer', label: 'Conv Explorer',
      href: 'conv-explorer-overview.html',
      role: 'Observe what\'s happening',
      icon: '<path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    },
    {
      id: 'playground', label: 'Playground',
      href: 'playground-lab.html',
      role: 'Test prompt changes',
      icon: '<polygon points="6 4 20 12 6 20 6 4"/>',
    },
    {
      id: 'devx', label: 'DevX',
      href: '#', disabled: true,
      role: 'Build new agents',
      icon: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    },
    {
      id: 'knowledge-base', label: 'Knowledge base',
      href: '#', disabled: true,
      role: 'Tune what agents know',
      icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    },
  ];

  var AGENTS = [
    { id: 'domi',      name: 'Domi',      role: 'Multi-skill assistant · default', color: 'var(--indigo-500)', initial: 'D' },
    { id: 'walle',     name: 'Wall-E',    role: 'General support',                 color: 'var(--cat-2)',      initial: 'W' },
    { id: 'matthew',   name: 'Matthew',   role: 'Debt collection',                 color: 'var(--cat-3)',      initial: 'M' },
    { id: 'sonia',     name: 'SonIA',     role: 'Contracts &amp; cancellation',    color: 'var(--cat-4)',      initial: 'S' },
    { id: 'concierge', name: 'Concierge', role: 'Visit scheduling',                color: 'var(--cat-5)',      initial: 'C' },
    { id: 'maria',     name: 'MarIA',     role: 'Pricing &amp; negotiation',       color: 'var(--cat-1)',      initial: 'M' },
    { id: 'isaias',    name: 'Isaias',    role: 'Property supply',                 color: 'var(--cat-6)',      initial: 'I' },
  ];

  var activeAgent = AGENTS[0];
  try {
    var _saved = localStorage.getItem('dqs-active-agent');
    if (_saved) { var _p = JSON.parse(_saved); if (_p && _p.id) activeAgent = _p; }
  } catch (e) {}

  /* ── SVG helpers ─────────────────────────────────────────────── */
  function svg(w, h, paths, extra) {
    return '<svg ' + (extra || '') + ' width="' + w + '" height="' + h + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + paths + '</svg>';
  }
  var CARET = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
  var CHECK = '<svg class="pi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

  /* ── CSS injection (only the new bits not already in page CSS) ── */
  function injectCSS() {
    if (document.getElementById('dqs-topbar-css')) return;
    var s = document.createElement('style');
    s.id = 'dqs-topbar-css';
    s.textContent = [
      '.topbar-selector-group{display:flex;align-items:center;gap:5px;}',
      '.selector-label{font-size:12px;font-weight:500;color:var(--text-subtle);letter-spacing:.01em;user-select:none;white-space:nowrap;}',
      '.topbar .spacer{flex:1;}',
      '.brand .logo{background:#2C2A8A;}',
      'html[data-theme="dark"] .brand .logo{background:#3F38A2;}',
      '#tool-pop .pop-item,#agent-pop .pop-item,#profile-pop .pop-item{align-items:center;gap:10px;padding:8px 10px;}',
      '#tool-pop .pi-name,#agent-pop .pi-name,#profile-pop .pi-name{flex:none;font-size:13px;font-weight:500;line-height:1.3;color:var(--text);}',
      '#tool-pop .pop-item.is-active .pi-name,#agent-pop .pop-item.is-active .pi-name{font-weight:600;color:var(--indigo-700);}',
      '#tool-pop .pi-role,#agent-pop .pi-role,#profile-pop .pi-role{font-size:12px;font-weight:400;color:var(--text-subtle);line-height:1.3;margin-left:0;margin-top:1px;}',
      '#tool-pop .pop-item>div,#agent-pop .pop-item>div,#profile-pop .pop-item>div{min-width:0;}',
      '#tool-pop .pop-item.is-disabled,#agent-pop .pop-item.is-disabled,#profile-pop .pop-item.is-disabled{opacity:.55;cursor:not-allowed;}',
      '#tool-pop .pop-item.is-disabled:hover,#agent-pop .pop-item.is-disabled:hover,#profile-pop .pop-item.is-disabled:hover{background:transparent;}',
      /* Soon badge — small, uppercase, muted pill. Applies to pi-meta.is-soon (tool/agent/profile pops) and pi-status (sessions). */
      '.pi-meta.is-soon,.pi-status{display:inline-flex;align-items:center;height:16px;padding:0 6px;border-radius:4px;background:var(--surface-3,#EEF0F4);color:var(--text-faint);font-size:9.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;line-height:1;font-family:inherit;}',
      'html[data-theme="dark"] .pi-meta.is-soon,html[data-theme="dark"] .pi-status{background:rgba(255,255,255,0.06);}',
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ── Render: replace topbar innerHTML ───────────────────────── */
  function render() {
    var topbar = document.querySelector('.topbar');
    if (!topbar) return;

    var activeTool = TOOLS.find(function (t) { return t.id === cfg.tool; }) || TOOLS[0];

    var toolItems = TOOLS.map(function (t) {
      var isActive = t.id === cfg.tool;
      var cls = 'pop-item' + (isActive ? ' is-active' : '') + (t.disabled ? ' is-disabled' : '');
      return [
        '<div class="' + cls + '" role="menuitem"',
        t.disabled ? '' : ' data-tool-nav="' + t.href + '"',
        '>',
        svg(16, 16, t.icon, 'class="pi-icon"'),
        '<div style="flex:1">',
        '<div class="pi-name">' + t.label + '</div>',
        '<div class="pi-role">' + t.role + '</div>',
        '</div>',
        isActive ? CHECK : '',
        t.disabled ? '<span class="pi-meta is-soon">Soon</span>' : '',
        '</div>',
      ].join('');
    }).join('');

    var agentItems = AGENTS.map(function (a) {
      var isActive = a.id === activeAgent.id;
      return [
        '<div class="pop-item' + (isActive ? ' is-active' : '') + '" role="menuitem"',
        ' data-agent="' + a.id + '" data-color="' + a.color + '" data-initial="' + a.initial + '" data-name="' + a.name + '">',
        '<span class="pi-avatar" style="background:' + a.color + ';">' + a.initial + '</span>',
        '<div style="flex:1"><div class="pi-name">' + a.name + '</div><div class="pi-role">' + a.role + '</div></div>',
        CHECK,
        '</div>',
      ].join('');
    }).join('');

    topbar.innerHTML = [
      /* Brand */
      '<a class="brand" href="' + (TOOL_PAGES[cfg.tool] || 'conv-explorer-overview.html') + '" title="Domi Quality Studio — home">',
      '  <span class="logo">DQS</span>',
      '  <span class="brand-name">Domi Quality Studio</span>',
      '</a>',
      '<span class="topbar-divider"></span>',

      /* Tool selector group */
      '<div class="topbar-selector-group">',
      '  <span class="selector-label">Tool</span>',
      '  <button class="tool-switcher" id="tool-switcher-btn" type="button" aria-haspopup="true" aria-expanded="false">',
      '    ' + svg(14, 14, activeTool.icon, 'class="ts-icon"'),
      '    <span id="topbar-tool-label">' + activeTool.label + '</span>',
      '    <svg class="ts-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>',
      '  </button>',
      '</div>',

      /* Agent selector group */
      '<div class="topbar-selector-group">',
      '  <span class="selector-label">Chatbot</span>',
      '  <button class="agent-chip is-lead" id="agent-chip-lead" type="button" data-agent-trigger aria-haspopup="true" aria-expanded="false">',
      '    <span class="ac-avatar" id="topbar-agent-avatar" style="background:' + activeAgent.color + ';">' + activeAgent.initial + '</span>',
      '    <span class="ac-name" id="topbar-agent-name">' + activeAgent.name + '</span>',
      '    <svg class="ac-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>',
      '  </button>',
      '</div>',

      '<div class="spacer"></div>',

      /* Search */
      '<label class="topbar-search">',
      '  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
      '  <input type="text" placeholder="Search conversations, topics, users…" aria-label="Search" />',
      '</label>',

      /* Profile */
      '<button class="avatar" id="profile-btn" type="button" aria-haspopup="true" aria-expanded="false" title="Heitor Pagliari">HP</button>',
    ].join('\n');

    /* Popovers — append to body once */
    if (!document.getElementById('tool-pop')) {
      var popDiv = document.createElement('div');
      popDiv.innerHTML = [
        '<div class="pop" id="tool-pop" role="menu">',
        '  <div class="pop-section-label">Tools</div>',
        toolItems,
        '</div>',

        '<div class="pop" id="agent-pop" role="menu" style="min-width:280px;">',
        '  <div class="pop-section-label">Chatbots</div>',
        agentItems,
        '  <div class="pop-divider"></div>',
        '  <div class="pop-item is-disabled" role="menuitem">',
        svg(16, 16, '<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>', 'class="pi-icon"'),
        '    <div style="flex:1"><div class="pi-name">All chatbots (fleet view)</div><div class="pi-role">Cross-chatbot panorama</div></div>',
        '    <span class="pi-meta is-soon">Soon</span>',
        '  </div>',
        '</div>',

        '<div class="pop align-right" id="profile-pop" role="menu" style="min-width:240px;">',
        '  <div class="pop-item" role="menuitem" style="cursor:default;">',
        '    <span class="pi-avatar" style="background:linear-gradient(135deg,var(--cat-2),var(--indigo-500));">HP</span>',
        '    <div style="flex:1"><div class="pi-name">Heitor Pagliari</div><div class="pi-role">heitor@quintoandar.com.br</div></div>',
        '  </div>',
        '  <div class="pop-divider"></div>',
        '  <div class="pop-item is-disabled" role="menuitem">',
        svg(16, 16, '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>', 'class="pi-icon"'),
        '    <div style="flex:1"><div class="pi-name">Settings</div></div>',
        '    <span class="pi-meta is-soon">Soon</span>',
        '  </div>',
        '  <div class="pop-item" role="menuitem" id="sign-out-item">',
        svg(16, 16, '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>', 'class="pi-icon"'),
        '    <div style="flex:1"><div class="pi-name">Sign out</div></div>',
        '  </div>',
        '</div>',
      ].join('\n');
      document.body.appendChild(popDiv);
    }
  }

  /* ── Popover engine ──────────────────────────────────────────── */
  function initPopovers() {
    var POPS = {
      tool:    document.getElementById('tool-pop'),
      agent:   document.getElementById('agent-pop'),
      profile: document.getElementById('profile-pop'),
    };
    var openPop = null, openTrigger = null;

    function positionPop(pop, trigger) {
      pop.style.visibility = 'hidden';
      pop.classList.add('is-open');
      var pw = pop.offsetWidth, ph = pop.offsetHeight;
      pop.classList.remove('is-open');
      pop.style.visibility = '';
      var rect = trigger.getBoundingClientRect();
      var left = pop.classList.contains('align-right') ? rect.right - pw : rect.left;
      left = Math.min(Math.max(left, 8), window.innerWidth - pw - 8);
      var top = rect.bottom + 6;
      if (top + ph > window.innerHeight - 8) top = rect.top - ph - 6;
      pop.style.left = left + 'px';
      pop.style.top  = top  + 'px';
    }
    function close() {
      if (openPop) openPop.classList.remove('is-open');
      if (openTrigger) openTrigger.setAttribute('aria-expanded', 'false');
      openPop = null; openTrigger = null;
    }
    function open(pop, trigger) {
      if (openPop === pop && openTrigger === trigger) { close(); return; }
      close();
      positionPop(pop, trigger);
      pop.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      openPop = pop; openTrigger = trigger;
    }

    /* Tool switcher */
    var toolBtn = document.getElementById('tool-switcher-btn');
    if (toolBtn) {
      toolBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        open(POPS.tool, toolBtn);
      });
    }

    /* Profile */
    var profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        open(POPS.profile, profileBtn);
      });
    }

    /* Agent chips — any [data-agent-trigger] */
    function wireAgentChips() {
      document.querySelectorAll('[data-agent-trigger]').forEach(function (chip) {
        chip.addEventListener('click', function (e) {
          e.stopPropagation();
          open(POPS.agent, chip);
        });
      });
    }
    wireAgentChips();
    /* re-wire when page adds dynamic chips */
    window._dqsReWireAgentChips = wireAgentChips;

    /* Close on outside click / Escape */
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.pop')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    window.addEventListener('resize', function () {
      if (openPop && openTrigger) positionPop(openPop, openTrigger);
    });

    /* Tool navigation */
    if (POPS.tool) {
      POPS.tool.querySelectorAll('[data-tool-nav]').forEach(function (item) {
        item.addEventListener('click', function (e) {
          e.stopPropagation();
          if (item.classList.contains('is-disabled')) return;
          window.location.href = item.getAttribute('data-tool-nav');
        });
      });
    }

    /* Agent selection */
    if (POPS.agent) {
      POPS.agent.querySelectorAll('.pop-item[data-agent]').forEach(function (item) {
        item.addEventListener('click', function (e) {
          e.stopPropagation();
          if (item.classList.contains('is-disabled')) return;
          var color   = item.getAttribute('data-color');
          var initial = item.getAttribute('data-initial');
          var name    = item.getAttribute('data-name');
          POPS.agent.querySelectorAll('.pop-item[data-agent]').forEach(function (i) {
            i.classList.remove('is-active');
          });
          item.classList.add('is-active');
          activeAgent = { id: item.getAttribute('data-agent'), name: name, color: color, initial: initial };
          try { localStorage.setItem('dqs-active-agent', JSON.stringify(activeAgent)); } catch (e) {}
          document.querySelectorAll('.agent-chip').forEach(function (chip) {
            var av = chip.querySelector('.ac-avatar');
            var nm = chip.querySelector('.ac-name');
            if (av) { av.style.background = color; av.textContent = initial; }
            if (nm) nm.textContent = name;
          });
          close();
          if (window._dqsOnAgentChange) window._dqsOnAgentChange(activeAgent);
        });
      });
    }
  }

  /* ── Theme restore (click handler lives in each page script) ─── */
  function initTheme() {
    var html = document.documentElement;
    var saved = null;
    try { saved = localStorage.getItem('dqs-theme'); } catch (e) {}
    if (saved) html.setAttribute('data-theme', saved);
    /* Each page's inline script owns the click handler to avoid double-wiring. */
  }

  /* ── Boot ────────────────────────────────────────────────────── */
  function boot() {
    injectCSS();
    render();
    initPopovers();
    initTheme();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
