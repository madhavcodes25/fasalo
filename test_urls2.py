import urllib.request

urls = [
    "https://upload.wikimedia.org/wikipedia/commons/2/25/Onion_on_White.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/a/ab/Patates.jpg",
    "https://images.unsplash.com/photo-1542838132-92c53300491e", # produce/grocery
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2", # agriculture/field
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399", # field/harvest
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print("OK:", url)
    except Exception as e:
        print("FAILED:", url, str(e))
