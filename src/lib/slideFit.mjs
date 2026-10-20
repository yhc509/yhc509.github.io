/**
 * WebKit lays a Marp section out at the SVG user size (offsetWidth 1280)
 * and does not scale that HTML with the viewBox. zoom uses the SVG's CSS
 * box, and a second pass stays stable because offsetWidth does not change.
 * @param {number} svgClientWidth
 * @param {number} sectionOffsetWidth
 */
export function webkitSlideZoom(svgClientWidth, sectionOffsetWidth) {
  if (!(svgClientWidth >= 2) || !(sectionOffsetWidth >= 2)) {
    return "";
  }
  return String(svgClientWidth / sectionOffsetWidth);
}
