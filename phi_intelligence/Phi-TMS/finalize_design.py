#!/usr/bin/env python3
"""Final design system touch-ups"""
import re
from pathlib import Path

REPLACEMENTS = [
    # Page wrappers
    (r'className="p-6 max-w-', 'className="col-span-12 max-w-'),
    
    # More text colors
    (r'text-gray-400', 'text-text-muted'),
    (r'text-blue-600', 'text-text-primary'),
    
    # Button styles
    (r'rounded-md', 'rounded-lg'),
]

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        original = content
        for pattern, replacement in REPLACEMENTS:
            content = re.sub(pattern, replacement, content)
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    except:
        return False

files = list(Path('frontend/src/pages').rglob('*.tsx'))
files += list(Path('frontend/src/components').rglob('*.tsx'))

updated = 0
for f in files:
    if process_file(f):
        updated += 1
print(f"Updated {updated} files")

