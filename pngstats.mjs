// pngstats.mjs - code-only check of captured PNGs (no image library): parse the
// IHDR, inflate the IDAT stream and report mean luminance plus per-region means.
// Usage: node pngstats.mjs file.png [x,y,w,h ...]
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

function decode(file) {
  const buf = readFileSync(file);
  let p = 8, w = 0, h = 0, bd = 0, ct = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      bd = data[8]; ct = data[9];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (bd !== 8 || ct !== 2) throw new Error('only 8-bit RGB supported: ' + bd + '/' + ct);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * 3;
  const px = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= 3 ? cur[i - 3] : 0;
      const b = prev[i];
      const c = i >= 3 ? prev[i - 3] : 0;
      let v = line[i];
      if (ft === 1) v += a;
      else if (ft === 2) v += b;
      else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[i] = v & 255;
    }
    cur.copy(px, y * stride);
    prev = cur;
  }
  return { w, h, px, stride };
}

function stats(img, x0, y0, rw, rh) {
  let sum = 0, n = 0, dark = 0;
  for (let y = y0; y < y0 + rh; y++) {
    for (let x = x0; x < x0 + rw; x++) {
      const i = y * img.stride + x * 3;
      const l = 0.2126 * img.px[i] + 0.7152 * img.px[i + 1] + 0.0722 * img.px[i + 2];
      sum += l; n++;
      if (l < 12) dark++;
    }
  }
  return { mean: +(sum / n).toFixed(1), darkPct: +((dark / n) * 100).toFixed(1) };
}

const file = process.argv[2];
const img = decode(file);
const regions = [];
for (let i = 3; i < process.argv.length; i += 4) {
  regions.push([+process.argv[i], +process.argv[i + 1], +process.argv[i + 2], +process.argv[i + 3]]);
}
if (!regions.length) regions.push([0, 0, img.w, img.h]);
console.log(file, img.w + 'x' + img.h);
regions.forEach((r) => {
  const s = stats(img, r[0], r[1], r[2], r[3]);
  console.log('  region ' + r.join(',') + '  mean=' + s.mean + '  dark=' + s.darkPct + '%');
});