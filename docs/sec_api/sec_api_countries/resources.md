---
title: Resources & Support
---

# Resources & Support

Additional resources, tools, and community support for Countries REST API.

## Official Resources

### Documentation
- **Official Website:** [restcountries.com](https://restcountries.com)
- **GitHub Repository:** [github.com/apilayer/restcountries](https://github.com/apilayer/restcountries)
- **API Changelog:** Check GitHub releases for updates

### Data Sources
- **Flag Images:** [flagcdn.com](https://flagcdn.com)
- **Country Data:** Multiple verified sources including UN, World Bank, CIA World Factbook

## Community & Support

### Getting Help

**Bug Reports & Feature Requests** (now archived)
- [GitHub Issues](https://github.com/apilayer/restcountries/issues)

**Questions & Discussion**
- GitHub Discussions for general questions
- Stack Overflow tag: `restcountries`

### Source Code

The Countries REST API is open source:

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/restcountries.git
cd restcountries
```

## Alternative APIs

If Countries REST API doesn't fit your needs, consider these alternatives:

### General Country Data
- **World Bank API** - Economic indicators, development data
- **UN Data API** - Official UN statistics
- **GeoNames** - Geographic database with web services

### Specialized Data
- **OpenWeatherMap** - Weather data by country/city
- **Currency API** - Real-time exchange rates
- **Time Zone DB** - Timezone information

## Related Tools & Libraries

### JavaScript/TypeScript

```bash
# Countries REST API wrapper with TypeScript support
npm install restcountries-api-wrapper

# Country data for offline use
npm install country-data
npm install world-countries
```

### Python

```bash
# Python wrapper
pip install restcountries

# Country utilities
pip install pycountry
pip install country-converter
```

### Other Languages
- **Ruby:** `rest_countries` gem
- **PHP:** `rinvex/countries` package
- **Java:** `rest-countries-client` library

## Data Validation & Utilities

### ISO Standards

**Country Codes (ISO 3166-1)**
- Alpha-2: 2-letter codes (e.g., US, GB, DE)
- Alpha-3: 3-letter codes (e.g., USA, GBR, DEU)
- Numeric: 3-digit codes (e.g., 840, 826, 276)

**Currency Codes (ISO 4217)**
- 3-letter currency codes (e.g., USD, EUR, GBP)

**Language Codes (ISO 639)**
- ISO 639-1: 2-letter codes (e.g., en, es, fr)
- ISO 639-2: 3-letter codes (e.g., eng, spa, fra)

### Validation Libraries

```javascript
// JavaScript - validate country codes
import { isValidCountryCode } from 'iso-3166-1';

if (isValidCountryCode('US')) {
  // Valid code
}
```

```python
# Python - validate and convert
import pycountry

# Get country by alpha-2 code
country = pycountry.countries.get(alpha_2='US')
print(country.name)  # United States

# Convert between code formats
print(country.alpha_3)  # USA
print(country.numeric)  # 840
```

## Performance Optimization

### Best Practices

1. **Cache aggressively** - Country data rarely changes
2. **Use field filtering** - Request only needed data
3. **Implement retry logic** - Handle temporary failures
4. **Use CDN/proxy** - Reduce latency for end users
5. **Monitor usage** - Track API performance

### Sample Cache Implementation

```javascript
// Service Worker cache strategy
const CACHE_NAME = 'countries-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

async function getCachedCountries() {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match('/api/countries');
  
  if (cached) {
    const cachedDate = new Date(cached.headers.get('date'));
    if (Date.now() - cachedDate.getTime() < CACHE_DURATION) {
      return cached.json();
    }
  }
  
  const fresh = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
  cache.put('/api/countries', fresh.clone());
  return fresh.json();
}
```

## Testing

### Mock Data for Testing

```javascript
// jest.config.js - Mock Countries REST API
global.fetch = jest.fn((url) => {
  if (url.includes('restcountries.com')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          name: { common: 'Germany', official: 'Federal Republic of Germany' },
          cca2: 'DE',
          capital: ['Berlin'],
          population: 83240525
        }
      ])
    });
  }
  return Promise.reject(new Error('Not found'));
});
```
```python
# Python - Mock with responses library
import responses
import requests

@responses.activate
def test_get_country():
    responses.add(
        responses.GET,
        'https://restcountries.com/v3.1/alpha/de',
        json={'name': {'common': 'Germany'}, 'cca2': 'DE'},
        status=200
    )
    
    response = requests.get('https://restcountries.com/v3.1/alpha/de')
    assert response.json()['cca2'] == 'DE'
```

## Rate Limiting

### Current Limits

Countries REST API is free and doesn't enforce hard rate limits, but please:
- Don't abuse the service
- Cache responses appropriately
- Consider self-hosting for high-volume use

### Self-Hosting

For production applications with high traffic:

```bash
# Clone and run locally
git clone https://github.com/apilayer/restcountries.git
cd restcountries

