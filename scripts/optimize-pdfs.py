from pathlib import Path
import logging
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DictionaryObject, NameObject

logging.getLogger('pypdf').setLevel(logging.ERROR)
total_before = total_after = 0
for path in Path('public/documents').glob('*.pdf'):
    before = path.stat().st_size
    total_before += before
    if before < 500_000:
        total_after += before
        continue
    original = PdfReader(path)
    original_text = [page.extract_text() for page in original.pages]
    writer = PdfWriter(clone_from=path)
    seen = set()
    for page in writer.pages:
        for item in list(page.images):
            identity = item.indirect_reference.idnum if item.indirect_reference else None
            if identity in seen or len(item.data) < 250_000:
                continue
            seen.add(identity)
            image = item.image.copy()
            image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
            if image.mode in ('RGBA', 'LA') or (image.mode == 'P' and 'transparency' in image.info):
                rgba = image.convert('RGBA')
                image = Image.new('RGB', rgba.size, 'white')
                image.paste(rgba, mask=rgba.getchannel('A'))
            else:
                image = image.convert('RGB')
            item.replace(image, quality=88, subsampling=0)
        page.compress_content_streams()
    for obj in writer._objects:
        if isinstance(obj, DictionaryObject):
            obj.pop('/PieceInfo', None)
    clean = PdfWriter()
    for page in writer.pages:
        clean.add_page(page)
    if '/OCProperties' in writer._root_object:
        clean._root_object[NameObject('/OCProperties')] = writer._root_object['/OCProperties'].clone(clean)
    writer = clean
    writer.compress_identical_objects()
    temp = path.with_suffix('.optimized.pdf')
    with temp.open('wb') as stream:
        writer.write(stream)
    optimized = PdfReader(temp)
    assert len(optimized.pages) == len(original.pages), path
    assert [page.extract_text() for page in optimized.pages] == original_text, path
    if temp.stat().st_size < before:
        temp.replace(path)
    else:
        temp.unlink()
    after = path.stat().st_size
    total_after += after
    print(f'{path.name}: {before:,} -> {after:,}', flush=True)
print(f'PDF total: {total_before:,} -> {total_after:,}', flush=True)
