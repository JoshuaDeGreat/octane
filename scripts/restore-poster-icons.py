"""Extract classic poster icons from existing Nitro bundles without redrawing artwork.
Run from the repository root. Only successfully decoded PNG spritesheets are saved.
"""
import base64
import concurrent.futures
import json
import struct
import subprocess
import zlib
from pathlib import Path

IDS = list(range(1, 59)) + list(range(500, 519)) + [520, 521, 522, 523, 599] + list(range(1000, 1007)) + list(range(2000, 2009))
SOURCE = 'https://octane-game-assets.joshua-h1997.workers.dev/client/nitro/bundled/furniture/poster{}.nitro'
OUTPUT = Path('public/images/classic-posters')

def extract(number):
    bundle = subprocess.run(['curl', '--fail', '--silent', '--show-error', '--max-time', '20', SOURCE.format(number)],
                            check=True, capture_output=True).stdout
    count = struct.unpack_from('>H', bundle)[0]
    if count > 8:
        raise ValueError('Unexpected bundle')
    position, metadata, image = 2, None, None
    for _ in range(count):
        length = struct.unpack_from('>H', bundle, position)[0]
        position += 2
        name = bundle[position:position + length].decode()
        position += length
        size = struct.unpack_from('>I', bundle, position)[0]
        position += 4
        raw = zlib.decompress(bundle[position:position + size])
        position += size
        if name.endswith('.json'):
            metadata = json.loads(raw)
        elif name.endswith('.png'):
            image = raw
    if not metadata or not image or not image.startswith(b'\x89PNG\r\n\x1a\n'):
        raise ValueError('Missing PNG artwork')
    sheet = metadata['spritesheet']
    icons = [entry['frame'] for name, entry in sheet['frames'].items() if '_icon_' in name]
    if len(icons) != 1:
        raise ValueError('Ambiguous icon frame')
    frame, size = icons[0], sheet['meta']['size']
    encoded = base64.b64encode(image).decode()
    # A viewBox crops the existing sheet to its original icon frame.
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{frame["w"]}" height="{frame["h"]}" '
           f'viewBox="{frame["x"]} {frame["y"]} {frame["w"]} {frame["h"]}" overflow="hidden">'
           f'<image width="{size["w"]}" height="{size["h"]}" href="data:image/png;base64,{encoded}"/></svg>\n')
    return number, svg

if __name__ == '__main__':
    OUTPUT.mkdir(parents=True, exist_ok=True)
    restored, missing = [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(extract, number): number for number in IDS}
        for future in concurrent.futures.as_completed(futures):
            number = futures[future]
            try:
                _, svg = future.result()
                (OUTPUT / f'{number}.svg').write_text(svg)
                restored.append(number)
            except Exception as error:
                missing.append({'poster': number, 'error': str(error)})
    restored.sort()
    Path('src/api/catalog/classicPosterIds.json').write_text(json.dumps(restored) + '\n')
    print(json.dumps({'restored': len(restored), 'missing': missing}))
