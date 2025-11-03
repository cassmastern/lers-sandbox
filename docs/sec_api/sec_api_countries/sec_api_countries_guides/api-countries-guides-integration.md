# Integration Patterns

Production-ready patterns for integrating Countries REST API.

## Architecture Patterns

### 1. Client-Side Only

Best for: Simple apps, prototypes, static sites

```javascript
// Direct API calls from browser
const countries = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
  .then(res => res.json());
```

**Pros:**
- Simple implementation
- No backend required
- Fast development

**Cons:**
- Can't hide API details
- No request rate control
- Client handles all errors

---

### 2. Backend Proxy

Best for: Production apps, API key management, rate limiting

```javascript
// Frontend calls your backend
const countries = await fetch('/api/countries')
  .then(res => res.json());
```

```python
# Backend (Python/Flask)
from flask import Flask, jsonify
import requests

app = Flask(__name__)

@app.route('/api/countries')
def get_countries():
    response = requests.get('https://restcountries.com/v3.1/all?fields=name,cca2,flags')
    return jsonify(response.json())
```

**Pros:**
- Control and monitoring
- Add custom caching logic
- Transform data for your needs
- Add authentication/authorization

**Cons:**
- More infrastructure
- Added latency

---

### 3. Build-Time Static Generation

Best for: Static sites, JAMstack, fast loading

```javascript
// Next.js example - fetch at build time
export async function getStaticProps() {
  const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
  const countries = await res.json();
  
  return {
    props: { countries },
    revalidate: 86400 // Revalidate once per day
  };
}
```

**Pros:**
- Ultra-fast page loads
- No runtime API calls
- Great for SEO

**Cons:**
- Requires build step
- Data staleness (acceptable for country data)

---

## Caching Strategies

### Browser Cache (Service Worker)

```javascript
// service-worker.js
const CACHE_NAME = 'countries-v1';
const COUNTRIES_URL = 'https://restcountries.com/v3.1/all';

self.addEventListener('fetch', event => {
  if (event.request.url.includes('restcountries.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

### Redis Cache (Backend)

```python
import redis
import requests
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)
CACHE_TTL = 86400  # 24 hours

def get_countries():
    # Try cache first
    cached = redis_client.get('countries:all')
    if cached:
        return json.loads(cached)
    
    # Fetch from API
    response = requests.get('https://restcountries.com/v3.1/all?fields=name,cca2,flags')
    countries = response.json()
    
    # Store in cache
    redis_client.setex('countries:all', CACHE_TTL, json.dumps(countries))
    
    return countries
```

---

## Error Handling Patterns

### Retry with Exponential Backoff

```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const countries = await fetchWithRetry('https://restcountries.com/v3.1/all');
```

### Graceful Degradation

```javascript
async function getCountriesWithFallback() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
    return await response.json();
  } catch (error) {
    console.error('API failed, using fallback data', error);
    
    // Return minimal fallback data
    return [
      {name: {common: 'United States'}, cca2: 'US'},
      {name: {common: 'United Kingdom'}, cca2: 'GB'},
      {name: {common: 'Canada'}, cca2: 'CA'}
      // ... more essential countries
    ];
  }
}
```

---

## Data Transformation

### Normalize for Your App

```javascript
function normalizeCountries(apiCountries) {
  return apiCountries.map(country => ({
    id: country.cca2,
    name: country.name.common,
    flag: country.flags.svg,
    population: country.population,
    region: country.region
  })).sort((a, b) => a.name.localeCompare(b.name));
}

// Usage
const rawCountries = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags,population,region')
  .then(res => res.json());

const countries = normalizeCountries(rawCountries);
```

### Create Lookup Maps

```javascript
function createCountryLookup(countries) {
  return {
    byCode: new Map(countries.map(c => [c.cca2, c])),
    byName: new Map(countries.map(c => [c.name.common.toLowerCase(), c])),
  };
}

// Usage
const lookup = createCountryLookup(countries);
const usa = lookup.byCode.get('US');
const france = lookup.byName.get('france');
```

---

## Testing

### Mock API Responses

```javascript
// __tests__/countries.test.js
import { getCountries } from '../api/countries';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {name: {common: 'Germany'}, cca2: 'DE'},
      {name: {common: 'France'}, cca2: 'FR'}
    ])
  })
);

test('getCountries returns country list', async () => {
  const countries = await getCountries();
  expect(countries).toHaveLength(2);
  expect(countries[0].name.common).toBe('Germany');
});
```

---

## Rate Limiting & Throttling

### Client-Side Throttle

```javascript
// Debounce search requests
import { debounce } from 'lodash';

const searchCountries = debounce(async (query) => {
  const response = await fetch(`https://restcountries.com/v3.1/name/${query}`);
  return response.json();
}, 300); // Wait 300ms after user stops typing
```

---

## See Also

- [JavaScript Examples](../sec_api_countries_examples/api-countries-examples-javascript.md) - Working code samples
- [Use Cases](../sec_api_countries_examples/api-countries-examples-usecases.md) - Complete implementations