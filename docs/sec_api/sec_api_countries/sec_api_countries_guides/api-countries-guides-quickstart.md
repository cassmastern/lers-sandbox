# Quick Start Guide

Get started with the Countries REST API in under 5 minutes.

## Installation

No installation required! The API is accessible via HTTP from any language.

## Your First Request

### Using curl

```bash
curl https://restcountries.com/v3.1/all
```

### Using JavaScript

```javascript
fetch('https://restcountries.com/v3.1/all')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Using Python

```python
import requests

response = requests.get('https://restcountries.com/v3.1/all')
countries = response.json()
print(countries)
```

### Using the Embedded Swagger UI

[Interactive OpenAPI (Swagger) Reference](../reference.md)

## Common Endpoints

### Get All Countries

```bash
GET /all
```

Returns all countries with complete data.

### Search by Name

```bash
GET /name/{name}
```

```bash
# Examples
curl https://restcountries.com/v3.1/name/france
curl https://restcountries.com/v3.1/name/united    # Matches "United States", "United Kingdom", etc.
```

### Get by Country Code

```bash
GET /alpha/{code}
```

```bash
# Examples
curl https://restcountries.com/v3.1/alpha/fr    # France (alpha-2)
curl https://restcountries.com/v3.1/alpha/fra   # France (alpha-3)
```

### Filter by Region

```bash
GET /region/{region}
```

Available regions: `africa`, `americas`, `asia`, `europe`, `oceania`

```bash
curl https://restcountries.com/v3.1/region/europe
```

## Essential Response Fields

```json
{
  "name": {
    "common": "France",           // Display name
    "official": "French Republic"  // Official name
  },
  "cca2": "FR",                    // ISO alpha-2 code
  "cca3": "FRA",                   // ISO alpha-3 code
  "capital": ["Paris"],
  "region": "Europe",
  "subregion": "Western Europe",
  "population": 67391582,
  "currencies": {
    "EUR": {"name": "Euro", "symbol": "€"}
  },
  "languages": {
    "fra": "French"
  },
  "flags": {
    "png": "https://flagcdn.com/w320/fr.png",
    "svg": "https://flagcdn.com/fr.svg"
  }
}
```

## Optimize Your Requests

### Field Filtering

Request only the fields you need:

```bash
curl "https://restcountries.com/v3.1/all?fields=name,capital,population,flags"
```

This reduces payload size and improves performance.

## Error Handling

```javascript
fetch('https://restcountries.com/v3.1/name/xyz')
  .then(response => {
    if (!response.ok) {
      throw new Error('Country not found');
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

## See Also

- [Advanced Filtering](api-countries-guides-filtering.md) - Master field filtering and exact matching
- [Integration Patterns](api-countries-guides-integration.md) - Best practices for production use
- [Code Examples](../sec_api_countries_examples/index.md) - Real-world implementations