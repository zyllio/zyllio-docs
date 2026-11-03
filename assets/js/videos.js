(function () {
  // Vidéos : lecteur YouTube sans cookie, chargé seulement au clic (comme sur zyllio.com)
  if (window.__docsVideos) return;
  window.__docsVideos = true;

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[data-yt]");
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();

    var frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(link.getAttribute("data-yt")) + "?autoplay=1&rel=0";
    frame.title = link.querySelector("b").textContent;
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;

    // Un lecteur ne peut pas rester dans un lien : la vignette devient un bloc simple
    var block = document.createElement("div");
    block.className = "vid on";
    block.innerHTML = link.innerHTML;
    var box = block.querySelector(".vid-img");
    box.innerHTML = "";
    box.appendChild(frame);
    link.parentNode.replaceChild(block, link);
  });
})();
