import re
with open('src/app/page.tsx', 'r') as f:
    text = f.read()

text = re.sub(r'const FontLoader = \(\) => \(([\s\S]*?)<style dangerouslySetInnerHTML=', r'const FontLoader = () => (\n  <style dangerouslySetInnerHTML=', text)

with open('src/app/page.tsx', 'w') as f:
    f.write(text)
