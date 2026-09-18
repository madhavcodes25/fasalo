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

mapping = {
    "1500937386664-56d1dfef3854": "https://picsum.photos/seed/farm1",
    "1623227773543-7e0edc26b1b5": "https://picsum.photos/seed/escrow",
    "1627483262769-04d0a1401487": "https://picsum.photos/seed/truck",
    "1586771107445-d3ca888129ff": "https://picsum.photos/seed/ai",
    "1625246333195-78d9c38ad449": "https://picsum.photos/seed/field2",
    "1592982537447-7440770cbfc9": "https://picsum.photos/seed/veg1",
    "1595855759920-86582396756a": "https://picsum.photos/seed/veg2",
    "1628689469838-524a4a973b8e": "https://picsum.photos/seed/logistics",
    "1546470427-227c7b10a2d0": "https://picsum.photos/seed/tomato",
    "1618512496248-a07f5621a0a1": "https://picsum.photos/seed/onion",
    "1518977676823-6afe2b6b4d0f": "https://picsum.photos/seed/potato",
}

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # regex to match https://images.unsplash.com/photo-[ID]?[params]
    # We will replace it with the mapped URL + /width/height
    
    def repl(m):
        photo_id = m.group(1)
        params = m.group(2)
        base = mapping.get(photo_id, "https://picsum.photos/seed/" + photo_id[:6])
        
        # parse w= and h= from params if possible, default to 800/600
        w = 800
        h = 600
        
        w_match = re.search(r'w=(\d+)', params)
        if w_match:
            w = int(w_match.group(1))
            h = int(w * 0.75) # 4:3 aspect ratio
            
        return f"{base}/{w}/{h}"
        
    new_content = re.sub(r'https://images\.unsplash\.com/photo-([^?]+)\??([^"]*)', repl, content)
    
    with open(filepath, 'w') as f:
        f.write(new_content)

print("Images replaced.")
