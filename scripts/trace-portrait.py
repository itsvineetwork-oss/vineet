"""Turns a pencil sketch into stroke paths the drawing engine can animate.

  python3 scripts/trace-portrait.py assets/portrait-source.jpg src/data/portrait.json

Output (280 x 340 box): `contours` = the sketch's own pencil lines, thinned and chained into polylines;
`hatch` / `cross` = tone shading as one path per hatch line (several segments each).
"""
import json, sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

src, out = sys.argv[1], sys.argv[2]
W, H = 280, 340
R = 2  # working resolution multiplier

im = Image.open(src).convert("L")
im = ImageOps.fit(im, (W * R, H * R), Image.LANCZOS, centering=(0.5, 0.35))
im = ImageOps.autocontrast(im, cutoff=1)
g = np.asarray(im, dtype=np.float32) / 255.0
dark = 1.0 - g
soft = 1.0 - np.asarray(im.filter(ImageFilter.GaussianBlur(2.5)), dtype=np.float32) / 255.0

# ---------- 1. the pencil lines: binarize, thin (Zhang-Suen), chain into polylines
binary = (dark > 0.62).astype(np.uint8)  # only the firm pencil lines; soft tone is left to the hatching

def zhang_suen(img):
    img = img.copy()
    changed = True
    while changed:
        changed = False
        for step in (0, 1):
            P = np.pad(img, 1)
            p2 = P[:-2, 1:-1]; p3 = P[:-2, 2:]; p4 = P[1:-1, 2:]; p5 = P[2:, 2:]
            p6 = P[2:, 1:-1]; p7 = P[2:, :-2]; p8 = P[1:-1, :-2]; p9 = P[:-2, :-2]
            nb = [p2, p3, p4, p5, p6, p7, p8, p9]
            B = sum(n.astype(np.int16) for n in nb)
            seq = nb + [p2]
            A = sum(((seq[i] == 0) & (seq[i + 1] == 1)).astype(np.int16) for i in range(8))
            c1 = (p2 * p4 * p6 == 0) if step == 0 else (p2 * p4 * p8 == 0)
            c2 = (p4 * p6 * p8 == 0) if step == 0 else (p2 * p6 * p8 == 0)
            m = (img == 1) & (B >= 2) & (B <= 6) & (A == 1) & c1 & c2
            if m.any():
                img[m] = 0
                changed = True
    return img

skel = zhang_suen(binary)
h, w = skel.shape
mask = skel.astype(bool)
visited = np.zeros_like(mask)
NB = [(0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)]

def walk(y, x):
    pts = [(x, y)]
    while True:
        found = False
        for dy, dx in NB:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not visited[ny, nx]:
                visited[ny, nx] = True
                pts.append((nx, ny)); y, x = ny, nx; found = True
                break
        if not found:
            return pts

def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    n = (dx * dx + dy * dy) ** 0.5 or 1e-9
    d = [abs(dy * (x - x1) - dx * (y - y1)) / n for x, y in pts]
    i = int(np.argmax(d))
    if d[i] > eps:
        return rdp(pts[: i + 1], eps)[:-1] + rdp(pts[i:], eps)
    return [pts[0], pts[-1]]

# start chains at endpoints (pixels with one neighbour) first, then anything left
P = np.pad(mask.astype(np.int16), 1)
ncount = sum(np.roll(np.roll(P, dy, 0), dx, 1) for dy, dx in NB)[1:-1, 1:-1]
order = list(zip(*np.nonzero(mask & (ncount == 1)))) + list(zip(*np.nonzero(mask)))
contours = []
for y, x in order:
    if visited[y, x]:
        continue
    visited[y, x] = True
    pts = walk(y, x)
    if len(pts) >= 14:
        pts = rdp(pts, 1.1)
        contours.append([[round(x / R, 1), round(y / R, 1)] for x, y in pts])

contours.sort(key=lambda c: -sum(((c[i][0]-c[i-1][0])**2 + (c[i][1]-c[i-1][1])**2) ** 0.5 for i in range(1, len(c))))
contours = contours[:480]

# ---------- 2. tone: hatch lines through the soft darkness; one path per line
def hatch(angle_deg, step, thresh, min_len):
    paths = []
    a = np.deg2rad(angle_deg)
    ca, sa = np.cos(a), np.sin(a)
    diag = int((W * W + H * H) ** 0.5) + 10
    for off in range(-diag, diag, step):
        segs, run = [], None
        for t in range(-diag, diag):
            x = W / 2 + t * ca - off * sa
            y = H / 2 + t * sa + off * ca
            inside = 0 <= x < W and 0 <= y < H
            d = soft[int(y * R), int(x * R)] if inside else 0.0
            if inside and d > thresh:
                if run is None: run = [x, y, x, y]
                else: run[2], run[3] = x, y
            elif run is not None:
                if ((run[2]-run[0])**2 + (run[3]-run[1])**2) ** 0.5 >= min_len:
                    segs.append([round(v, 1) for v in run])
                run = None
        if segs:
            paths.append(segs)
    return paths

hatch1 = hatch(-40, 3, 0.28, 3)
hatch2 = hatch(48, 4, 0.52, 3)

json.dump({"w": W, "h": H, "contours": contours, "hatch": hatch1, "cross": hatch2}, open(out, "w"), separators=(",", ":"))
print(f"contours {len(contours)}  hatch lines {len(hatch1)}  cross lines {len(hatch2)}  ->  {out}")
