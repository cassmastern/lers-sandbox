# Real-World Use Cases

Complete implementations for common real-world scenarios.

## 1. Country Selector with Flags

A polished country selector component with flag icons.

### HTML + JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .country-selector {
            position: relative;
            width: 300px;
        }
        .selected-country {
            display: flex;
            align-items: center;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            background: white;
        }
        .country-flag {
            width: 24px;
            height: 16px;
            margin-right: 10px;
            object-fit: cover;
        }
        .dropdown {
            position: absolute;
            width: 100%;
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: white;
            display: none;
            z-index: 1000;
        }
        .dropdown.open {
            display: block;
        }
        .country-option {
            display: flex;
            align-items: center;
            padding: 10px;
            cursor: pointer;
        }
        .country-option:hover {
            background: #f0f0f0;
        }
        .search-box {
            padding: 10px;
            border-bottom: 1px solid #ccc;
        }
        .search-box input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="country-selector" id="countrySelector">
        <div class="selected-country" id="selectedCountry">
            <span>Select a country...</span>
        </div>
        <div class="dropdown" id="dropdown">
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Search countries...">
            </div>
            <div id="countryList"></div>
        </div>
    </div>

    <script>
        class CountrySelector {
            constructor(elementId) {
                this.container = document.getElementById(elementId);
                this.selected = this.container.querySelector('#selectedCountry');
                this.dropdown = this.container.querySelector('#dropdown');
                this.searchInput = this.container.querySelector('#searchInput');
                this.countryList = this.container.querySelector('#countryList');
                
                this.countries = [];
                this.selectedCountry = null;
                
                this.init();
            }
            
            async init() {
                await this.loadCountries();
                this.setupEvents();
                this.renderCountries();
            }
            
            async loadCountries() {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
                this.countries = await response.json();
                this.countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
            }
            
            setupEvents() {
                this.selected.addEventListener('click', () => {
                    this.dropdown.classList.toggle('open');
                });
                
                this.searchInput.addEventListener('input', (e) => {
                    this.filterCountries(e.target.value);
                });
                
                document.addEventListener('click', (e) => {
                    if (!this.container.contains(e.target)) {
                        this.dropdown.classList.remove('open');
                    }
                });
            }
            
            renderCountries(filteredCountries = this.countries) {
                this.countryList.innerHTML = filteredCountries.map(country => `
                    <div class="country-option" data-code="${country.cca2}">
                        <img src="${country.flags.png}" class="country-flag" alt="${country.name.common}">
                        <span>${country.name.common}</span>
                    </div>
                `).join('');
                
                this.countryList.querySelectorAll('.country-option').forEach(option => {
                    option.addEventListener('click', () => {
                        this.selectCountry(option.dataset.code);
                    });
                });
            }
            
            filterCountries(query) {
                const filtered = this.countries.filter(country =>
                    country.name.common.toLowerCase().includes(query.toLowerCase())
                );
                this.renderCountries(filtered);
            }
            
            selectCountry(code) {
                const country = this.countries.find(c => c.cca2 === code);
                this.selectedCountry = country;
                
                this.selected.innerHTML = `
                    <img src="${country.flags.png}" class="country-flag" alt="${country.name.common}">
                    <span>${country.name.common}</span>
                `;
                
                this.dropdown.classList.remove('open');
                this.searchInput.value = '';
                this.renderCountries();
                
                // Trigger custom event
                this.container.dispatchEvent(new CustomEvent('countrySelected', {
                    detail: country
                }));
            }
        }
        
        // Initialize
        const selector = new CountrySelector('countrySelector');
        
        // Listen for selection
        document.getElementById('countrySelector').addEventListener('countrySelected', (e) => {
            console.log('Selected country:', e.detail);
        });
    </script>
