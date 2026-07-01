(function () {
  var SCRIPT_PROMISES = window.__docsSidebarScriptPromises || (window.__docsSidebarScriptPromises = {});
  var SIDEBAR_SCROLL_KEY = "docs-sidebar-scroll-top";

  function detectContext() {
    var pathname = (window.location && window.location.pathname) || "";
    var normalized = pathname.replace(/\\/g, "/");
    var htmlLang = ((document.documentElement && document.documentElement.lang) || "").toLowerCase();
    var isFr = htmlLang.indexOf("fr") === 0 || normalized.indexOf("/fr/") !== -1 || /(?:index|index-fr)\.html$/i.test(normalized);
    var isSub = normalized.indexOf("/fr/") !== -1 || normalized.indexOf("/en/") !== -1;
    return { isFr: isFr, isSub: isSub };
  }

  function jsPrefix(ctx) {
    return ctx.isSub ? "../assets/js/" : "assets/js/";
  }

  function imagePrefix(ctx) {
    return ctx.isSub ? "../assets/images/" : "assets/images/";
  }

  function ensureFavicon(ctx) {
    if (document.querySelector('link[rel~="icon"]')) {
      return;
    }

    var icon = document.createElement("link");
    icon.rel = "icon";
    icon.href = imagePrefix(ctx) + "icon.png";
    document.head.appendChild(icon);
  }

  function ensureScript(src) {
    if (document.querySelector('script[src="' + src + '"]')) {
      return Promise.resolve();
    }
    if (SCRIPT_PROMISES[src]) {
      return SCRIPT_PROMISES[src];
    }

    SCRIPT_PROMISES[src] = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("Failed to load script: " + src)); };
      document.head.appendChild(s);
    });

    return SCRIPT_PROMISES[src];
  }

  function getSidebarContainer(host) {
    if (!host || typeof host.closest !== "function") {
      return null;
    }
    return host.closest(".sidebar");
  }

  function saveSidebarScroll(sidebar) {
    if (!sidebar) {
      return;
    }

    try {
      window.sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(sidebar.scrollTop || 0));
    } catch (err) {
      // Ignore storage failures so navigation still works normally.
    }
  }

  function readStoredSidebarScroll() {
    try {
      var raw = window.sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
      if (raw == null) {
        return null;
      }

      var top = parseInt(raw, 10);
      return isNaN(top) ? null : top;
    } catch (err) {
      // Ignore storage failures so the sidebar still renders.
      return null;
    }
  }

  function restoreSidebarScroll(sidebar, top) {
    if (!sidebar || top == null) {
      return;
    }

    sidebar.scrollTop = top;
  }

  function restoreSidebarScrollWhenReady(sidebar) {
    var top = readStoredSidebarScroll();
    if (!sidebar || top == null) {
      return;
    }

    var attempts = 0;

    function apply() {
      restoreSidebarScroll(sidebar, top);
      attempts += 1;

      if (attempts < 8) {
        window.requestAnimationFrame(apply);
      }
    }

    apply();
  }

  function wireSidebarScrollPersistence(host) {
    var sidebar = getSidebarContainer(host);
    if (!sidebar) {
      return;
    }

    if (sidebar.__docsScrollPersistenceBound) {
      return;
    }

    sidebar.addEventListener("scroll", function () {
      saveSidebarScroll(sidebar);
    }, { passive: true });

    sidebar.addEventListener("click", function (event) {
      var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
      if (link) {
        saveSidebarScroll(sidebar);
      }
    });

    window.addEventListener("beforeunload", function () {
      saveSidebarScroll(sidebar);
    });

    sidebar.__docsScrollPersistenceBound = true;
  }

  function loadDependencies(ctx) {
    var prefix = jsPrefix(ctx);
    var scripts = [
      prefix + (ctx.isFr ? "sidebar-data-fr.js" : "sidebar-data-en.js"),
      prefix + (ctx.isFr ? "sidebar-fr.js" : "sidebar-en.js"),
      prefix + "lang-switcher.js"
    ];

    return scripts.reduce(function (p, src) {
      return p.then(function () { return ensureScript(src); });
    }, Promise.resolve());
  }

  function render(ctx) {
    var logoSrc = ctx.isSub ? "../assets/images/zyllio-logo.png" : "assets/images/zyllio-logo.png";
    var homeHref = ctx.isFr ? (ctx.isSub ? "../index.html" : "index.html") : (ctx.isSub ? "../index-en.html" : "index-en.html");
    var aria = ctx.isFr ? "Accueil documentation" : "Documentation home";
    var logoAlt = ctx.isFr ? "Logo Zyllio" : "Zyllio logo";
    var sidebarComponent = ctx.isFr ? "docs-sidebar-fr" : "docs-sidebar-en";

    return [
      '<a class="brand-home" href="' + homeHref + '" aria-label="' + aria + '">',
      '  <img class="brand-logo" src="' + logoSrc + '" alt="' + logoAlt + '">',
      '</a>',
      '<p class="brand">Documentation</p>',
      '<docs-lang-switcher></docs-lang-switcher>',
      '<h2>Pages</h2>',
      '<' + sidebarComponent + '></' + sidebarComponent + '>'
    ].join("\n");
  }

  class DocsSidebarShell extends HTMLElement {
    connectedCallback() {
      var ctx = detectContext();
      ensureFavicon(ctx);
      this.innerHTML = render(ctx);
      wireSidebarScrollPersistence(this);
      loadDependencies(ctx)
        .then(function () {
          restoreSidebarScrollWhenReady(getSidebarContainer(this));
        }.bind(this))
        .catch(function (err) {
          console.error(err);
        });
    }
  }

  if (!customElements.get("docs-sidebar-shell")) {
    customElements.define("docs-sidebar-shell", DocsSidebarShell);
  }
})();
