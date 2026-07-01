(function () {
  var FR_SLUGS = [
    "premiere-application-50",
    "tableau-de-bord-7",
    "outil-de-conception-4",
    "editeur-decrans-8",
    "editeur-de-sequence-decrans-23",
    "simulation-6",
    "publications-5",
    "plugins-36",
    "tutoriels-68",
    "google-sheets-11",
    "airtable-13",
    "timetonic-88",
    "formules-15",
    "variables-54",
    "chat-67",
    "twilio-14",
    "authentification-61",
    "sso-90",
    "integration-rest-52",
    "paiements-stripe-69",
    "make-70",
    "zapier-71",
    "domaine-personnalise-53",
    "mode-deconnecte-offline-62",
    "push-notifications-17",
    "favoris-follower-like-73",
    "transferer-une-application-82",
    "xano-83",
    "traductions-85",
    "api-saas-87",
    "monetiser-vos-apps-saas-89",
    "parametres-dapplication-91",
    "faq-86",
    "generation-de-composants-ia-92"
  ];

  var EN_SLUGS = [
    "first-application-50",
    "dashboard-7",
    "design-tool-4",
    "screen-editor-8",
    "screen-sequence-editor-23",
    "simulation-6",
    "publications-5",
    "plugins-36",
    "tutoriels-68",
    "google-sheets-11",
    "airtable-13",
    "timetonic-88",
    "formulas-15",
    "variables-54",
    "chat-67",
    "twilio-14",
    "authentication-61",
    "sso-90",
    "rest-integration-52",
    "stripe-payments-69",
    "make-70",
    "zapier-71",
    "custom-domain-53",
    "offline-mode-62",
    "push-notifications-17",
    "favoris-follower-like-74",
    "transfer-an-application-82",
    "xano-75",
    "translations-76",
    "api-saas-87",
    "monetize-saas-apps-89",
    "application-settings-91",
    "faq-86",
    "ai-component-generation-92"
  ];

  function slugToId(slug) {
    var m = /-(\d+)$/.exec(slug || "");
    return m ? m[1] : null;
  }

  function mapById(slugs) {
    var map = Object.create(null);
    for (var i = 0; i < slugs.length; i++) {
      var id = slugToId(slugs[i]);
      if (id) map[id] = slugs[i];
    }
    return map;
  }

  var FR_BY_ID = mapById(FR_SLUGS);
  var EN_BY_ID = mapById(EN_SLUGS);

  function isFrPage(pathname, htmlLang) {
    return (htmlLang || "").toLowerCase().indexOf("fr") === 0 || pathname.indexOf("/fr/") !== -1 || /(?:^|\/)index(?:-fr)?\.html$/i.test(pathname);
  }

  function isSubPage(pathname) {
    return pathname.indexOf("/fr/") !== -1 || pathname.indexOf("/en/") !== -1;
  }

  function fileName(pathname) {
    var p = (pathname || "").replace(/\\/g, "/");
    return p.split("/").pop() || "";
  }

  function pageSlug(pathname, frPage) {
    var name = fileName(pathname);
    if (!name) return "";
    if (name === "index.html" || name === "index-fr.html" || name === "index-en.html") return "";
    var slug = name.replace(/\.html$/i, "");
    if (frPage && FR_SLUGS.indexOf(slug) !== -1) return slug;
    if (!frPage && EN_SLUGS.indexOf(slug) !== -1) return slug;
    return slug;
  }

  function makeHref(sub, lang, slug) {
    if (!slug) {
      if (lang === "fr") return sub ? "../index.html" : "index.html";
      return sub ? "../index-en.html" : "index-en.html";
    }
    if (sub) return lang === "fr" ? "../fr/" + slug + ".html" : "../en/" + slug + ".html";
    return lang === "fr" ? "fr/" + slug + ".html" : "en/" + slug + ".html";
  }

  function buildLinks() {
    var pathname = (window.location && window.location.pathname) || "";
    var htmlLang = (document.documentElement && document.documentElement.lang) || "";
    var frPage = isFrPage(pathname, htmlLang);
    var sub = isSubPage(pathname);
    var slug = pageSlug(pathname, frPage);

    var currentLang = frPage ? "fr" : "en";
    var otherLang = frPage ? "en" : "fr";

    var otherSlug = "";
    if (slug) {
      var id = slugToId(slug);
      if (id) {
        otherSlug = frPage ? (EN_BY_ID[id] || "") : (FR_BY_ID[id] || "");
      }
    }

    return {
      currentLang: currentLang,
      currentHref: makeHref(sub, currentLang, slug),
      otherHref: makeHref(sub, otherLang, otherSlug),
      currentLabel: frPage ? "Fran&ccedil;ais" : "English",
      otherLabel: frPage ? "English" : "Fran&ccedil;ais"
    };
  }

  function render() {
    var l = buildLinks();
    var html = [];
    html.push('<details class="lang-dropdown">');
    html.push('  <summary class="lang-summary">');
    html.push('    <span class="lang-label"><span class="lang-icon" aria-hidden="true">&#127760;</span> ' + l.currentLabel + '</span>');
    html.push('    <span class="lang-caret" aria-hidden="true">&#9662;</span>');
    html.push('  </summary>');
    html.push('  <div class="lang-menu">');
    html.push('    <a class="lang-option" href="' + l.otherHref + '">' + l.otherLabel + '</a>');
    html.push('    <a class="lang-option is-active" href="' + l.currentHref + '" aria-current="page">' + l.currentLabel + '</a>');
    html.push('  </div>');
    html.push('</details>');
    return html.join("\n");
  }

  class DocsLangSwitcher extends HTMLElement {
    connectedCallback() {
      this.innerHTML = render();
    }
  }

  if (!customElements.get("docs-lang-switcher")) {
    customElements.define("docs-lang-switcher", DocsLangSwitcher);
  }
})();
