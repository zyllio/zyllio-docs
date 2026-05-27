(function () {
  var SCRIPT_PROMISES = window.__docsSidebarScriptPromises || (window.__docsSidebarScriptPromises = {});

  function detectContext() {
    var pathname = (window.location && window.location.pathname) || "";
    var normalized = pathname.replace(/\\/g, "/");
    var htmlLang = ((document.documentElement && document.documentElement.lang) || "").toLowerCase();
    var isFr = htmlLang.indexOf("fr") === 0 || normalized.indexOf("/fr/") !== -1 || /index-fr\.html$/i.test(normalized);
    var isSub = normalized.indexOf("/fr/") !== -1 || normalized.indexOf("/en/") !== -1;
    return { isFr: isFr, isSub: isSub };
  }

  function jsPrefix(ctx) {
    return ctx.isSub ? "../assets/js/" : "assets/js/";
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
    var homeHref = ctx.isFr ? (ctx.isSub ? "../index-fr.html" : "index-fr.html") : (ctx.isSub ? "../index.html" : "index.html");
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
      this.innerHTML = render(ctx);
      loadDependencies(ctx).catch(function (err) {
        console.error(err);
      });
    }
  }

  if (!customElements.get("docs-sidebar-shell")) {
    customElements.define("docs-sidebar-shell", DocsSidebarShell);
  }
})();
