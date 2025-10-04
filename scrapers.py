import requests
from bs4 import BeautifulSoup

def scrape_listings_for_locality(locality: str, budget: int, max_results: int = 10):
    results = []
    # Example scraping from 99acres or magicbricks (simplified)
    search_url = f"https://www.99acres.com/search/property/buy/{locality}?budget={budget}"
    
    try:
        response = requests.get(search_url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            
            listings = soup.find_all("a", class_="projectTuple__projectName", limit=max_results)
            for listing in listings:
                results.append({
                    "title": listing.text.strip(),
                    "link": listing.get("href")
                })
        else:
            results.append({"error": f"Failed to fetch listings: {response.status_code}"})
    except Exception as e:
        results.append({"error": str(e)})
    
    return results
