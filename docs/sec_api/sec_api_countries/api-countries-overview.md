# Overview

A free REST API providing comprehensive country data for developers.

## What You Can Build

- Country selection dropdowns with flags
- Geographic data visualizations
- Currency conversion tools
- Language learning applications
- Travel planning apps

## Key Features

- **No authentication required** - Start using immediately
- **Comprehensive data** - 250+ countries with 40+ attributes each
- **Multiple search options** - Name, code, currency, language, region
- **Rich metadata** - Flags, coordinates, timezones, currencies, languages
- **Field filtering** - Request only the data you need

## Quick Example

```bash
curl https://restcountries.com/v3.1/name/germany
```

```json
[{
  "name": {"common": "Germany", "official": "Federal Republic of Germany"},
  "capital": ["Berlin"],
  "population": 83240525,
  "region": "Europe",
  "currencies": {"EUR": {"name": "Euro", "symbol": "€"}},
  "flags": {"png": "https://flagcdn.com/w320/de.png"}
}]
```

## Base URL

```
https://restcountries.com/v3.1/
```

## Response Format

All endpoints return JSON. Responses are either:
- **Array of countries** - Most endpoints return arrays
- **Single country** - `/alpha/{code}` endpoint returns an object
- **Error object** - `{"status": 404, "message": "Not Found"}`

## Next Steps

- [Quick Start Guide](sec_api_countries_guides/api-countries-guides-quickstart.md) - Get up and running in 5 minutes
- [API Reference](reference.md) - Explore all endpoints interactively
- [Code Examples](sec_api_countries_examples/index.md) - Copy-paste ready code