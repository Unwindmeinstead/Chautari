import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

content = content.replace('const Menu = (: any) =>', 'const Menu = () =>')
content = content.replace('const X = (: any) =>', 'const X = () =>')

with open("src/app/page.tsx", "w") as f:
    f.write(content)
