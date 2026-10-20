import assert from "node:assert/strict";
import test from "node:test";
import {
  clearSlideCache,
  deckAssetUrl,
  decksForLanguage,
  marpCssIsScoped,
  parseDeckFields,
  prepareSlideMedia,
  readSlideDecks,
  scopeMarpCss,
  splitMarpSlides,
} from "./slides.mjs";

test("raster images are published as webp and other files keep their names", () => {
  assert.equal(
    deckAssetUrl("sample", "img/swatch.png"),
    "/slides-assets/sample/img/swatch.webp",
  );
  assert.equal(
    deckAssetUrl("sample", "./img/sample-flow.svg"),
    "/slides-assets/sample/img/sample-flow.svg",
  );
  assert.equal(
    deckAssetUrl("sample", "img/clip.mp4"),
    "/slides-assets/sample/img/clip.mp4",
  );
});

test("marp css scoping rewrites the unscoped html, body rule", () => {
  const scoped = scopeMarpCss(
    "html, body{background:#fff}@media print{html, body{margin:0}}div.marpit > svg > foreignObject > section{color:#111}",
  );
  assert.equal(scoped.includes("html"), false);
  assert.equal(marpCssIsScoped(scoped), true);
  assert.equal(
    marpCssIsScoped("html, body{background:#fff}div.marpit{color:#111}"),
    false,
  );
});

test("slide splitting keeps a nested svg inside its slide and drops scripts", () => {
  const html = [
    '<div class="marpit">',
    '<svg data-marpit-svg="" viewBox="0 0 1280 720"><foreignObject><section><svg><rect /></svg></section></foreignObject></svg>',
    '<svg data-marpit-svg="" viewBox="0 0 1280 720"><foreignObject><section><p>Next</p><script>alert(1)</script></section></foreignObject></svg>',
    "</div>",
  ].join("");
  const slides = splitMarpSlides(html);
  assert.equal(slides.length, 2);
  assert.equal(slides[0].includes("<rect"), true);
  assert.equal(slides[0].endsWith("</svg>"), true);
  assert.equal(slides[1].includes("<script"), false);
  assert.equal(slides[1].includes("Next"), true);
});

test("images lazy-load and video does not preload or autoplay until activated", () => {
  const html = prepareSlideMedia(
    '<img src="/a.webp" alt=""><video autoplay muted loop src="/b.mp4"></video>',
  );
  assert.match(html, /loading="lazy"/);
  assert.match(html, /decoding="async"/);
  assert.equal(/\sautoplay\b/.test(html), false);
  assert.match(html, /data-autoplay="true"/);
  assert.match(html, /preload="none"/);
  assert.match(html, /\bmuted\b/);
});

test("deck frontmatter requires title, date, description, lang, and the presentation theme", () => {
  assert.throws(
    () => parseDeckFields({ marp: true }, "content/slides/bad/bad.md", "bad"),
    /theme must be presentation/,
  );
  const fields = parseDeckFields(
    {
      marp: true,
      theme: "presentation",
      size: "16:9",
      title: "Sample",
      date: "2026-10-20",
      description: "A draft deck.",
      lang: "en",
      draft: true,
    },
    "content/slides/bad/bad.md",
    "bad",
  );
  assert.equal(fields.draft, true);
  assert.equal(fields.lang, "en");
  assert.equal(fields.date, "2026-10-20");
});

test("the sample deck is a draft and stays out of the published list", () => {
  clearSlideCache();
  const previous = process.env.SHOW_DRAFTS;
  delete process.env.SHOW_DRAFTS;
  try {
    const published = readSlideDecks();
    assert.equal(
      published.some((deck) => deck.slug === "sample"),
      false,
    );
    const english = decksForLanguage("en", readSlideDecks({ includeDrafts: true }));
    const korean = decksForLanguage("ko", readSlideDecks({ includeDrafts: true }));
    assert.equal(
      english.some((deck) => deck.slug === "sample"),
      false,
    );
    const sample = korean.find((deck) => deck.slug === "sample");
    assert.ok(sample);
    assert.equal(sample.draft, true);
    assert.ok(sample.slideCount >= 8);
    assert.equal(marpCssIsScoped(sample.css), true);
    const html = sample.slides.join("\n");
    assert.match(html, /<table/);
    assert.match(html, /class="cards"/);
    assert.match(html, /class="vs"/);
    assert.match(html, /\/slides-assets\/sample\/img\/sample-flow\.svg/);
    assert.match(html, /\/slides-assets\/sample\/img\/swatch\.webp/);
    assert.match(html, /loading="lazy"/);
  } finally {
    if (previous === undefined) {
      delete process.env.SHOW_DRAFTS;
    } else {
      process.env.SHOW_DRAFTS = previous;
    }
    clearSlideCache();
  }
});
