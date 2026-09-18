import os
import re

files = [
    "frontend/src/app/signup/page.tsx",
    "frontend/src/app/advisories/page.tsx",
    "frontend/src/app/dashboard/page.tsx",
    "frontend/src/app/browse/page.tsx",
    "frontend/src/app/orders/page.tsx",
    "frontend/src/app/page.tsx",
    "frontend/src/app/logistics/page.tsx",
    "frontend/src/app/login/page.tsx"
]

# We need to replace all picsum.photos URLs with the appropriate ones.
# In the previous script we mapped:
# "https://picsum.photos/seed/farm1" -> 1500937386664-56d1dfef3854
# "https://picsum.photos/seed/escrow" -> 1623227773543-7e0edc26b1b5
# "https://picsum.photos/seed/truck" -> 1627483262769-04d0a1401487
# "https://picsum.photos/seed/ai" -> 1586771107445-d3ca888129ff
# "https://picsum.photos/seed/field2" -> 1625246333195-78d9c38ad449
# "https://picsum.photos/seed/veg1" -> 1592982537447-7440770cbfc9
# "https://picsum.photos/seed/veg2" -> 1595855759920-86582396756a
# "https://picsum.photos/seed/logistics" -> 1628689469838-524a4a973b8e
# "https://picsum.photos/seed/tomato" -> 1546470427-227c7b10a2d0
# "https://picsum.photos/seed/onion" -> 1618512496248-a07f5621a0a1
# "https://picsum.photos/seed/potato" -> 1518977676823-6afe2b6b4d0f

mapping = {
    "farm1": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80",
    "escrow": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80", # new working image
    "truck": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80", # new working truck
    "ai": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80", # general produce
    "field2": "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1920&q=80", # new working field
    "veg1": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80",
    "veg2": "https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&q=80",
    "logistics": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80",
    "tomato": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=75", # working tomato
    "onion": "https://upload.wikimedia.org/wikipedia/commons/2/25/Onion_on_White.JPG", # wikimedia onion
    "potato": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Patates.jpg", # wikimedia potato
}

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    def repl(m):
        seed = m.group(1)
        return mapping.get(seed, m.group(0)) # If found, return mapped URL, else original
        
    new_content = re.sub(r'https://picsum\.photos/seed/([a-zA-Z0-9_]+)(?:/\d+/\d+)?', repl, content)
    
    with open(filepath, 'w') as f:
        f.write(new_content)

print("Images restored to working Unsplash/Wikimedia URLs.")
