# JavaScript Examples

Production-ready JavaScript code for common scenarios.

## Country Selector Component

### React

```jsx
import { useState, useEffect } from 'react';

function CountrySelector({ onSelect }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => 
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load countries:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading countries...</div>;

  return (
    <select onChange={e => onSelect(e.target.value)} className="country-select">
      <option value="">Select a country...</option>
      {countries.map(country => (
        <option key={country.cca2} value={country.cca2}>
          {country.name.common}
        </option>
      ))}
    </select>
  );
}

export default CountrySelector;
```

### Vue 3

```vue
<template>
  <select v-model="selected" @change="$emit('select', selected)">
    <option value="">Select a country...</option>
    <option 
      v-for="country in countries" 
      :key="country.cca2" 
      :value="country.cca2"
    >
      {{ country.name.common }}
    </option>
  </select>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const countries = ref([]);
const selected = ref('');

onMounted(async () => {
  const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
  const data = await response.json();
  countries.value = data.sort((a, b) => 
    a.name.common.localeCompare(b.name.common)
  );
});
</script>
```

---

## Country Search with Autocomplete

```javascript
class CountrySearch {
  constructor() {
    this.countries = [];
    this.init();
  }

  async init() {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
    this.countries = await response.json();
  }

  search(query) {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return this.countries
      .filter(country => 
        country.name.common.toLowerCase().includes(lowerQuery) ||
        country.cca2.toLowerCase() === lowerQuery
      )
      .slice(0, 10); // Limit to 10 results
  }
}

// Usage
const searcher = new CountrySearch();

const input = document.querySelector('#country-search');
const results = document.querySelector('#search-results');

input.addEventListener('input', (e) => {
  const matches = searcher.search(e.target.value);
  results.innerHTML = matches
    .map(c => `<li>${c.name.common}</li>`)
    .join('');
});
```

---

## Regional Filter

```javascript
async function getCountriesByRegion(region) {
  const response = await fetch(
    `https://restcountries.com/v3.1/region/${region}?fields=name,capital,population,flags`
  );
  return response.json();
}

// Create region filter UI
const regions = ['africa', 'americas', 'asia', 'europe', 'oceania'];

const filterButtons = regions.map(region => `
  <button onclick="filterByRegion('${region}')">
    ${region.charAt(0).toUpperCase() + region.slice(1)}
  </button>
`).join('');

async function filterByRegion(region) {
  const countries = await getCountriesByRegion(region);
  displayCountries(countries);
}

function displayCountries(countries) {
  const container = document.querySelector('#countries');
  container.innerHTML = countries.map(c => `
    <div class="country-card">
      <img src="${c.flags.png}" alt="${c.name.common} flag">
      <h3>${c.name.common}</h3>
      <p>Capital: ${c.capital?.[0] || 'N/A'}</p>
      <p>Population: ${c.population.toLocaleString()}</p>
    </div>
  `).join('');
}
```

---

## Currency Converter Context

```javascript
async function getCountriesUsing Currency(currencyCode) {
  const response = await fetch(
    `https://restcountries.com/v3.1/currency/${currencyCode}?fields=name,currencies,flags`
  );
  return response.json();
}

// Display countries using a currency
async function showCurrencyInfo(code) {
  const countries = await getCountriesUsingCurrency(code);
  
  console.log(`Countries using ${code}:`);
  countries.forEach(country => {
    const currency = country.currencies[code];
    console.log(`- ${country.name.common}: ${currency.name} (${currency.symbol})`);
  });
  
  return countries;
}

// Example: Find all countries using Euro
showCurrencyInfo('EUR');
```

---

## Batch Country Lookup

```javascript
async function getMultipleCountries(codes) {
  const codesParam = codes.join(',');
  const response = await fetch(
    `https://restcountries.com/v3.1/alpha?codes=${codesParam}&fields=name,capital,population,flags`
  );
  return response.json();
}

// Usage: Get user's favorite countries
const favoriteCodes = ['usa', 'gbr', 'fra', 'jpn', 'aus'];
const favorites = await getMultipleCountries(favoriteCodes);

console.log('Your favorite countries:', favorites);
```

---

## Distance Calculator

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function findNearestCountries(countryCode, limit = 5) {
  // Get target country
  const target = await fetch(
    `https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,latlng`
  ).then(r => r.json());
  
  // Get all countries
  const all = await fetch(
    'https://restcountries.com/v3.1/all?fields=name,cca2,latlng'
  ).then(r => r.json());
  
  // Calculate distances
  const withDistances = all
    .filter(c => c.cca2 !== countryCode)
    .map(country => ({
      ...country,
      distance: calculateDistance(
        target.latlng[0], target.latlng[1],
        country.latlng[0], country.latlng[1]
      )
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
  
  return withDistances;
}

// Example: Find countries nearest to Germany
const nearest = await findNearestCountries('deu', 5);
console.log('Nearest to Germany:', nearest);
```

---

## TypeScript Interfaces

```typescript
interface Country {
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, {
      official: string;
      common: string;
    }>;
  };
  cca2: string;
  cca3: string;
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  currencies?: Record<string, {
    name: string;
    symbol: string;
  }>;
  languages?: Record<string, string>;
  flags: {
    png: string;
    svg: string;
  };
  latlng: [number, number];
  borders?: string[];
  area: number;
}

async function getCountries(): Promise<Country[]> {
  const response = await fetch('https://restcountries.com/v3.1/all');
  return response.json();
}

async function getCountryByCode(code: string): Promise<Country> {
  const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
  return response.json();
}
```

---

## See Also

- [Python Examples](api-countries-examples-python.md) - Backend implementations
- [Use Cases](api-countries-examples-usecases.md) - Complete real-world applications