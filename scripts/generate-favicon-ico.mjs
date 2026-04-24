// Generates app/favicon.ico from the Grid Bloom spec — pure Node.js, no deps
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'app', 'favicon.ico')

// ── Grid Bloom circles (viewBox 0 0 32 32) ────────────────────
const CIRCLES = [
  { cx: 16,   cy: 16,   r: 2.5 },
  { cx: 16,   cy: 7,    r: 3.5 },
  { cx: 23.8, cy: 11.5, r: 3.5 },
  { cx: 23.8, cy: 20.5, r: 3.5 },
  { cx: 16,   cy: 25,   r: 3.5 },
  { cx: 8.2,  cy: 20.5, r: 3.5 },
  { cx: 8.2,  cy: 11.5, r: 3.5 },
]

function inAnyCircle(px, py) {
  // Use pixel center for better sub-pixel accuracy
  const x = px + 0.5
  const y = py + 0.5
  return CIRCLES.some(c => (x - c.cx) ** 2 + (y - c.cy) ** 2 <= c.r ** 2)
}

// ── Render 32×32 BGRA pixel buffer ───────────────────────────
const SIZE = 32
const pixels = Buffer.alloc(SIZE * SIZE * 4)

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 4
    if (inAnyCircle(x, y)) {
      pixels[i]   = 0x76  // B  (#00E676)
      pixels[i+1] = 0xE6  // G
      pixels[i+2] = 0x00  // R
      pixels[i+3] = 0xFF  // A
    } else {
      pixels[i]   = 0x0A  // B  (#0A0A0A)
      pixels[i+1] = 0x0A  // G
      pixels[i+2] = 0x0A  // R
      pixels[i+3] = 0xFF  // A
    }
  }
}

// ── Flip rows bottom-to-top (BMP stores bottom-first) ─────────
const rowBytes = SIZE * 4
const flipped = Buffer.alloc(pixels.length)
for (let y = 0; y < SIZE; y++) {
  pixels.copy(flipped, (SIZE - 1 - y) * rowBytes, y * rowBytes, (y + 1) * rowBytes)
}

// ── AND mask (32 rows × 4 bytes, all 0 = fully opaque) ────────
const andMask = Buffer.alloc(SIZE * 4)

// ── BITMAPINFOHEADER (40 bytes) ───────────────────────────────
const dibHeader = Buffer.alloc(40)
dibHeader.writeUInt32LE(40, 0)               // biSize
dibHeader.writeInt32LE(SIZE, 4)              // biWidth
dibHeader.writeInt32LE(SIZE * 2, 8)          // biHeight (XOR + AND, doubled)
dibHeader.writeUInt16LE(1, 12)               // biPlanes
dibHeader.writeUInt16LE(32, 14)              // biBitCount
dibHeader.writeUInt32LE(0, 16)               // biCompression (BI_RGB)
dibHeader.writeUInt32LE(flipped.length + andMask.length, 20) // biSizeImage

const bmpData = Buffer.concat([dibHeader, flipped, andMask])

// ── ICO container ─────────────────────────────────────────────
const icoHeader = Buffer.alloc(6)
icoHeader.writeUInt16LE(0, 0)   // Reserved
icoHeader.writeUInt16LE(1, 2)   // Type: 1 = ICO
icoHeader.writeUInt16LE(1, 4)   // ImageCount: 1

const icoEntry = Buffer.alloc(16)
icoEntry[0] = SIZE   // Width
icoEntry[1] = SIZE   // Height
icoEntry[2] = 0      // ColorCount (0 = 256+)
icoEntry[3] = 0      // Reserved
icoEntry.writeUInt16LE(1, 4)             // Planes
icoEntry.writeUInt16LE(32, 6)            // BitCount
icoEntry.writeUInt32LE(bmpData.length, 8)  // BytesInRes
icoEntry.writeUInt32LE(22, 12)           // ImageOffset (6 header + 16 entry)

const ico = Buffer.concat([icoHeader, icoEntry, bmpData])
writeFileSync(OUT, ico)
console.log(`✓ favicon.ico generado — ${ico.length} bytes`)
