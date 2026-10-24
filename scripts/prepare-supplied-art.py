"""Make only border-connected white transparent; never generate character pixels.

Usage: python prepare-supplied-art.py SOURCE OUTPUT
Requires Pillow for this optional build-time preparation; the website itself
has no Python dependency. The outlined white clothing stays opaque because
it is not connected to the image border through near-white pixels.
"""
import argparse
from collections import deque
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source')
parser.add_argument('output')
args = parser.parse_args()
image = Image.open(args.source).convert('RGBA')
pixels = image.load()
width, height = image.size
queue = deque([(x,y) for x in range(width) for y in (0,height-1)] +
              [(x,y) for y in range(height) for x in (0,width-1)])
seen = set()
while queue:
    x,y = queue.popleft()
    if (x,y) in seen:
        continue
    seen.add((x,y))
    red,green,blue,alpha = pixels[x,y]
    # Flood only neutral near-white, protecting skin and purple sash shading.
    if min(red,green,blue) < 240 or max(red,green,blue)-min(red,green,blue) > 12:
        continue
    pixels[x,y] = (red,green,blue,0)
    for nx,ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
        if 0 <= nx < width and 0 <= ny < height:
            queue.append((nx,ny))
image.save(args.output)
print(f'Prepared {width} x {height} supplied artwork; character colors preserved.')
