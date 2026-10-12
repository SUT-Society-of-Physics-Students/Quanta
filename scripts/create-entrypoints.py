"""Replace legacy page shells with Vite multi-page React entry points.
Content was extracted to src/content/legacy-pages.json before this script runs.
Preserves the original URLs (including case and the Phys&Math directory).
"""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
paths = ['index.html', 'all-news.html', 'gallery.html', 'people.html']
paths += [p.relative_to(root).as_posix() for folder in ('circles', 'news') for p in (root / folder).rglob('*.html')]
for path in paths:
    file = root / path
    if not file.exists():
        raise FileNotFoundError(file)
    # Read the current file before overwriting to avoid transforming a different page.
    original = file.read_text(encoding='utf-8')
    if '<main' not in original:
        raise ValueError(f'Expected legacy content in {path}')
    depth = len(Path(path).parts) - 1
    prefix = '../' * depth
    title = path.rsplit('/', 1)[-1].replace('.html', '').replace('-', ' ').title()
    file.write_text(f'''<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="quanta-root" content="{prefix or './'}" />
  <link rel="icon" href="{prefix}images/quanta-logo.png" />
  <title>{title} | Quanta — Sharif University of Technology</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="{prefix}src/main.tsx"></script>
</body>
</html>
''', encoding='utf-8')
print(f'Created {len(paths)} React entry points at their original URLs')
