export const isLight = hex => {
  // hex - #12345678
  let c = hex.substring(1)
  let rgb = parseInt(c, 16)
  let a = (rgb >> 0) & 0xff

  let luminance =
    ((0.2126 * ((rgb >> 24) & 0xff) + // r
      0.7152 * ((rgb >> 16) & 0xff) + // g
      0.0722 * ((rgb >> 8) & 0xff)) * // b
      a) /
      255 +
    (255 - a)

  return luminance > 220
}
