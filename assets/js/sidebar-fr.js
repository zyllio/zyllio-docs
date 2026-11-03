(function () {
  var OPTS = { folder: "fr", homeFiles: ["index.html", "index-fr.html"], homeHref: "index.html" };

  class DocsSidebarFr extends HTMLElement {
    connectedCallback() {
      this.innerHTML = window.DocsSidebarMenu.render(window.DOCS_SIDEBAR_DATA_FR, OPTS);
      window.DocsSidebarMenu.wire(this);
    }
  }

  if (!customElements.get("docs-sidebar-fr")) {
    customElements.define("docs-sidebar-fr", DocsSidebarFr);
  }
})();
