(function () {
  var ROOT_ITEMS = [
    { slug: "", label: "Accueil" },
    { slug: "premiere-application-50", label: "Premiere application" },
    { slug: "tableau-de-bord-7", label: "Tableau de bord" },
    { slug: "outil-de-conception-4", label: "Outil de conception" },
    { slug: "editeur-decrans-8", label: "Editeur d'ecrans" },
    { slug: "editeur-de-sequence-decrans-23", label: "Editeur de sequence d'ecrans" },
    { slug: "simulation-6", label: "Simulation" },
    { slug: "publications-5", label: "Publications" },
    { slug: "plugins-36", label: "Plugins" }
  ];

  var TUTORIELS_CHILDREN = [
    { slug: "google-sheets-11", label: "Google Sheets" },
    { slug: "airtable-13", label: "Airtable" },
    { slug: "formules-15", label: "Formules" },
    { slug: "variables-54", label: "Variables" },
    { slug: "chat-67", label: "Chat" },
    { slug: "twilio-14", label: "Twilio" },
    { slug: "authentification-61", label: "Authentification" },
    { slug: "integration-rest-52", label: "Integration Rest" },
    { slug: "paiements-stripe-69", label: "Paiements Stripe" },
    { slug: "make-70", label: "Make" },
    { slug: "zapier-71", label: "Zapier" },
    { slug: "domaine-personnalise-53", label: "Domaine Personnalise" },
    { slug: "mode-deconnecte-offline-62", label: "Mode deconnecte offline" },
    { slug: "push-notifications-17", label: "Push Notifications" },
    { slug: "favoris-follower-like-73", label: "Favoris / Follower / Like" },
    { slug: "xano-83", label: "Xano" },
    { slug: "traductions-85", label: "Traductions" }
  ];

  var TAIL_ITEMS = [
    { slug: "faq-86", label: "FAQ" },
    { slug: "generation-de-composants-ia-92", label: "Generation de composants IA" }
  ];

  function inSubFolder(pathname) {
    return pathname.indexOf("/fr/") !== -1 || pathname.indexOf("\\fr\\") !== -1;
  }

  function currentSlug(pathname) {
    var p = pathname.replace(/\\/g, "/");
    var file = p.split("/").pop() || "";
    if (file === "index-fr.html") return "";
    return file.replace(/\.html$/i, "");
  }

  function itemHref(isSubPage, slug) {
    if (!slug) return isSubPage ? "../index-fr.html" : "index-fr.html";
    return isSubPage ? slug + ".html" : "fr/" + slug + ".html";
  }

  function renderLink(isSubPage, slug, label, active) {
    var href = itemHref(isSubPage, slug);
    var aria = active ? ' aria-current="page"' : "";
    return '<a href="' + href + '"' + aria + '>' + label + "</a>";
  }

  function render() {
    var pathname = (window.location && window.location.pathname) || "";
    var isSubPage = inSubFolder(pathname);
    var slug = currentSlug(pathname);

    var html = [];
    html.push('<ul class="menu-tree">');

    for (var i = 0; i < ROOT_ITEMS.length; i++) {
      var it = ROOT_ITEMS[i];
      var active = it.slug === slug || (it.slug === "" && slug === "");
      html.push('<li class="menu-node">' + renderLink(isSubPage, it.slug, it.label, active) + "</li>");
    }

    var isTutorielsPage = slug === "tutoriels-68";
    var isTutorielsChild = false;
    for (var j = 0; j < TUTORIELS_CHILDREN.length; j++) {
      if (TUTORIELS_CHILDREN[j].slug === slug) {
        isTutorielsChild = true;
        break;
      }
    }
    var openAttr = isTutorielsPage || isTutorielsChild ? " open" : "";

    html.push('<li class="menu-node"><details class="menu-group"' + openAttr + '><summary>' + renderLink(isSubPage, "tutoriels-68", "Tutoriels", isTutorielsPage) + '</summary><ul class="menu-children">');
    for (var k = 0; k < TUTORIELS_CHILDREN.length; k++) {
      var ch = TUTORIELS_CHILDREN[k];
      html.push('<li>' + renderLink(isSubPage, ch.slug, ch.label, ch.slug === slug) + "</li>");
    }
    html.push("</ul></details></li>");

    for (var n = 0; n < TAIL_ITEMS.length; n++) {
      var tail = TAIL_ITEMS[n];
      html.push('<li class="menu-node">' + renderLink(isSubPage, tail.slug, tail.label, tail.slug === slug) + "</li>");
    }

    html.push("</ul>");
    return html.join("");
  }

  class DocsSidebarFr extends HTMLElement {
    connectedCallback() {
      this.innerHTML = render();
    }
  }

  if (!customElements.get("docs-sidebar-fr")) {
    customElements.define("docs-sidebar-fr", DocsSidebarFr);
  }
})();
