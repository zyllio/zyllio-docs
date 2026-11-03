(function () {
  // Zoom au clic sur les images réduites par la colonne de lecture
  if (window.__docsImageZoom) return;
  window.__docsImageZoom = true;

  var fr = (document.documentElement.lang || "").toLowerCase().indexOf("fr") === 0;
  var TEXT = fr
    ? { zoom: "Agrandir l'image", close: "Fermer" }
    : { zoom: "Enlarge image", close: "Close" };

  var overlay = null;
  var lastFocus = null;

  function icon(name) {
    return window.DocsSidebarMenu ? window.DocsSidebarMenu.icon(name) : "";
  }

  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.documentElement.classList.remove("zoom-open");
    if (lastFocus) lastFocus.focus();
  }

  function open(img) {
    lastFocus = img;
    overlay = document.createElement("div");
    overlay.className = "zoom-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", img.alt || TEXT.zoom);
    overlay.innerHTML = '<button class="zoom-close" type="button" aria-label="' + TEXT.close + '">' + icon("x") + "</button>";

    var big = document.createElement("img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || "";
    overlay.appendChild(big);

    overlay.addEventListener("click", close);
    document.body.appendChild(overlay);
    document.documentElement.classList.add("zoom-open");
    overlay.querySelector(".zoom-close").focus();
  }

  function mark(img) {
    // Seules les images affichées nettement plus petites que leur taille réelle sont zoomables
    var zoomable = img.naturalWidth > img.clientWidth * 1.15 && img.clientWidth > 0;
    img.classList.toggle("is-zoomable", zoomable);
    if (zoomable) {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", (img.alt ? img.alt + " – " : "") + TEXT.zoom);
    } else {
      img.removeAttribute("tabindex");
      img.removeAttribute("role");
      img.removeAttribute("aria-label");
    }
  }

  function scan() {
    Array.prototype.forEach.call(document.querySelectorAll(".main .section img:not(.hero-banner)"), function (img) {
      if (img.complete) mark(img);
      else img.addEventListener("load", function () { mark(img); }, { once: true });
    });
  }

  document.addEventListener("click", function (event) {
    var img = event.target.closest && event.target.closest("img.is-zoomable");
    if (img) open(img);
  });

  document.addEventListener("keydown", function (event) {
    if (overlay && event.key === "Escape") {
      close();
      return;
    }
    var img = event.target;
    if (img && img.classList && img.classList.contains("is-zoomable") && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      open(img);
    }
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scan, 200);
  });

  scan();
})();
