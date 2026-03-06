import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Replace weird characters
content = content.replace('\u2500', '-') # dash like
content = content.replace('──', '--')

# Fix FontLoader structure
# Make sure it is exactly one style tag with dangerouslySetInnerHTML
content = re.sub(
    r'const FontLoader = \(\) => \(([\s\S]*?)<style dangerouslySetInnerHTML=\{([\s\S]*?)\}([\s\S]*?)\);',
    r'const FontLoader = () => (\n  <style dangerouslySetInnerHTML={\2} />\n);',
    content
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
