# pr34 evidence

Playwright screenshots of news issue 2026-10-13 after the cards and matrix change, including the dark-mode mark fix.

`pages/` is the full issue page. The file name is `{ko|en}-{desktop|mobile-390|mobile-360}-{light|dark}.png`.

`compare/` puts the old PNG on the left and the new block on the right. The file name adds the item number, 1 through 5. Matrix items also have a `-viewport` file, which is the block at the real page width, including horizontal scroll.

`metrics.json` records page overflow, grid columns, and clipped text. The capture script stops if the page grows wider than the viewport, if cards are not 4 columns on desktop or 2 columns at 390 and 360, or if a label or cell is clipped.
