import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# Fix functional component typings
content = re.sub(r'const (Icon|ArrowRight|Search|CheckCircle|Handshake|Building|Heart|Users|Globe|MapPin|Phone|Menu|X|Star|ChevronDown|Logo) = \((.*?)\) =>', r'const \1 = (\2: any) =>', content)
content = re.sub(r'function AnimatedCounter\((.*?)\) \{', r'function AnimatedCounter(\1: any) {', content)
content = re.sub(r'function FAQItem\((.*?)\) \{', r'function FAQItem(\1: any) {', content)
content = content.replace('const scrollTo = (e, id) => {', 'const scrollTo = (e: any, id: string) => {')

# Fix EventTarget type issue for style and parentNode
content = content.replace('onError={e => { e.target.style', 'onError={(e: any) => { e.target.style')

# Fix number to string assignability in opacity
content = content.replace('e.currentTarget.style.opacity = 1', 'e.currentTarget.style.opacity = "1"')
content = content.replace('e.currentTarget.style.opacity = 0', 'e.currentTarget.style.opacity = "0"')

# Fix style2 error (likely a typo, merge styles or just change it to a data attribute if it was meant to be ignored)
# Actually, since style already exists on that element, combining it is best
content = content.replace('cursor: "default" }}\n                onMouseEnter={e => e.currentTarget.style.background = FM}\n                onMouseLeave={e => e.currentTarget.style.background = FD}\n                style2={{ transition: "background 0.25s ease" }}>',
                          'cursor: "default", transition: "background 0.25s ease" }}\n                onMouseEnter={(e: any) => e.currentTarget.style.background = FM}\n                onMouseLeave={(e: any) => e.currentTarget.style.background = FD}>')

with open("src/app/page.tsx", "w") as f:
    f.write(content)
