(function () {
  function detectContext() {
    var pathname = (window.location && window.location.pathname) || "";
    var normalized = pathname.replace(/\\/g, "/");
    var htmlLang = ((document.documentElement && document.documentElement.lang) || "").toLowerCase();
    var isFr = htmlLang.indexOf("fr") === 0 || normalized.indexOf("/fr/") !== -1 || /index-fr\.html$/i.test(normalized);
    var isSub = normalized.indexOf("/fr/") !== -1 || normalized.indexOf("/en/") !== -1;
    return { isFr: isFr, isSub: isSub };
  }

  function render() {
    var ctx = detectContext();
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
      this.innerHTML = render();
    }
  }

  if (!customElements.get("docs-sidebar-shell")) {
    customElements.define("docs-sidebar-shell", DocsSidebarShell);
  }
})();
