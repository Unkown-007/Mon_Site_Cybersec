/*
 * Hachage côté client. SHA-1/256/512 via Web Crypto, MD5 via implémentation
 * locale (SubtleCrypto ne fournit pas MD5). Utilisé par /toolkit et le terminal.
 */

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export async function sha(
  algo: "SHA-1" | "SHA-256" | "SHA-512",
  text: string
): Promise<string> {
  const data = new TextEncoder().encode(text);
  return toHex(await crypto.subtle.digest(algo, data as unknown as BufferSource));
}

// MD5 — implémentation classique compacte.
export function md5(str: string): string {
  function rl(n: number, c: number) {
    return (n << c) | (n >>> (32 - c));
  }
  function add(x: number, y: number) {
    const l = (x & 0xffff) + (y & 0xffff);
    return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xffff);
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return add(rl(add(add(a, q), add(x, t)), s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function toBlocks(s: string) {
    const n = s.length;
    const blks: number[] = [];
    for (let i = 0; i < n * 8; i += 8) blks[i >> 5] |= (s.charCodeAt(i / 8) & 0xff) << i % 32;
    blks[(n * 8) >> 5] |= 0x80 << (n * 8) % 32;
    blks[(((n * 8 + 64) >>> 9) << 4) + 14] = n * 8;
    return blks;
  }
  const x = toBlocks(unescape(encodeURIComponent(str)));
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  for (let i = 0; i < x.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a, b, c, d, x[i] | 0, S[0], -680876936);
    d = ff(d, a, b, c, x[i + 1] | 0, S[1], -389564586);
    c = ff(c, d, a, b, x[i + 2] | 0, S[2], 606105819);
    b = ff(b, c, d, a, x[i + 3] | 0, S[3], -1044525330);
    a = ff(a, b, c, d, x[i + 4] | 0, S[0], -176418897);
    d = ff(d, a, b, c, x[i + 5] | 0, S[1], 1200080426);
    c = ff(c, d, a, b, x[i + 6] | 0, S[2], -1473231341);
    b = ff(b, c, d, a, x[i + 7] | 0, S[3], -45705983);
    a = ff(a, b, c, d, x[i + 8] | 0, S[0], 1770035416);
    d = ff(d, a, b, c, x[i + 9] | 0, S[1], -1958414417);
    c = ff(c, d, a, b, x[i + 10] | 0, S[2], -42063);
    b = ff(b, c, d, a, x[i + 11] | 0, S[3], -1990404162);
    a = ff(a, b, c, d, x[i + 12] | 0, S[0], 1804603682);
    d = ff(d, a, b, c, x[i + 13] | 0, S[1], -40341101);
    c = ff(c, d, a, b, x[i + 14] | 0, S[2], -1502002290);
    b = ff(b, c, d, a, x[i + 15] | 0, S[3], 1236535329);
    a = gg(a, b, c, d, x[i + 1] | 0, S[4], -165796510);
    d = gg(d, a, b, c, x[i + 6] | 0, S[5], -1069501632);
    c = gg(c, d, a, b, x[i + 11] | 0, S[6], 643717713);
    b = gg(b, c, d, a, x[i] | 0, S[7], -373897302);
    a = gg(a, b, c, d, x[i + 5] | 0, S[4], -701558691);
    d = gg(d, a, b, c, x[i + 10] | 0, S[5], 38016083);
    c = gg(c, d, a, b, x[i + 15] | 0, S[6], -660478335);
    b = gg(b, c, d, a, x[i + 4] | 0, S[7], -405537848);
    a = gg(a, b, c, d, x[i + 9] | 0, S[4], 568446438);
    d = gg(d, a, b, c, x[i + 14] | 0, S[5], -1019803690);
    c = gg(c, d, a, b, x[i + 3] | 0, S[6], -187363961);
    b = gg(b, c, d, a, x[i + 8] | 0, S[7], 1163531501);
    a = gg(a, b, c, d, x[i + 13] | 0, S[4], -1444681467);
    d = gg(d, a, b, c, x[i + 2] | 0, S[5], -51403784);
    c = gg(c, d, a, b, x[i + 7] | 0, S[6], 1735328473);
    b = gg(b, c, d, a, x[i + 12] | 0, S[7], -1926607734);
    a = hh(a, b, c, d, x[i + 5] | 0, S[8], -378558);
    d = hh(d, a, b, c, x[i + 8] | 0, S[9], -2022574463);
    c = hh(c, d, a, b, x[i + 11] | 0, S[10], 1839030562);
    b = hh(b, c, d, a, x[i + 14] | 0, S[11], -35309556);
    a = hh(a, b, c, d, x[i + 1] | 0, S[8], -1530992060);
    d = hh(d, a, b, c, x[i + 4] | 0, S[9], 1272893353);
    c = hh(c, d, a, b, x[i + 7] | 0, S[10], -155497632);
    b = hh(b, c, d, a, x[i + 10] | 0, S[11], -1094730640);
    a = hh(a, b, c, d, x[i + 13] | 0, S[8], 681279174);
    d = hh(d, a, b, c, x[i] | 0, S[9], -358537222);
    c = hh(c, d, a, b, x[i + 3] | 0, S[10], -722521979);
    b = hh(b, c, d, a, x[i + 6] | 0, S[11], 76029189);
    a = hh(a, b, c, d, x[i + 9] | 0, S[8], -640364487);
    d = hh(d, a, b, c, x[i + 12] | 0, S[9], -421815835);
    c = hh(c, d, a, b, x[i + 15] | 0, S[10], 530742520);
    b = hh(b, c, d, a, x[i + 2] | 0, S[11], -995338651);
    a = ii(a, b, c, d, x[i] | 0, S[12], -198630844);
    d = ii(d, a, b, c, x[i + 7] | 0, S[13], 1126891415);
    c = ii(c, d, a, b, x[i + 14] | 0, S[14], -1416354905);
    b = ii(b, c, d, a, x[i + 5] | 0, S[15], -57434055);
    a = ii(a, b, c, d, x[i + 12] | 0, S[12], 1700485571);
    d = ii(d, a, b, c, x[i + 3] | 0, S[13], -1894986606);
    c = ii(c, d, a, b, x[i + 10] | 0, S[14], -1051523);
    b = ii(b, c, d, a, x[i + 1] | 0, S[15], -2054922799);
    a = ii(a, b, c, d, x[i + 8] | 0, S[12], 1873313359);
    d = ii(d, a, b, c, x[i + 15] | 0, S[13], -30611744);
    c = ii(c, d, a, b, x[i + 6] | 0, S[14], -1560198380);
    b = ii(b, c, d, a, x[i + 13] | 0, S[15], 1309151649);
    a = ii(a, b, c, d, x[i + 4] | 0, S[12], -145523070);
    d = ii(d, a, b, c, x[i + 11] | 0, S[13], -1120210379);
    c = ii(c, d, a, b, x[i + 2] | 0, S[14], 718787259);
    b = ii(b, c, d, a, x[i + 9] | 0, S[15], -343485551);
    a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
  }
  const hex = (n: number) =>
    Array.from({ length: 4 }, (_, j) => ((n >> (j * 8)) & 0xff).toString(16).padStart(2, "0")).join("");
  return hex(a) + hex(b) + hex(c) + hex(d);
}
