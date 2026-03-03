#!/usr/bin/env python3
import urllib.request
import json

url = "https://api.viator.com/partner/products/156455P1?target-lander=NONE"
req = urllib.request.Request(url, headers={
    "exp-api-key": "0a9b6163-6d27-4f03-bab6-e5debd3d7a8c",
    "Accept": "application/json;version=2.0",
    "Accept-Language": "en-US",
})

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    product_url = data.get("productUrl", "NOT FOUND")
    
    # Write result
    with open("/Users/francisco/Documents/bored.-experience-dashboard/_viator_result.txt", "w") as f:
        f.write("WITH target-lander=NONE:\n")
        f.write(product_url + "\n\n")

# Now fetch WITHOUT target-lander=NONE for comparison
url2 = "https://api.viator.com/partner/products/156455P1"
req2 = urllib.request.Request(url2, headers={
    "exp-api-key": "0a9b6163-6d27-4f03-bab6-e5debd3d7a8c",
    "Accept": "application/json;version=2.0",
    "Accept-Language": "en-US",
})

with urllib.request.urlopen(req2) as resp2:
    data2 = json.loads(resp2.read().decode())
    product_url2 = data2.get("productUrl", "NOT FOUND")
    
    with open("/Users/francisco/Documents/bored.-experience-dashboard/_viator_result.txt", "a") as f:
        f.write("WITHOUT target-lander=NONE:\n")
        f.write(product_url2 + "\n")

print("Done - results written to _viator_result.txt")
