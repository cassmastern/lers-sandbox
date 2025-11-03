# Advanced Filtering

Master the art of getting exactly the data you need.

## Field Filtering

### Why Filter?

- **Faster responses** - Less data to transfer
- **Lower bandwidth** - Important for mobile users
- **Cleaner code** - Work with only what you need

### Syntax

```
?fields=field1,field2,field3
```

### Examples

#### Minimal Country List

```bash
curl "https://restcountries.com/v3.1/all?fields=name,cca2"
```

Perfect for a country selector dropdown.

#### Country Card Data

```bash
curl "https://restcountries.com/v3.1/region/europe?fields=name,capital,population,flags,area"
```

Everything you need for a country information card.

#### Map Visualization

```bash
curl "https://restcountries.com/v3.1/all?fields=name,latlng,borders,area"
```

Geographic data for map visualizations.

## Exact Matching

### Default Behavior (Fuzzy Search)

```bash
curl https://restcountries.com/v3.1/name/united
```

Returns: United States, United Kingdom, United Arab Emirates, etc.

### Exact Match

```bash
curl "https://restcountries.com/v3.1/name/united%20states?fullText=true"
```

Returns: Only United States

## Multiple Country Lookup

### Get Specific Countries by Code

```bash
curl "https://restcountries.com/v3.1/alpha?codes=usa,fra,deu,jpn"
```

Returns: United States, France, Germany, Japan

### Use Case: User's Selected Countries

```javascript
const selectedCodes = ['usa', 'gbr', 'can'];
const query = selectedCodes.join(',');

fetch(`https://restcountries.com/v3.1/alpha?codes=${query}`)
  .then(res => res.json())
  .then(countries => {
    // Work with selected countries
  });
```

## Search Strategies

### By Currency

Find all countries using Euro:

```bash
curl https://restcountries.com/v3.1/currency/eur
```

### By Language

Find all Spanish-speaking countries:

```bash
curl https://restcountries.com/v3.1/lang/es
```

### By Capital

Find country by capital city:

```bash
curl https://restcountries.com/v3.1/capital/tokyo
```

## Performance Tips

### Cache Aggressively

Country data rarely changes. Cache for 24+ hours:

```javascript
const CACHE_KEY = 'countries_data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function getCountries() {
  const cached = localStorage.getItem(CACHE_KEY);
  
  if (cached) {
    const {data, timestamp} = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
  const data = await response.json();
  
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
}
```

### Request Only What You Need

❌ **Bad:**
```javascript
// Fetches ALL data (~6MB+)
fetch('https://restcountries.com/v3.1/all')
```

✅ **Good:**
```javascript
// Fetches only needed fields (~200KB)
fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags,capital')
```

### Use Country Codes When Possible

❌ **Less reliable:**
```bash
curl https://restcountries.com/v3.1/name/ivory%20coast
```

✅ **More reliable:**
```bash
curl https://restcountries.com/v3.1/alpha/civ
```

## See Also

- [Integration Patterns](api-countries-guides-integration.md) - Production-ready patterns
- [Use Cases](../sec_api_countries_examples/api-countries-examples-usecases.md) - Real-world implementations