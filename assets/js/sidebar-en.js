(function () {
  var ROOT_ITEMS = [
    { slug: "", label: "Home" },
    { slug: "first-application-50", label: "First application" },
    { slug: "dashboard-7", label: "Dashboard" },
    { slug: "design-tool-4", label: "Design tool" },
    { slug: "screen-editor-8", label: "Screen editor" },
    { slug: "screen-sequence-editor-23", label: "Screen sequence editor" },
    { slug: "simulation-6", label: "Simulation" },
    { slug: "publications-5", label: "Publications" },
    { slug: "plugins-36", label: "Plugins" }
  ];

  var TUTORIELS_CHILDREN = [
    { slug: "google-sheets-11", label: "Google Sheets" },
    { slug: "airtable-13", label: "Airtable" },
    { slug: "formulas-15", label: "Formulas" },
    { slug: "variables-54", label: "Variables" },
    { slug: "chat-67", label: "Chat" },
    { slug: "twilio-14", label: "Twilio" },
    { slug: "authentication-61", label: "Authentication" },
    { slug: "rest-integration-52", label: "REST Integration" },
    { slug: "stripe-payments-69", label: "Stripe Payments" },
    { slug: "make-70", label: "Make" },
    { slug: "zapier-71", label: "Zapier" },
    { slug: "custom-domain-53", label: "Custom domain" },
    { slug: "offline-mode-62", label: "Offline Mode" },
    { slug: "push-notifications-17", label: "Push Notifications" },
    { slug: "favoris-follower-like-74", label: "Favoris / Follower / Like" },
    { slug: "xano-75", label: "Xano" },
    { slug: "translations-76", label: "Translations" }
  ];

  function inSubFolder(pathname) {
    return pathname.indexOf("/en/") !== -1 || pathname.indexOf("\\en\\") !== -1;
  }

  function currentSlug(pathname) {
    var p = pathname.replace(/\\/g, "/");
    var file = p.split("/").pop() || "";
    if (file === "index.html") return "";
    return file.replace(/\.html$/i, "");
  }

  function itemHref(isSubPage, slug) {
    if (!slug) return isSubPage ? "../index.html" : "index.html";
    return isSubPage ? slug + ".html" : "en/" + slug + ".html";
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

    html.push("</ul>");
    return html.join("");
  }

  class DocsSidebarEn extends HTMLElement {
    connectedCallback() {
      this.innerHTML = render();
    }
  }

  if (!customElements.get("docs-sidebar-en")) {
    customElements.define("docs-sidebar-en", DocsSidebarEn);
  }
})();