</body>
</html>
```

---

## 2. Regional Dashboard

Interactive dashboard showing statistics by region.
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            text-align: center;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #2c3e50;
        }
        .stat-label {
            color: #7f8c8d;
            margin-top: 5px;
        }
        .chart-container {
            margin: 30px 0;
            height: 400px;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <h1>World Countries Dashboard</h1>
        
        <div class="stats-grid" id="statsGrid"></div>
        
        <div class="chart-container">
            <canvas id="populationChart"></canvas>
        </div>
        
        <div class="chart-container">
            <canvas id="areaChart"></canvas>
        </div>
    </div>

    <script>
        async function loadDashboard() {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,region,population,area');
            const countries = await response.json();
            
            // Calculate statistics
            const stats = calculateStats(countries);
            renderStats(stats);
            renderCharts(stats);
        }
        
        function calculateStats(countries) {
            const byRegion = {};
            
            countries.forEach(country => {
                const region = country.region || 'Unknown';
                if (!byRegion[region]) {
                    byRegion[region] = {
                        count: 0,
                        totalPopulation: 0,
                        totalArea: 0,
                        countries: []
                    };
                }
                
                byRegion[region].count++;
                byRegion[region].totalPopulation += country.population || 0;
                byRegion[region].totalArea += country.area || 0;
                byRegion[region].countries.push(country);
            });
            
            return {
                totalCountries: countries.length,
                totalPopulation: countries.reduce((sum, c) => sum + (c.population || 0), 0),
                totalArea: countries.reduce((sum, c) => sum + (c.area || 0), 0),
                byRegion
            };
        }
        
        function renderStats(stats) {
            const statsGrid = document.getElementById('statsGrid');
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${stats.totalCountries}</div>
                    <div class="stat-label">Total Countries</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${(stats.totalPopulation / 1e9).toFixed(2)}B</div>
                    <div class="stat-label">World Population</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${(stats.totalArea / 1e6).toFixed(1)}M</div>
                    <div class="stat-label">Total Area (km²)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${Object.keys(stats.byRegion).length}</div>
                    <div class="stat-label">Regions</div>
                </div>
            `;
        }
        
        function renderCharts(stats) {
            const regions = Object.keys(stats.byRegion);
            const populations = regions.map(r => stats.byRegion[r].totalPopulation);
            const areas = regions.map(r => stats.byRegion[r].totalArea);
            
            // Population chart
            new Chart(document.getElementById('populationChart'), {
                type: 'bar',
                data: {
                    labels: regions,
                    datasets: [{
                        label: 'Population',
                        data: populations,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Population by Region'
                        }
                    }
                }
            });
            
            // Area chart
            new Chart(document.getElementById('areaChart'), {
                type: 'doughnut',
                data: {
                    labels: regions,
                    datasets: [{
                        label: 'Land Area (km²)',
                        data: areas,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Land Area Distribution by Region'
                        }
                    }
                }
            });
        }
        
        loadDashboard();
    </script>
</body>
</html>
```

---

## 3. Travel Planning Tool

Help users find countries meeting specific criteria.
```javascript
class TravelPlanner {
    constructor() {
        this.countries = [];
        this.init();
    }
    
    async init() {
        const response = await fetch(
            'https://restcountries.com/v3.1/all?fields=name,region,languages,currencies,population,area,timezones,borders'
        );
        this.countries = await response.json();
    }
    
    findCountries(criteria) {
        return this.countries.filter(country => {
            // Filter by region
            if (criteria.region && country.region !== criteria.region) {
                return false;
            }
            
            // Filter by language
            if (criteria.language) {
                const languages = Object.values(country.languages || {});
                if (!languages.some(lang => lang.toLowerCase().includes(criteria.language.toLowerCase()))) {
                    return false;
                }
            }
            
            // Filter by currency
            if (criteria.currency) {
                const currencies = Object.keys(country.currencies || {});
                if (!currencies.includes(criteria.currency.toUpperCase())) {
                    return false;
                }
            }
            
            // Filter by population
            if (criteria.minPopulation && country.population < criteria.minPopulation) {
                return false;
            }
            if (criteria.maxPopulation && country.population > criteria.maxPopulation) {
                return false;
            }
            
            // Filter by area
            if (criteria.minArea && country.area < criteria.minArea) {
                return false;
            }
            
            return true;
        });
    }
    
    getNeighbors(countryCode) {
        const country = this.countries.find(c => c.cca3 === countryCode);
        if (!country || !country.borders) return [];
        
        return country.borders.map(borderCode => {
            return this.countries.find(c => c.cca3 === borderCode);
        }).filter(Boolean);
    }
    
    planRoute(startCode, endCode) {
        // Simple BFS to find route through bordering countries
        const queue = [[startCode]];
        const visited = new Set([startCode]);
        
        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];
            
            if (current === endCode) {
                return path.map(code => 
                    this.countries.find(c => c.cca3 === code)
                );
            }
            
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.cca3)) {
                    visited.add(neighbor.cca3);
                    queue.push([...path, neighbor.cca3]);
                }
            }
        }
        
        return null; // No land route found
    }
}

// Usage examples
const planner = new TravelPlanner();

// Find European countries where English is spoken
const englishEurope = planner.findCountries({
    region: 'Europe',
    language: 'English'
});

// Find large countries using Euro
const largeEuroCountries = planner.findCountries({
    currency: 'EUR',
    minArea: 100000
});

// Plan a route from France to China
const route = planner.planRoute('FRA', 'CHN');
if (route) {
    console.log('Route:', route.map(c => c.name.common).join(' → '));
} else {
    console.log('No land route available');
}
```

---

## 4. Currency Exchange Context

Show which countries use which currencies with real-time context.
```javascript
class CurrencyExplorer {
    constructor() {
        this.countries = [];
        this.currencyMap = new Map();
    }
    
    async init() {
        const response = await fetch(
            'https://restcountries.com/v3.1/all?fields=name,cca2,currencies,flags,population'
        );
        this.countries = await response.json();
        this.buildCurrencyMap();
    }
    