# Follow setup instructions in README
# Deploy to your infrastructure
```

**Benefits of self-hosting:**
- No rate limits
- Guaranteed availability
- Custom modifications
- Data privacy

## Monitoring & Debugging

### Check API Status

```javascript
// Health check endpoint
async function checkAPIHealth() {
  try {
    const start = Date.now();
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
    const duration = Date.now() - start;
    
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      statusCode: response.status,
      responseTime: duration,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'down',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

### Debug Logging

```javascript
// Wrapper with logging
async function fetchCountriesWithLogging(endpoint, params) {
  const url = `https://restcountries.com/v3.1/${endpoint}`;
  const startTime = performance.now();
  
  try {
    console.log(`[API] Requesting: ${url}`, params);
    const response = await fetch(url, { params });
    const duration = performance.now() - startTime;
    
    console.log(`[API] Success: ${url} (${duration.toFixed(2)}ms)`);
    return response.json();
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[API] Failed: ${url} (${duration.toFixed(2)}ms)`, error);
    throw error;
  }
}
```

## Security Considerations

### HTTPS Only
Always use HTTPS endpoints - the API supports only secure connections.

### API Key Management
Countries REST API doesn't require API keys, but if you build a proxy:

```javascript
// Example proxy with API key
app.use('/api/countries', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || !isValidKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
});
```

### CORS
The API supports CORS, so you can call it directly from browsers.

## Data Updates

### How Often is Data Updated?

Country data is relatively stable. Updates occur for:
- New countries or territories
- Name changes
- Flag updates
- Population/area adjustments (annually)
- Capital changes (rare)

### Staying Current

Monitor the GitHub repository for:
- Release notifications
- Data update announcements
- Breaking changes

## Legal & Licensing

### API License
- **License:** Mozilla Public License MPL 2.0
- **Free to use** for commercial and non-commercial projects
- **Attribution appreciated** but not required

### Flag Images
- Flags provided by [flagcdn.com](https://flagcdn.com)
- Free to use with attribution

### Data Sources
Country data compiled from multiple public sources:
- United Nations
- World Bank
- CIA World Factbook
- ISO standards organizations

## FAQs

### General Questions

**Q: Is Countries REST API free?**  
A: Yes, completely free with no API keys required.

**Q: Can I use this in production?**  
A: Yes, but consider caching and have fallback strategies for high-traffic applications.

**Q: How accurate is the data?**  
A: Data is compiled from authoritative sources, but always verify critical information.

**Q: Does it support historical data?**  
A: No, the API provides current data only.

### Technical Questions

**Q: Why am I getting CORS errors?**  
A: CORS is supported. Check your request headers and ensure you're using HTTPS.

**Q: Can I download the entire dataset?**  
A: Yes, use the `/all` endpoint or clone the GitHub repository.

**Q: What's the response time?**  
A: Typically 200-500ms depending on your location and endpoint.

**Q: Is there a GraphQL version?**  
A: No, but you can build a GraphQL wrapper using the REST API.

### Data Questions

**Q: Why is some data missing for certain countries?**  
A: Not all data is available for every country (e.g., some territories don't have capitals).

**Q: How do I report incorrect data?**  
A: Open an issue on GitHub with source verification.

**Q: What's the difference between `common` and `official` names?**  
A: `common` is the everyday name (e.g., "South Korea"), `official` is the formal name (e.g., "Republic of Korea").

## Support This Project

Countries REST API is maintained by volunteers. Consider:

- **Star the GitHub repo** - Show your appreciation
- **Sponsor the project** - Help cover hosting costs
- **Report bugs** - Improve data quality
- **Improve docs** - Help other developers
- **Contribute code** - Add features or fix issues

## Contact

- **Issues:** [GitHub Issues](https://github.com/apilayer/restcountries/issues)
- **Discussions:** [GitHub Discussions](https://github.com/apilayer/restcountries/discussions)
- **Email:** Check GitHub profile for maintainer contact

---

## Quick Links Summary

| Resource | Link |
|----------|------|
| Official Website | [restcountries.com](https://restcountries.com) |
| GitHub Repo | [github.com/apilayer/restcountries](https://github.com/apilayer/restcountries) |
| Report Issues | [GitHub Issues](https://github.com/apilayer/restcountries/issues) |
| Flag CDN | [flagcdn.com](https://flagcdn.com) |
| API Reference | [View Reference](reference.md) |
| Quick Start | [Quick Start Guide](sec_api_countries_guides/api-countries-guides-quickstart.md) |
| Code Examples | [JavaScript](sec_api_countries_examples/api-countries-examples-javascript.md) · [Python](sec_api_countries_examples/api-countries-examples-python.md) |

---

*Last updated: November 2025*