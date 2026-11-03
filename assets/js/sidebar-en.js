(function () {
  var OPTS = { folder: "en", homeFiles: ["index-en.html"], homeHref: "index-en.html" };

  class DocsSidebarEn extends HTMLElement {
    connectedCallback() {
      this.innerHTML = window.DocsSidebarMenu.render(window.DOCS_SIDEBAR_DATA_EN, OPTS);
      window.DocsSidebarMenu.wire(this);
    }
  }

  if (!customElements.get("docs-sidebar-en")) {
    customElements.define("docs-sidebar-en", DocsSidebarEn);
  }
})();
