(function () {
  // Recherche plein texte dans la documentation (index : scripts/build-search-index.js)
  if (window.DocsSearch) return;

  var SCRIPT_BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
  var ctx = window.DocsContext || { isFr: true, isSub: false };
  var MAC = /Mac|iPhone|iPad/.test(navigator.platform || "");
  var MAX_RESULTS = 30;

  var TEXT = ctx.isFr
    ? {
        trigger: "Rechercher…", label: "Recherche", placeholder: "Rechercher dans la documentation",
        min: "Saisissez au moins 2 caractères.", none: "Aucun résultat pour", loading: "Chargement de l'index…",
        nav: "naviguer", open: "ouvrir", close: "fermer", esc: "Échap"
      }
    : {
        trigger: "Search…", label: "Search", placeholder: "Search the documentation",
        min: "Type at least 2 characters.", none: "No results for", loading: "Loading index…",
        nav: "navigate", open: "open", close: "close", esc: "Esc"
      };

  var entries = null;
  var loading = null;
  var overlay = null;
  var input = null;
  var list = null;
  var hits = [];
  var active = -1;
  var lastFocus = null;

  function icon(name) {
    return window.DocsSidebarMenu ? window.DocsSidebarMenu.icon(name) : "";
  }

  function norm(text) {
    return String(text).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Une entrée par page (intro) et une par section h2
  function buildEntries(pages) {
    var root = ctx.isSub ? "../" : "";
    var out = [];
    pages.forEach(function (p) {
      out.push({ href: root + p.u, page: p.t, heading: "", text: p.x, nPage: norm(p.t), nHeading: "", nText: norm(p.x) });
      p.s.forEach(function (s) {
        out.push({ href: root + p.u + "#" + s.id, page: p.t, heading: s.h, text: s.x, nPage: norm(p.t), nHeading: norm(s.h), nText: norm(s.x) });
      });
    });
    return out;
  }

  function loadIndex() {
    if (entries) return Promise.resolve(entries);
    if (loading) return loading;
    var variable = ctx.isFr ? "DOCS_SEARCH_FR" : "DOCS_SEARCH_EN";
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = SCRIPT_BASE + "search-index-" + (ctx.isFr ? "fr" : "en") + ".js";
      s.onload = function () {
        entries = buildEntries(window[variable] || []);
        resolve(entries);
      };
      s.onerror = function () { reject(new Error("Failed to load search index")); };
      document.head.appendChild(s);
    });
    return loading;
  }

  function score(entry, tokens) {
    var total = 0;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var inHeading = entry.nHeading.indexOf(t) !== -1;
      var inPage = entry.nPage.indexOf(t) !== -1;
      var inText = entry.nText.indexOf(t) !== -1;
      if (!inHeading && !inPage && !inText) return 0;
      if (inHeading) total += entry.nHeading.indexOf(t) === 0 ? 12 : 8;
      if (inPage) total += entry.heading ? 4 : 10;
      if (inText) total += 1;
    }
    return total;
  }

  function highlight(text, tokens) {
    var n = norm(text);
    var marks = [];
    tokens.forEach(function (t) {
      var from = 0;
      var at;
      while ((at = n.indexOf(t, from)) !== -1) {
        marks.push([at, at + t.length]);
        from = at + t.length;
      }
    });
    marks.sort(function (a, b) { return a[0] - b[0]; });
    var html = "";
    var pos = 0;
    marks.forEach(function (m) {
      if (m[0] < pos) return;
      html += escapeHtml(text.slice(pos, m[0])) + "<mark>" + escapeHtml(text.slice(m[0], m[1])) + "</mark>";
      pos = m[1];
    });
    return html + escapeHtml(text.slice(pos));
  }

  function snippet(entry, tokens) {
    var at = -1;
    for (var i = 0; i < tokens.length && at === -1; i++) at = entry.nText.indexOf(tokens[i]);
    if (at === -1) return highlight(entry.text.slice(0, 140), tokens) + (entry.text.length > 140 ? "…" : "");
    var start = Math.max(0, at - 50);
    var end = Math.min(entry.text.length, at + 110);
    return (start > 0 ? "…" : "") + highlight(entry.text.slice(start, end), tokens) + (end < entry.text.length ? "…" : "");
  }

  function setActive(index) {
    var items = list.querySelectorAll(".search-hit");
    if (!items.length) {
      active = -1;
      input.removeAttribute("aria-activedescendant");
      return;
    }
    active = (index + items.length) % items.length;
    Array.prototype.forEach.call(items, function (el, i) { el.setAttribute("aria-selected", String(i === active)); });
    input.setAttribute("aria-activedescendant", items[active].id);
    items[active].scrollIntoView({ block: "nearest" });
  }

  function message(text) {
    hits = [];
    list.innerHTML = '<li class="search-empty">' + text + "</li>";
    setActive(-1);
  }

  function run() {
    var query = input.value.trim();
    var tokens = norm(query).split(/\s+/).filter(Boolean);
    if (query.length < 2) {
      message(TEXT.min);
      return;
    }
    if (!entries) {
      message(TEXT.loading);
      loadIndex().then(run);
      return;
    }

    hits = entries
      .map(function (e) { return { e: e, s: score(e, tokens) }; })
      .filter(function (h) { return h.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, MAX_RESULTS);

    if (!hits.length) {
      message(TEXT.none + " « " + escapeHtml(query) + " »");
      return;
    }

    list.innerHTML = hits.map(function (h, i) {
      var e = h.e;
      var title = e.heading
        ? '<span class="hit-page">' + escapeHtml(e.page) + '</span><span class="hit-sep">›</span>' + highlight(e.heading, tokens)
        : highlight(e.page, tokens);
      return '<li><a class="search-hit" id="search-hit-' + i + '" role="option" aria-selected="false" href="' + escapeHtml(e.href) + '">' +
        '<span class="hit-ico">' + icon(e.heading ? "hash" : "file-text") + "</span>" +
        '<span class="hit-body"><span class="hit-title">' + title + '</span><span class="hit-text">' + snippet(e, tokens) + "</span></span></a></li>";
    }).join("");
    setActive(0);
  }

  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.documentElement.classList.remove("search-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function go(link) {
    close();
    window.location.href = link.href;
  }

  function open() {
    if (overlay) return;
    lastFocus = document.activeElement;
    overlay = document.createElement("div");
    overlay.className = "search-overlay";
    overlay.innerHTML =
      '<div class="search-panel" role="dialog" aria-modal="true" aria-label="' + TEXT.label + '">' +
      '  <div class="search-field">' + icon("search") +
      '    <input type="search" role="combobox" aria-expanded="true" aria-controls="search-results" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="' + TEXT.placeholder + '">' +
      '    <button class="search-esc" type="button">' + TEXT.esc + "</button>" +
      "  </div>" +
      '  <ul class="search-results" id="search-results" role="listbox" aria-label="' + TEXT.label + '"></ul>' +
      '  <div class="search-foot"><span><kbd>↑</kbd><kbd>↓</kbd> ' + TEXT.nav + "</span><span><kbd>↵</kbd> " + TEXT.open + "</span><span><kbd>" + TEXT.esc + "</kbd> " + TEXT.close + "</span></div>" +
      "</div>";
    document.body.appendChild(overlay);
    document.documentElement.classList.add("search-open");

    input = overlay.querySelector("input");
    list = overlay.querySelector(".search-results");

    overlay.addEventListener("mousedown", function (event) {
      if (event.target === overlay) close();
    });
    overlay.querySelector(".search-esc").addEventListener("click", close);
    input.addEventListener("input", run);
    input.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown") { event.preventDefault(); setActive(active + 1); }
      else if (event.key === "ArrowUp") { event.preventDefault(); setActive(active - 1); }
      else if (event.key === "Enter") {
        var current = list.querySelectorAll(".search-hit")[active];
        if (current) { event.preventDefault(); go(current); }
      }
    });
    list.addEventListener("mousemove", function (event) {
      var hit = event.target.closest && event.target.closest(".search-hit");
      if (!hit) return;
      var items = Array.prototype.slice.call(list.querySelectorAll(".search-hit"));
      var i = items.indexOf(hit);
      if (i !== active) setActive(i);
    });
    list.addEventListener("click", function (event) {
      var hit = event.target.closest && event.target.closest(".search-hit");
      if (hit) { event.preventDefault(); go(hit); }
    });

    message(TEXT.min);
    input.focus();
    loadIndex().catch(function (err) { console.error(err); });
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest && event.target.closest(".search-trigger, .mbar-search");
    if (trigger) {
      event.preventDefault();
      if (window.DocsDrawer) window.DocsDrawer.close();
      open();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && overlay) {
      close();
      return;
    }
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable;
    if ((event.key === "k" || event.key === "K") && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (overlay) close(); else open();
    } else if (event.key === "/" && !typing && !overlay) {
      event.preventDefault();
      open();
    }
  });

  // Libellés du bouton de recherche rendu par sidebar-shell.js
  Array.prototype.forEach.call(document.querySelectorAll(".search-trigger kbd"), function (kbd) {
    kbd.textContent = MAC ? "⌘ K" : "Ctrl K";
  });

  window.DocsSearch = { open: open, close: close, text: TEXT };
})();
