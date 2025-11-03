# Python Examples

Python code for backend integrations and data analysis.

## Basic Usage

```python
import requests

def get_all_countries():
    """Fetch all countries with basic fields."""
    response = requests.get(
        'https://restcountries.com/v3.1/all',
        params={'fields': 'name,cca2,capital,population'}
    )
    response.raise_for_status()
    return response.json()

countries = get_all_countries()
print(f"Total countries: {len(countries)}")
```

---

## Country Service Class

```python
import requests
from typing import List, Dict, Optional
from functools import lru_cache
import time

class CountryService:
    """Service class for Countries REST API."""
    
    BASE_URL = 'https://restcountries.com/v3.1'
    
    def __init__(self, cache_ttl: int = 3600):
        self.session = requests.Session()
        self.cache_ttl = cache_ttl
    
    def _get(self, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """Make GET request with error handling."""
        url = f"{self.BASE_URL}/{endpoint}"
        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                raise ValueError(f"Country not found: {endpoint}")
            raise
        except requests.exceptions.RequestException as e:
            raise ConnectionError(f"API request failed: {e}")
    
    @lru_cache(maxsize=128)
    def get_all_countries(self, fields: Optional[str] = None) -> List[Dict]:
        """Get all countries."""
        params = {'fields': fields} if fields else {}
        return self._get('all', params)
    
    def search_by_name(self, name: str, exact: bool = False) -> List[Dict]:
        """Search countries by name."""
        params = {'fullText': 'true'} if exact else {}
        return self._get(f'name/{name}', params)
    
    def get_by_code(self, code: str) -> Dict:
        """Get country by ISO code."""
        return self._get(f'alpha/{code}')
    
    def get_by_region(self, region: str) -> List[Dict]:
        """Get countries by region."""
        return self._get(f'region/{region}')
```

### Usage
service = CountryService()
countries = service.get_all_countries(fields='name,capital,population')

## Flask API Endpoint

```python
from flask import Flask, jsonify, request
import requests
from functools import wraps
import time

app = Flask(__name__)

# Simple in-memory cache
cache = {}
CACHE_TTL = 3600

def cached(ttl):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            key = f"{f.__name__}:{args}:{kwargs}"
            now = time.time()
            
            if key in cache:
                data, timestamp = cache[key]
                if now - timestamp < ttl:
                    return data
            
            result = f(*args, **kwargs)
            cache[key] = (result, now)
            return result
        return wrapper
    return decorator

@cached(ttl=CACHE_TTL)
def fetch_countries(endpoint, params=None):
    url = f'https://restcountries.com/v3.1/{endpoint}'
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    return response.json()

@app.route('/api/countries')
def get_countries():
    fields = request.args.get('fields', 'name,cca2,capital')
    try:
        countries = fetch_countries('all', {'fields': fields})
        return jsonify(countries)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/countries/<code>')
def get_country(code):
    try:
        country = fetch_countries(f'alpha/{code}')
        return jsonify(country)
    except requests.exceptions.HTTPError:
        return jsonify({'error': 'Country not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
```

## Data Analysis with Pandas

```python
import requests
import pandas as pd
import matplotlib.pyplot as plt

def get_countries_dataframe():
    response = requests.get(
        'https://restcountries.com/v3.1/all',
        params={'fields': 'name,region,population,area'}
    )
    countries = response.json()
    
    data = []
    for country in countries:
        data.append({
            'name': country['name']['common'],
            'region': country.get('region', 'Unknown'),
            'population': country.get('population', 0),
            'area': country.get('area', 0)
        })
    
    return pd.DataFrame(data)

# Analyze data
df = get_countries_dataframe()

# Top 10 by population
top_10 = df.nlargest(10, 'population')
print(top_10[['name', 'population']])

# Population by region
region_pop = df.groupby('region')['population'].sum().sort_values(ascending=False)
print("\nPopulation by region:")
print(region_pop)

# Visualization
region_pop.plot(kind='bar', title='Total Population by Region')
plt.ylabel('Population')
plt.tight_layout()
plt.savefig('population_by_region.png')
```

## FastAPI Implementation

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import Optional

app = FastAPI(title="Countries API Proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

BASE_URL = "https://restcountries.com/v3.1"

@app.get("/countries")
async def get_countries(fields: Optional[str] = None):
    async with httpx.AsyncClient() as client:
        params = {"fields": fields} if fields else {}
        response = await client.get(f"{BASE_URL}/all", params=params)
        response.raise_for_status()
        return response.json()

@app.get("/countries/code/{code}")
async def get_country_by_code(code: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/alpha/{code}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Country not found")
            raise

@app.get("/countries/region/{region}")
async def get_countries_by_region(region: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/region/{region}")
        response.raise_for_status()
        return response.json()
```

## Redis Caching

```python
import redis
import requests
import json
from typing import Optional

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
CACHE_TTL = 86400  # 24 hours

def get_cached_or_fetch(key: str, fetch_func, ttl: int = CACHE_TTL):
    # Try cache first
    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)
    
    # Fetch from API
    data = fetch_func()
    
    # Store in cache
    redis_client.setex(key, ttl, json.dumps(data))
    return data

def fetch_all_countries():
    response = requests.get('https://restcountries.com/v3.1/all?fields=name,cca2,flags')
    return response.json()

def fetch_country_by_code(code: str):
    response = requests.get(f'https://restcountries.com/v3.1/alpha/{code}')
    return response.json()

# Usage
countries = get_cached_or_fetch('countries:all', fetch_all_countries)
germany = get_cached_or_fetch('country:deu', lambda: fetch_country_by_code('deu'))
```

## CLI Tool

```python
import click
import requests
from tabulate import tabulate

@click.group()
def cli():
    """Countries REST API CLI tool."""
    pass

@cli.command()
@click.argument('name')
def search(name):
    """Search for a country by name."""
    response = requests.get(f'https://restcountries.com/v3.1/name/{name}')
    if response.status_code == 404:
        click.echo(f"Country '{name}' not found")
        return
    
    countries = response.json()
    data = []
    for c in countries:
        data.append([
            c['name']['common'],
            c.get('capital', ['N/A'])[0],
            f"{c.get('population', 0):,}",
            c.get('region', 'N/A')
        ])
    
    click.echo(tabulate(data, headers=['Name', 'Capital', 'Population', 'Region']))

@cli.command()
@click.argument('region')
def region(region):
    """Get all countries in a region."""
    response = requests.get(f'https://restcountries.com/v3.1/region/{region}')
    countries = response.json()
    
    click.echo(f"\nCountries in {region.capitalize()}: {len(countries)}")
    for c in countries:
        click.echo(f"  - {c['name']['common']}")

if __name__ == '__main__':
    cli()

# Usage:
# python countries_cli.py search germany
# python countries_cli.py region europe
```

## See Also

- [JavaScript Examples](api-countries-examples-javascript.md)
- [Use Cases](api-countries-examples-usecases.md)