    buildCurrencyMap() {
        this.countries.forEach(country => {
            if (country.currencies) {
                Object.entries(country.currencies).forEach(([code, info]) => {
                    if (!this.currencyMap.has(code)) {
                        this.currencyMap.set(code, {
                            code,
                            name: info.name,
                            symbol: info.symbol,
                            countries: []
                        });
                    }
                    this.currencyMap.get(code).countries.push(country);
                });
            }
        });
    }
    
    getCurrencyInfo(currencyCode) {
        return this.currencyMap.get(currencyCode.toUpperCase());
    }
    
    getMostUsedCurrencies(limit = 10) {
        return Array.from(this.currencyMap.values())
            .sort((a, b) => b.countries.length - a.countries.length)
            .slice(0, limit);
    }
    
    getTotalPopulationByCurrency(currencyCode) {
        const info = this.getCurrencyInfo(currencyCode);
        if (!info) return 0;
        
        return info.countries.reduce((sum, country) => 
            sum + (country.population || 0), 0
        );
    }
    
    renderCurrencyCard(currencyCode) {
        const info = this.getCurrencyInfo(currencyCode);
        if (!info) return 'Currency not found';
        
        const totalPop = this.getTotalPopulationByCurrency(currencyCode);
        
        return `
            <div class="currency-card">
                <h2>${info.code} - ${info.name}</h2>
                <p>Symbol: ${info.symbol}</p>
                <p>Used in ${info.countries.length} countries</p>
                <p>Total population: ${(totalPop / 1e6).toFixed(1)}M</p>
                <h3>Countries:</h3>
                <ul>
                    ${info.countries.map(c => `
                        <li>
                            <img src="${c.flags.png}" width="24">
                            ${c.name.common}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
}

// Usage
const explorer = new CurrencyExplorer();
await explorer.init();

// Get EUR information
const eurInfo = explorer.getCurrencyInfo('EUR');
console.log(`Euro is used in ${eurInfo.countries.length} countries`);

// Get top currencies
const topCurrencies = explorer.getMostUsedCurrencies(5);
console.log('Most widely used currencies:', topCurrencies.map(c => c.code));
```

---

## 5. Language Learning Assistant

Find countries where specific languages are spoken.
```javascript
class LanguageLearningAssistant {
    constructor() {
        this.countries = [];
    }
    
    async init() {
        const response = await fetch(
            'https://restcountries.com/v3.1/all?fields=name,languages,flags,capital,population,region'
        );
        this.countries = await response.json();
    }
    
    findCountriesByLanguage(language) {
        return this.countries.filter(country => {
            if (!country.languages) return false;
            
            const languages = Object.values(country.languages);
            return languages.some(lang => 
                lang.toLowerCase().includes(language.toLowerCase())
            );
        }).sort((a, b) => b.population - a.population);
    }
    
    getLearningPath(targetLanguage) {
        const countries = this.findCountriesByLanguage(targetLanguage);
        
        // Suggest learning path: start with most populated countries
        return {
            language: targetLanguage,
            totalSpeakers: countries.reduce((sum, c) => sum + (c.population || 0), 0),
            countriesCount: countries.length,
            suggestedPath: [
                {
                    level: 'Beginner',
                    country: countries[0],
                    reason: 'Most populated - abundant learning resources'
                },
                {
                    level: 'Intermediate',
                    country: countries[countries.length > 1 ? 1 : 0],
                    reason: 'Experience different dialects and culture'
                },
                {
                    level: 'Advanced',
                    country: countries[countries.length > 2 ? 2 : 0],
                    reason: 'Master regional variations'
                }
            ],
            allCountries: countries
        };
    }
    
    compareLanguages(lang1, lang2) {
        const countries1 = this.findCountriesByLanguage(lang1);
        const countries2 = this.findCountriesByLanguage(lang2);
        
        return {
            [lang1]: {
                countries: countries1.length,
                totalSpeakers: countries1.reduce((s, c) => s + (c.population || 0), 0),
                regions: [...new Set(countries1.map(c => c.region))]
            },
            [lang2]: {
                countries: countries2.length,
                totalSpeakers: countries2.reduce((s, c) => s + (c.population || 0), 0),
                regions: [...new Set(countries2.map(c => c.region))]
            }
        };
    }
}

// Usage
const assistant = new LanguageLearningAssistant();
await assistant.init();

// Get Spanish learning path
const spanishPath = assistant.getLearningPath('Spanish');
console.log(`Spanish is spoken in ${spanishPath.countriesCount} countries`);
console.log('Suggested learning path:', spanishPath.suggestedPath);

// Compare Spanish vs French
const comparison = assistant.compareLanguages('Spanish', 'French');
console.log(comparison);
```

---

## See Also

- [JavaScript Examples](api-countries-examples-javascript.md)
- [Python Examples](api-countries-examples-python.md)
- [Interactive OpenAPI (Swagger) Reference](../reference.md)