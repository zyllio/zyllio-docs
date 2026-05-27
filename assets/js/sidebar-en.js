(function () {
  var DATA = window.DOCS_SIDEBAR_DATA_EN || { rootItems: [], tutorielsChildren: [], tailItems: [] };
  var ROOT_ITEMS = Array.isArray(DATA.rootItems) ? DATA.rootItems : [];
  var TUTORIELS_CHILDREN = Array.isArray(DATA.tutorielsChildren) ? DATA.tutorielsChildren : [];
  var TAIL_ITEMS = Array.isArray(DATA.tailItems) ? DATA.tailItems : [];

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

    var tutorielsClass = isTutorielsPage ? ' menu-group-current' : '';
    html.push('<li class="menu-node"><details class="menu-group' + tutorielsClass + '"' + openAttr + '><summary><span class="menu-group-label">Tutoriels</span></summary><ul class="menu-children">');
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

  class DocsSidebarEn extends HTMLElement {
    connectedCallback() {
      this.innerHTML = render();
    }
  }

  if (!customElements.get("docs-sidebar-en")) {
    customElements.define("docs-sidebar-en", DocsSidebarEn);
  }
})();
