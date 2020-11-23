export const isLight = hex => {
  // hex - #12345678
  const rgba = getRGBAFromHex(hex)

  let luminance =
    ((0.2126 * rgba[0] + // r
      0.7152 * rgba[1] + // g
      0.0722 * rgba[2]) * // b
      rgba[3]) /
      255 +
    (255 - rgba[3])

  return luminance > 220
}

export const getRGBAFromHex = hex => {
  let c = hex.substring(1)
  let rgb = parseInt(c, 16)

  return [
    (rgb >> 24) & 0xff,
    (rgb >> 16) & 0xff,
    (rgb >> 8) & 0xff,
    (rgb >> 0) & 0xff,
  ]
}
