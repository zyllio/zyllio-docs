#!/usr/bin/env node
/*
 * Génère l'index de recherche de la documentation.
 *   node scripts/build-search-index.js
 * Produit assets/js/search-index-fr.js et assets/js/search-index-en.js.
 * À relancer après chaque migration ou modification de page.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MAX_TEXT = 1200;

const LANGS = [
  { code: "fr", home: "index.html", folder: "fr", variable: "DOCS_SEARCH_FR" },
  { code: "en", home: "index-en.html", folder: "en", variable: "DOCS_SEARCH_EN" }
];

function decode(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&");
}

function toText(html) {
  return decode(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ").trim();
}

// Même règle que slugify() dans assets/js/sidebar-shell.js (ids du sommaire)
function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function indexPage(file, url) {
  const html = fs.readFileSync(file, "utf8");
  const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || "";
  const h1 = toText((main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "");
  const title = h1 || toText((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/^.*\|\s*/, "");

  const usedIds = new Set(Array.from(html.matchAll(/\sid="([^"]+)"/g), (m) => m[1]));
  const sections = [];
  let intro = "";

  // Découpe le contenu à chaque h2, en reproduisant les ancres générées par le sommaire
  const sectionRe = /<section class="section"(?:\s+id="([^"]*)")?[^>]*>([\s\S]*?)<\/section>/gi;
  let sm;
  while ((sm = sectionRe.exec(main))) {
    const sectionId = sm[1] || "";
    const parts = sm[2].split(/(<h2[^>]*>[\s\S]*?<\/h2>)/i);
    if (parts[0] && toText(parts[0])) intro += " " + toText(parts[0]);
    for (let i = 1; i < parts.length; i += 2) {
      const heading = toText(parts[i].replace(/<\/?h2[^>]*>/gi, ""));
      const ownId = (parts[i].match(/<h2[^>]*\sid="([^"]+)"/i) || [])[1];
      let id = i === 1 && sectionId ? sectionId : ownId;
      if (!id) {
        const base = slugify(heading) || "section-" + (sections.length + 1);
        id = base;
        for (let n = 2; usedIds.has(id); n++) id = base + "-" + n;
        usedIds.add(id);
      }
      sections.push({ id: id, h: heading, x: toText(parts[i + 1] || "").slice(0, MAX_TEXT) });
    }
  }

  const hero = (main.match(/<header[^>]*class="section hero"[^>]*>([\s\S]*?)<\/header>/i) || [])[1] || "";
  const heroLead = toText(hero.replace(/<span class="kicker">[\s\S]*?<\/span>/i, ""))
    .replace(h1, "")
    .trim();

  return { u: url, t: title, x: (heroLead + " " + intro).trim().slice(0, MAX_TEXT), s: sections };
}

for (const lang of LANGS) {
  const pages = [indexPage(path.join(ROOT, lang.home), lang.home)];
  const dir = path.join(ROOT, lang.folder);
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".html")).sort()) {
    pages.push(indexPage(path.join(dir, name), lang.folder + "/" + name));
  }

  const out = "/* Généré par scripts/build-search-index.js - ne pas modifier à la main */\n" +
    "window." + lang.variable + " = " + JSON.stringify(pages) + ";\n";
  const target = path.join(ROOT, "assets", "js", "search-index-" + lang.code + ".js");
  fs.writeFileSync(target, out);
  console.log(path.relative(ROOT, target) + ": " + pages.length + " pages, " + Math.round(out.length / 1024) + " Ko");
}
