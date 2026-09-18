import urllib.request

urls = [
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=75",
    "https://images.unsplash.com/photo-1623227773543-7e0edc26b1b5?w=400&q=75",
    "https://images.unsplash.com/photo-1627483262769-04d0a1401487?w=400&q=75",
    "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&q=75",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=50",
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&q=80",
    "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&q=80",
    "https://images.unsplash.com/photo-1628689469838-524a4a973b8e?w=400&q=80",
    "https://images.unsplash.com/photo-1546470427-227c7b10a2d0?w=300&q=75",
    "https://images.unsplash.com/photo-1618512496248-a07f5621a0a1?w=300&q=75",
    "https://images.unsplash.com/photo-1518977676823-6afe2b6b4d0f?w=300&q=75",
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print(f"OK: {url}")
    except Exception as e:
        print(f"FAILED: {url} - {e}")
