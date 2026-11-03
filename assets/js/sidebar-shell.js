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

  // Garde le lien de la page courante visible dans la barre latérale
  function revealActiveLink(sidebar) {
    var link = sidebar && sidebar.querySelector('a[aria-current="page"]');
    if (!link) {
      return;
    }

    var box = sidebar.getBoundingClientRect();
    var r = link.getBoundingClientRect();
    if (r.top < box.top + 40 || r.bottom > box.bottom - 40) {
      sidebar.scrollTop += r.top - box.top - box.height / 3;
    }
  }

  function restoreSidebarScrollWhenReady(sidebar) {
    var top = readStoredSidebarScroll();
    if (!sidebar) {
      return;
    }
    if (top == null) {
      revealActiveLink(sidebar);
      return;
    }

    var attempts = 0;

    function apply() {
      restoreSidebarScroll(sidebar, top);
      attempts += 1;

      if (attempts < 8) {
        window.requestAnimationFrame(apply);
      } else {
        revealActiveLink(sidebar);
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
      prefix + "sidebar-icons.js",
      prefix + "sidebar-menu.js",
      prefix + (ctx.isFr ? "sidebar-data-fr.js" : "sidebar-data-en.js"),
      prefix + (ctx.isFr ? "sidebar-fr.js" : "sidebar-en.js"),
      prefix + "lang-switcher.js",
      prefix + "image-zoom.js",
      prefix + "search.js"
    ];

    return scripts.reduce(function (p, src) {
      return p.then(function () { return ensureScript(src); });
    }, Promise.resolve());
  }

  function render(ctx) {
    var t = ctx.isFr ? CHROME_TEXT.fr : CHROME_TEXT.en;
    var sidebarComponent = ctx.isFr ? "docs-sidebar-fr" : "docs-sidebar-en";

    return [
      '<div class="sidebar-head"><h2>' + t.pages + '</h2><button class="sidebar-close" type="button" aria-label="' + t.closePages + '"><span data-icon="x"></span></button></div>',
      '<button class="search-trigger" type="button"><span data-icon="search"></span><span class="search-trigger-label">' + t.search + '</span><kbd>Ctrl K</kbd></button>',
      '<' + sidebarComponent + '></' + sidebarComponent + '>'
    ].join("\n");
  }

  // Icônes Lucide posées après le chargement de sidebar-icons.js
  function fillIcons() {
    if (!window.DocsSidebarMenu) return;
    Array.prototype.forEach.call(document.querySelectorAll("[data-icon]:empty"), function (el) {
      el.innerHTML = window.DocsSidebarMenu.icon(el.getAttribute("data-icon"));
    });
  }

  /* ---------- Mobile : la barre latérale devient un tiroir ---------- */

  function renderMobileBar(t) {
    var h1 = document.querySelector(".main h1");
    var current = h1 ? h1.textContent.trim() : "";
    return [
      '<button class="mbar-pages" type="button" aria-controls="docs-sidebar" aria-expanded="false" aria-label="' + t.openPages + '">',
      '  <span data-icon="panel-left"></span><span class="mbar-label">' + t.pages + '</span>',
      current ? '  <span class="mbar-current"></span>' : '',
      '</button>',
      '<button class="mbar-search" type="button" aria-label="' + t.search.replace("…", "") + '"><span data-icon="search"></span></button>'
    ].join("\n");
  }

  function wireDrawer(sidebar, bar) {
    var openBtn = bar.querySelector(".mbar-pages");
    var closeBtn = sidebar.querySelector(".sidebar-close");
    var backdrop = document.createElement("div");
    backdrop.className = "drawer-backdrop";
    document.body.appendChild(backdrop);

    function setOpen(open) {
      document.documentElement.classList.toggle("drawer-open", open);
      openBtn.setAttribute("aria-expanded", String(open));
      if (open) {
        closeBtn.focus();
      } else if (sidebar.contains(document.activeElement)) {
        openBtn.focus();
      }
    }

    openBtn.addEventListener("click", function () { setOpen(true); });
    closeBtn.addEventListener("click", function () { setOpen(false); });
    backdrop.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.documentElement.classList.contains("drawer-open")) setOpen(false);
    });

    window.DocsDrawer = { close: function () { setOpen(false); } };
  }

  function mountMobileBar(t) {
    var shell = document.querySelector(".page-shell");
    var sidebar = document.querySelector(".sidebar");
    if (!shell || !sidebar) return;

    if (!sidebar.id) sidebar.id = "docs-sidebar";
    var bar = document.createElement("div");
    bar.className = "doc-mbar";
    bar.innerHTML = renderMobileBar(t);
    var current = bar.querySelector(".mbar-current");
    if (current) current.textContent = document.querySelector(".main h1").textContent.trim();
    shell.parentNode.insertBefore(bar, shell);
    wireDrawer(sidebar, bar);
  }

  /* ---------- Habillage repris de zyllio.com (textes et liens du site) ---------- */

  var SITE = "https://zyllio.com/";
  var STUDIO = "https://www.zyllio.one";
  var SLACK = "https://join.slack.com/t/zyllio-studio/shared_invite/zt-1etbsnzqp-S5UecnkGZVzn0YmYO9yFJw";
  var LINKEDIN = "https://www.linkedin.com/company/zyllio/";

  var CHROME_TEXT = {
    fr: {
      suffix: "-fr",
      skip: "Aller au contenu",
      home: "Zyllio, accueil",
      docs: "Documentation",
      mainNav: "Navigation principale",
      nav: [
        ["features", "Produit", [["#ia", "Créer avec l’IA"], ["#studio", "Le Studio NoCode"], ["#scenarios", "Automatisations"], ["#donnees", "Données et intégrations"], ["#natives", "Applications natives"], ["#terrain", "Sur le terrain"]]],
        ["pricing", "Tarifs", [["#offres", "Les offres"], ["#accompagnement", "Accompagnement"], ["#comparatif", "Comparatif détaillé"], ["#faq", "Questions fréquentes"]]],
        ["partner", "Agences", [["#offre", "L’offre partenaire"], ["#fonctionnement", "Fonctionnement"], ["#faq", "Questions fréquentes"]]],
        ["blog", "Blog", null],
        ["support", "Support", [["#aide", "Aide et contact"], ["#videos", "Vidéos"], ["release-notes", "Notes de version"], ["https://docs.zyllio.com/", "Documentation"]]],
        ["affiliate", "Affiliation", [["#simulateur", "Simulateur de gains"], ["#fonctionnement", "Fonctionnement"], ["#faq", "Questions fréquentes"]]]
      ],
      otherVersion: "English version",
      login: "Se connecter",
      start: "Commencer gratuitement",
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
      toc: "Sommaire",
      pages: "Pages",
      search: "Rechercher…",
      openPages: "Ouvrir la liste des pages",
      closePages: "Fermer la liste des pages",
      tagline: "La plateforme française IA + NoCode pour créer vos applications métier.",
      linkedin: "Zyllio sur LinkedIn",
      slack: "Communauté Zyllio sur Slack",
      cols: [
        ["Produit", [["index#comment", "Comment ça marche"], ["index#agent", "Agent Zyllio"], ["features", "Fonctionnalités"], ["pricing", "Tarifs"]]],
        ["Ressources", [["support", "Support"], ["blog", "Blog"], ["release-notes", "Notes de version"], ["https://docs.zyllio.com/", "Documentation"], ["partner", "Agences partenaires"], ["affiliate", "Affiliation"]]],
        ["Légal", [["terms-of-use", "Conditions d’utilisation"], ["privacy", "Confidentialité"], ["gdpr", "RGPD"], ["legal", "Mentions légales"], ["affiliate-program", "Programme d’affiliation"]]]
      ],
      copyright: "© 2026 Zyllio. Tous droits réservés.",
      france: "Conçu et hébergé en France"
    },
    en: {
      suffix: "",
      skip: "Skip to content",
      home: "Zyllio, home",
      docs: "Documentation",
      mainNav: "Main navigation",
      nav: [
        ["features", "Product", [["#ia", "Build with AI"], ["#studio", "The NoCode Studio"], ["#scenarios", "Automations"], ["#donnees", "Data and integrations"], ["#natives", "Native apps"], ["#terrain", "In the field"]]],
        ["pricing", "Pricing", [["#offres", "Plans"], ["#accompagnement", "Expert services"], ["#comparatif", "Detailed comparison"], ["#faq", "FAQ"]]],
        ["partner", "Agencies", [["#offre", "Partner offer"], ["#fonctionnement", "How it works"], ["#faq", "FAQ"]]],
        ["blog", "Blog", null],
        ["support", "Support", [["#aide", "Help and contact"], ["#videos", "Videos"], ["release-notes", "Release notes"], ["https://docs.zyllio.com/index-en.html", "Documentation"]]],
        ["affiliate", "Affiliates", [["#simulateur", "Earnings simulator"], ["#fonctionnement", "How it works"], ["#faq", "FAQ"]]]
      ],
      otherVersion: "Version française",
      login: "Log in",
      start: "Start for free",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      toc: "Contents",
      pages: "Pages",
      search: "Search…",
      openPages: "Open the page list",
      closePages: "Close the page list",
      tagline: "The French AI + NoCode platform for building your business applications.",
      linkedin: "Zyllio on LinkedIn",
      slack: "Zyllio community on Slack",
      cols: [
        ["Product", [["index#comment", "How it works"], ["index#agent", "Zyllio agent"], ["features", "Features"], ["pricing", "Pricing"]]],
        ["Resources", [["support", "Support"], ["blog", "Blog"], ["release-notes", "Release notes"], ["https://docs.zyllio.com/index-en.html", "Documentation"], ["partner", "Partner agencies"], ["affiliate", "Affiliates"]]],
        ["Legal", [["terms-of-use", "Terms of use"], ["privacy", "Privacy"], ["gdpr", "GDPR"], ["legal", "Legal notice"], ["affiliate-program", "Affiliate program"]]]
      ],
      copyright: "© 2026 Zyllio. All rights reserved.",
      france: "Designed and hosted in France"
    }
  };

  // "features" -> https://zyllio.com/features-fr.html, "index#agent" -> .../index-fr.html#agent
  function siteHref(t, page) {
    if (/^https?:\/\//.test(page)) return page;
    var parts = page.split("#");
    return SITE + parts[0] + t.suffix + ".html" + (parts[1] ? "#" + parts[1] : "");
  }

  function docsHomeHref(ctx) {
    return ctx.isFr ? (ctx.isSub ? "../index.html" : "index.html") : (ctx.isSub ? "../index-en.html" : "index-en.html");
  }

  function renderTop(ctx, t) {
    var img = imagePrefix(ctx);
    var links = t.nav.map(function (item) {
      var href = siteHref(t, item[0]);
      if (!item[2]) {
        return '<a href="' + href + '">' + item[1] + '</a>';
      }
      var subs = item[2].map(function (s) {
        var subHref = s[0].charAt(0) === "#" ? href + s[0] : siteHref(t, s[0]);
        return '<a href="' + subHref + '">' + s[1] + '</a>';
      }).join("");
      return '<div class="nav-item"><a href="' + href + '">' + item[1] + '</a><div class="nav-sub">' + subs + '</div></div>';
    }).join("\n");

    return [
      '<a class="skip" href="#contenu">' + t.skip + '</a>',
      '<div class="site-nav">',
      '  <a class="site-brand" href="' + docsHomeHref(ctx) + '" aria-label="' + t.home + '"><img src="' + img + 'zyllio-logo.png" alt="Zyllio" width="88" height="44"><span>' + t.docs + '</span></a>',
      '  <nav class="site-links" id="site-links" aria-label="' + t.mainNav + '">',
      links,
      '    <a class="m-only js-other-lang" href="#">' + t.otherVersion + '</a>',
      '    <a class="m-only" href="' + STUDIO + '">' + t.login + '</a>',
      '  </nav>',
      '  <div class="site-side">',
      '    <docs-lang-switcher></docs-lang-switcher>',
      '    <a class="site-login" href="' + STUDIO + '">' + t.login + '</a>',
      '    <a class="site-btn" href="' + STUDIO + '">' + t.start + '</a>',
      '    <button class="site-burger" type="button" aria-controls="site-links" aria-expanded="false" aria-label="' + t.openMenu + '"><svg class="b" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg><svg class="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>',
      '  </div>',
      '</div>'
    ].join("\n");
  }

  function renderFooter(ctx, t) {
    var img = imagePrefix(ctx);
    var cols = t.cols.map(function (col) {
      var items = col[1].map(function (l) {
        return '<li><a href="' + siteHref(t, l[0]) + '">' + l[1] + '</a></li>';
      }).join("");
      return '<div><h4>' + col[0] + '</h4><ul>' + items + '</ul></div>';
    }).join("\n");

    return [
      '<div class="site-wrap">',
      '  <div class="foot">',
      '    <div>',
      '      <a class="site-brand" href="' + siteHref(t, "index") + '" aria-label="' + t.home + '"><img src="' + img + 'zyllio-logo.png" alt="Zyllio" width="112" height="56" loading="lazy"></a>',
      '      <p>' + t.tagline + '</p>',
      '      <div class="social">',
      '        <a href="' + LINKEDIN + '" target="_blank" rel="noopener" aria-label="' + t.linkedin + '"><img src="' + img + 'icons/linkedin.png" alt="" loading="lazy"></a>',
      '        <a href="' + SLACK + '" target="_blank" rel="noopener" aria-label="' + t.slack + '"><img src="' + img + 'icons/slack.png" alt="" loading="lazy"></a>',
      '      </div>',
      '    </div>',
      cols,
      '  </div>',
      '  <div class="foot-bot"><span>' + t.copyright + '</span><span><img src="' + img + 'flags/fr.png" alt="" width="20" height="14">' + t.france + '</span></div>',
      '</div>'
    ].join("\n");
  }

  function wireBurger(top, t) {
    var burger = top.querySelector(".site-burger");
    var links = top.querySelector(".site-links");

    function setMenu(open) {
      links.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? t.closeMenu : t.openMenu);
    }

    burger.addEventListener("click", function () { setMenu(!links.classList.contains("open")); });
    links.addEventListener("click", function (event) {
      if (event.target.closest && event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
  }

  function slugify(text) {
    return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  // Sommaire de page construit à partir des titres h2 des sections
  function mountToc(main, t) {
    var entries = [];
    // Tous les h2 des sections : certaines pages regroupent plusieurs titres dans une seule section
    Array.prototype.forEach.call(main.querySelectorAll(":scope > section.section h2"), function (h2) {
      var section = h2.closest("section.section");
      var target = section.id && section.querySelector("h2") === h2 ? section : h2;
      if (!target.id) {
        var base = slugify(h2.textContent) || "section-" + (entries.length + 1);
        var id = base;
        for (var n = 2; document.getElementById(id); n++) id = base + "-" + n;
        target.id = id;
      }
      entries.push({ id: target.id, label: h2.textContent.trim(), el: target });
    });

    if (entries.length < 2) return;

    var toc = document.createElement("nav");
    toc.className = "doc-toc";
    toc.setAttribute("aria-label", t.toc);
    var strong = document.createElement("strong");
    strong.textContent = t.toc;
    toc.appendChild(strong);
    entries.forEach(function (e) {
      var a = document.createElement("a");
      a.href = "#" + e.id;
      a.textContent = e.label;
      toc.appendChild(a);
    });

    var hero = main.querySelector(":scope > .hero");
    main.insertBefore(toc, hero ? hero.nextSibling : main.firstChild);
    main.classList.add("has-toc");

    if (!("IntersectionObserver" in window)) return;
    var tocLinks = Array.prototype.slice.call(toc.querySelectorAll("a"));
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-90px 0px -70% 0px" });
    entries.forEach(function (e) { io.observe(e.el); });
  }

  function mountChrome(ctx) {
    if (window.__docsChromeMounted) return;
    window.__docsChromeMounted = true;

    var t = ctx.isFr ? CHROME_TEXT.fr : CHROME_TEXT.en;

    var top = document.createElement("header");
    top.className = "site-top";
    top.innerHTML = renderTop(ctx, t);
    document.body.insertBefore(top, document.body.firstChild);
    wireBurger(top, t);
    mountMobileBar(t);

    var main = document.querySelector(".main");
    if (main) {
      if (!main.id) main.id = "contenu";
      mountToc(main, t);
    }

    var footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = renderFooter(ctx, t);
    document.body.appendChild(footer);
  }

  function updateOtherLangLink() {
    var link = document.querySelector(".js-other-lang");
    if (!link || typeof window.DocsLangLinks !== "function") return;
    var l = window.DocsLangLinks();
    link.href = l.otherHref;
    link.hreflang = l.otherLang;
    link.lang = l.otherLang;
  }

  class DocsSidebarShell extends HTMLElement {
    connectedCallback() {
      var ctx = detectContext();
      window.DocsContext = ctx;
      ensureFavicon(ctx);
      this.innerHTML = render(ctx);
      mountChrome(ctx);
      wireSidebarScrollPersistence(this);
      loadDependencies(ctx)
        .then(function () {
          fillIcons();
          updateOtherLangLink();
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
