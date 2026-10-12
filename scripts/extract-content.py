"""One-time migration: retain existing article HTML as trusted, checked-in React content.

Run against the original static HTML before replacing entry points. The resulting JSON
contains only <main> content; no inline scripts, event handlers, navigation or footer.
"""
import json
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from lxml import html

root = Path(__file__).resolve().parents[1]
pages = {}
for file in sorted(root.glob('**/*.html')):
    if any(part in {'node_modules', 'dist', 'legacy'} for part in file.parts):
        continue
    relative = file.relative_to(root).as_posix()
    document = html.parse(str(file))
    main = document.find('.//main')
    if main is None:
        continue
    for bad in main.xpath('.//script|.//style|.//iframe'):
        bad.drop_tree()
    for element in main.iter():
        for attribute in list(element.attrib):
            if attribute.lower().startswith('on'):
                del element.attrib[attribute]
        for attribute in ('src', 'href'):
            value = element.get(attribute)
            if not value or value.startswith(('#', 'mailto:', 'tel:', 'http://', 'https://')):
                continue
            if value.startswith(('javascript:', 'data:')):
                del element.attrib[attribute]
                continue
            # Join against the original document path, not the generated content location.
            target = urljoin('https://quanta.invalid/' + relative, value)
            parts = urlsplit(target)
            if parts.netloc == 'quanta.invalid':
                element.set(attribute, parts.path.lstrip('/') + (('?' + parts.query) if parts.query else '') + (('#' + parts.fragment) if parts.fragment else ''))
    title = document.find('.//title')
    heading = main.xpath('.//h1')
    pages[relative] = {
        'title': (heading[0].text_content() if heading else (title.text if title is not None else 'Quanta')).strip(),
        'html': ''.join(html.tostring(child, encoding='unicode', method='html') for child in main)
    }
output = root / 'src' / 'content' / 'legacy-pages.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Extracted {len(pages)} legacy pages into {output}')
