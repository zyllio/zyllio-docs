(function () {
  var OPEN_KEY = "docs-sidebar-open-groups";

  function readOpenGroups() {
    try {
      var raw = window.localStorage.getItem(OPEN_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (err) {
      // Storage may be unavailable; fall back to the default open state.
      return [];
    }
  }

  function writeOpenGroups(list) {
    try {
      window.localStorage.setItem(OPEN_KEY, JSON.stringify(list));
    } catch (err) {
      // Ignore storage failures so the menu still works.
    }
  }

  function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function icon(name) {
    var icons = window.DOCS_ICONS || {};
    var inner = icons[name] || "";
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
  }

  // opts: { folder: "fr" | "en", homeFiles: [...], homeHref: "index.html" }
  function context(opts) {
    var pathname = ((window.location && window.location.pathname) || "").replace(/\\/g, "/");
    var isSubPage = pathname.indexOf("/" + opts.folder + "/") !== -1;
    var file = pathname.split("/").pop() || "";
    var slug = opts.homeFiles.indexOf(file) !== -1 ? "" : file.replace(/\.html$/i, "");
    return { isSubPage: isSubPage, slug: slug };
  }

  function itemHref(opts, ctx, slug) {
    if (!slug) return ctx.isSubPage ? "../" + opts.homeHref : opts.homeHref;
    return ctx.isSubPage ? slug + ".html" : opts.folder + "/" + slug + ".html";
  }

  function render(data, opts) {
    var ctx = context(opts);
    var groups = (data && Array.isArray(data.groups)) ? data.groups : [];
    var stored = readOpenGroups();
    var html = ['<nav class="menu-nav">'];

    groups.forEach(function (group) {
      var items = Array.isArray(group.items) ? group.items : [];
      var isCurrent = items.some(function (it) { return it.slug === ctx.slug; });
      var open = isCurrent || stored.indexOf(group.id) !== -1;

      html.push('<details class="menu-section' + (isCurrent ? " is-current" : "") + '" data-group="' + escapeHtml(group.id) + '"' + (open ? " open" : "") + ">");
      html.push('<summary><span class="menu-section-title">' + escapeHtml(group.title) + '</span><span class="menu-count">' + items.length + "</span></summary>");
      html.push('<ul class="menu-list">');
      items.forEach(function (it) {
        var active = it.slug === ctx.slug;
        html.push(
          '<li><a class="menu-link" href="' + itemHref(opts, ctx, it.slug) + '"' + (active ? ' aria-current="page"' : "") + ">" +
          '<span class="menu-ico">' + icon(it.icon) + "</span>" +
          '<span class="menu-label">' + escapeHtml(it.label) + "</span></a></li>"
        );
      });
      html.push("</ul></details>");
    });

    html.push("</nav>");
    return html.join("");
  }

  // Mémorise les rubriques ouvertes par le lecteur
  function wire(host) {
    host.addEventListener("toggle", function (event) {
      var section = event.target;
      if (!section.classList || !section.classList.contains("menu-section")) return;
      // La rubrique de la page courante s'ouvre toujours : inutile de la mémoriser
      if (section.classList.contains("is-current")) return;
      var id = section.getAttribute("data-group");
      var list = readOpenGroups().filter(function (g) { return g !== id; });
      if (section.open) list.push(id);
      writeOpenGroups(list);
    }, true);
  }

  window.DocsSidebarMenu = { render: render, wire: wire };
})();
