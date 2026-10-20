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

test("a year-month date is kept for the gallery", () => {
  const fields = parseDeckFields(
    {
      marp: true,
      theme: "presentation",
      size: "16:9",
      title: "Harness",
      date: "2026-06",
      description: "A talk.",
      lang: "ko",
    },
    "content/slides/harness-engineering/harness-engineering.md",
    "harness-engineering",
  );
  assert.equal(fields.date, "2026-06");
});

test("harness-engineering is published in Korean and English", () => {
  clearSlideCache();
  const previous = process.env.SHOW_DRAFTS;
  delete process.env.SHOW_DRAFTS;
  try {
    const published = readSlideDecks();
    const korean = published.find(
      (deck) => deck.slug === "harness-engineering" && deck.lang === "ko",
    );
    const english = published.find(
      (deck) => deck.slug === "harness-engineering" && deck.lang === "en",
    );
    assert.ok(korean);
    assert.ok(english);
    assert.equal(korean.draft, false);
    assert.equal(english.draft, false);
    assert.equal(korean.date, "2026-06");
    assert.equal(english.date, "2026-06");
    assert.equal(korean.slideCount, english.slideCount);
    assert.ok(korean.slideCount >= 40);
    assert.equal(marpCssIsScoped(korean.css), true);
    assert.equal(marpCssIsScoped(english.css), true);
    assert.match(korean.thumbnail, /\/slides-assets\/harness-engineering\/thumb-ko\.webp$/);
    assert.match(english.thumbnail, /\/slides-assets\/harness-engineering\/thumb-en\.webp$/);
    assert.match(korean.slides[0], /Harness Engineering/);
    assert.match(
      korean.slides.join("\n"),
      /\/slides-assets\/harness-engineering\/img\/09-pricing-table\.webp/,
    );
    assert.equal(
      published.some((deck) => deck.slug === "sample"),
      false,
    );
  } finally {
    if (previous === undefined) {
      delete process.env.SHOW_DRAFTS;
    } else {
      process.env.SHOW_DRAFTS = previous;
    }
    clearSlideCache();
  }
});

test("extra sample decks stay drafts and lists sort newest first", () => {
  clearSlideCache();
  const previous = process.env.SHOW_DRAFTS;
  delete process.env.SHOW_DRAFTS;
  try {
    const published = readSlideDecks();
    assert.equal(published.some((deck) => deck.slug === "frame-time"), false);
    assert.equal(published.some((deck) => deck.slug === "short-context"), false);
    const korean = decksForLanguage("ko", readSlideDecks({ includeDrafts: true }));
    const dates = korean.map((deck) => deck.date);
    assert.deepEqual(dates, [...dates].sort((a, b) => b.localeCompare(a)));
    for (const slug of ["frame-time", "short-context"]) {
      const deck = korean.find((item) => item.slug === slug);
      assert.ok(deck);
      assert.equal(deck.draft, true);
      assert.ok(deck.description.length > 0);
      assert.ok(deck.slideCount >= 8);
      assert.match(deck.thumbnail, new RegExp(`thumb-ko\\.webp$`));
    }
    const english = decksForLanguage("en", readSlideDecks({ includeDrafts: true }));
    assert.equal(english.some((deck) => deck.slug === "sample"), false);
    assert.ok(english.some((deck) => deck.slug === "frame-time" && deck.lang === "en"));
    assert.ok(english.some((deck) => deck.slug === "short-context" && deck.lang === "en"));
  } finally {
    if (previous === undefined) {
      delete process.env.SHOW_DRAFTS;
    } else {
      process.env.SHOW_DRAFTS = previous;
    }
    clearSlideCache();
  }
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
