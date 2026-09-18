import urllib.request

urls = [
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea", # tomato
    "https://images.unsplash.com/photo-1561136594-7f68413baa99", # tomato
    "https://images.unsplash.com/photo-1618512496248-a07f5621a0a1", # onion
    "https://images.unsplash.com/photo-1518977676823-6afe2b6b4d0f", # potato
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854", # farmer
    "https://images.unsplash.com/photo-1595855759920-86582396756a", # farm
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9", # farm
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7", # truck
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print("OK:", url)
    except Exception as e:
        print("FAILED:", url, str(e))
