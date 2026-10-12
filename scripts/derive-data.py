"""Derive navigable, checked-in indexes from the original Quanta archive."""
import json
from pathlib import Path
from lxml import html

root = Path(__file__).resolve().parents[1]
pages = json.loads((root / 'src/content/legacy-pages.json').read_text(encoding='utf-8'))
page = html.fragment_fromstring(pages['index.html']['html'], create_parent='main')
labels = ['Physics & Mathematics', 'Historical Papers', 'Special Topics']
circles = []
for label, section in zip(labels, page.xpath('.//*[@id="circles"]//*[contains(concat(" ", normalize-space(@class), " "), " accordion-item ")]')):
    items = []
    for anchor in section.xpath('.//a[@href]'):
        href = anchor.get('href')
        if href and href.endswith('.html'):
            items.append({'title': anchor.text_content().strip(), 'href': href})
    circles.append({'label': label, 'items': items})
news = [
    {'title': 'New Study Circles!', 'date': '15 Sep 2025', 'summary': "We're considering some new study circles as the new semester starts.", 'image': 'images/quanta-logo.png', 'href': 'news/02.html'},
    {'title': 'Weekly Schedule', 'date': '12 Sep 2025', 'summary': 'The schedule of circles of this week', 'image': 'images/22 - 28 Shahrivar 1404.png', 'href': 'news/01.html'},
]
gallery = [{'src': 'images/gallery/' + str(n) + '.jpg', 'caption': 'Quanta study circles · 2020'} for n in range(7, 0, -1)]
(root / 'src/content/catalog.json').write_text(json.dumps({'circles': circles, 'news': news, 'gallery': gallery}, ensure_ascii=False, indent=2), encoding='utf-8')
print('Derived', sum(len(x['items']) for x in circles), 'circle links')
