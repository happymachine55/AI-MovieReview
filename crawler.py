import json
from bs4 import BeautifulSoup
import requests

def crawl_movies():
    # 실제 크롤링 로직 (예시)
    data = {"movies": []}
    url = "https://movie-site.com"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 데이터 추출 예시
    for item in soup.select('.movie-item'):
        data["movies"].append({
            "title": item.select_one('.title').text,
            "rating": item.select_one('.rating').text
        })
    
    # 결과를 JSON 파일로 저장
    with open('movie_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)

if __name__ == '__main__':
    crawl_movies()
