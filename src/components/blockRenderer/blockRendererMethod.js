export const isLight = hex => {
  // hex - #12345678
  let c = hex.substring(1, 7)
  let rgb = parseInt(c, 16)

  let luminance =
    0.2126 * ((rgb >> 16) & 0xff) + // r
    0.7152 * ((rgb >> 8) & 0xff) + // g
    0.0722 * ((rgb >> 0) & 0xff) // b
  return luminance > 220
}
