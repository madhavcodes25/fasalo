import urllib.request

url = "https://loremflickr.com/800/600/farmer"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    print("OK:", res.geturl())
except Exception as e:
    print("FAILED:", e)
