/**
 * WebKit sometimes leaves Marp's foreignObject HTML at the SVG user size
 * (1280) after the SVG box has been scaled down. A section that is already
 * near the SVG box must not get Marp's polyfill, or the slide shrinks twice.
 * @param {number} sectionWidth
 * @param {number} svgWidth
 * @param {number} userWidth
 */
export function sectionIsUnscaled(sectionWidth, svgWidth, userWidth) {
  return sectionWidth > svgWidth * 1.25 && sectionWidth > userWidth * 0.75;
}
