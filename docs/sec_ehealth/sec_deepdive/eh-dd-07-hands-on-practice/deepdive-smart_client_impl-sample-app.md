# Building a SMART App: Complete Tutorial

## From Zero to Working Application

This tutorial walks you through building a complete SMART-on-FHIR application from scratch. You'll learn not just *what* to build, but *why* each piece exists and *how* to debug when things go wrong.

**What we'll build**: A "Patient Vitals Dashboard" that displays blood pressure, heart rate, and weight trends for a patient.

**What you'll learn**:
- Project structure and dependencies
- OAuth authorization flow implementation
- FHIR API queries with error handling
- Data visualization
- Deployment considerations

---

## Project Setup

### Prerequisites

- Node.js 16+ installed
- Text editor (VS Code recommended)
- Basic JavaScript/React knowledge
- GitHub account (for deployment)

### Technology Stack

**Why these choices?**

- **React**: Component-based UI, large ecosystem
- **fhirclient library**: Handles OAuth complexity
- **Vite**: Fast development server, simple config
- **Recharts**: Easy data visualization
- **Tailwind CSS**: Rapid UI development

### Initialize Project

```bash
# Create new Vite project
npm create vite@latest vitals-dashboard -- --template react

cd vitals-dashboard

# Install dependencies
npm install fhirclient
npm install recharts
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

### Configure Tailwind

**tailwind.config.js**:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Project Structure

```
vitals-dashboard/
├── public/
│   └── launch.html          # EHR launch entry point
├── src/
│   ├── components/
│   │   ├── VitalsChart.jsx  # Data visualization
│   │   ├── PatientHeader.jsx # Patient demographics
│   │   └── ErrorBoundary.jsx # Error handling
│   ├── hooks/
│   │   └── useFHIR.js       # FHIR data fetching
│   ├── utils/
│   │   └── fhir-helpers.js  # Helper functions
│   ├── App.jsx              # Main application
│   └── main.jsx             # Entry point
├── index.html               # Main page (after auth)
└── package.json
```

**Why this structure?**

- **public/launch.html**: Separate entry for EHR launch (no React bundle needed)
- **components/**: Reusable UI pieces
- **hooks/**: Business logic separate from UI
- **utils/**: Pure functions, easy to test

---

## Step 1: Launch Page (EHR Entry Point)

**public/launch.html**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Launching Vitals Dashboard...</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 4px solid white;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <div class="spinner"></div>
    <h2>Launching Vitals Dashboard...</h2>
    <p>Connecting to EHR...</p>
  </div>

  <script type="module">
    import FHIR from 'https://cdn.skypack.dev/fhirclient';

    // Initialize SMART authorization
    FHIR.oauth2.authorize({
      clientId: 'vitals_dashboard_client',
      scope: 'launch/patient patient/Patient.read patient/Observation.read openid fhirUser',
      redirectUri: window.location.origin + '/index.html',
      // For standalone launch, include:
      // iss: 'https://launch.smarthealthit.org/v/r4/fhir'
    }).catch(error => {
      console.error('Authorization failed:', error);
      document.body.innerHTML = `
        <div style="text-align: center; max-width: 500px;">
          <h2 style="color: #ff6b6b;">⚠️ Launch Failed</h2>
          <p>Could not authorize with FHIR server.</p>
          <pre style="text-align: left; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; overflow-x: auto;">
${error.message}
          </pre>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: white; color: #667eea; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
            Try Again
          </button>
        </div>
      `;
    });
  </script>
</body>
</html>
```

**Why this design?**

- **Visual feedback**: User knows something is happening
- **Error handling**: Shows meaningful errors, not blank screen
- **Module import**: Uses CDN for launch page (no build step needed)
- **Scope declaration**: Requests exactly what we need

---

## Step 2: Main Application Component

**src/App.jsx**:

```jsx
import { useEffect, useState } from 'react';
import FHIR from 'fhirclient';
import PatientHeader from './components/PatientHeader';
import VitalsChart from './components/VitalsChart';
import ErrorBoundary from './components/ErrorBoundary';
import { processObservations } from './utils/fhir-helpers';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState({
    bloodPressure: [],
    heartRate: [],
    weight: []
  });

  useEffect(() => {
    // Initialize FHIR client after OAuth redirect
    FHIR.oauth2.ready()
      .then(fhirClient => {
        setClient(fhirClient);
        return fhirClient;
      })
      .then(fhirClient => {
        // Fetch patient demographics
        return Promise.all([
          fhirClient.patient.read(),
          fetchVitals(fhirClient)
        ]);
      })
      .then(([patientData, vitalsData]) => {
        setPatient(patientData);
        setVitals(vitalsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to load patient data');
        setLoading(false);
      });
  }, []);

  async function fetchVitals(fhirClient) {
    try {
      // Fetch last 50 vital sign observations
      const bundle = await fhirClient.request(
        'Observation?category=vital-signs&_sort=-date&_count=50'
      );

      // Process into chart-ready format
      return processObservations(bundle);
    } catch (err) {
      console.error('Error fetching vitals:', err);
      throw new Error('Could not fetch vital signs');
    }
  }

  function handleRefresh() {
    setLoading(true);
    setError(null);
    
    fetchVitals(client)
      .then(vitalsData => {
        setVitals(vitalsData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <h2 className="text-2xl font-semibold">Loading Patient Data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <PatientHeader patient={patient} onRefresh={handleRefresh} />
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <VitalsChart
              title="Blood Pressure"
              data={vitals.bloodPressure}
              yAxisLabel="mmHg"
              lineColor="#ef4444"
            />
            
            <VitalsChart
              title="Heart Rate"
              data={vitals.heartRate}
              yAxisLabel="bpm"
              lineColor="#3b82f6"
            />
            
            <VitalsChart
              title="Weight"
              data={vitals.weight}
              yAxisLabel="kg"
              lineColor="#10b981"
              className="lg:col-span-2"
            />
          </div>

          {vitals.bloodPressure.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">No vital signs data available for this patient.</p>
              <p className="mt-2">Try selecting a different patient in the EHR.</p>
            </div>
          )}
        </main>

        <footer className="text-center py-8 text-gray-500 text-sm">
          <p>Vitals Dashboard • SMART-on-FHIR Application</p>
          <p className="mt-1">Patient ID: {patient?.id}</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
```

**Key decisions explained**:

- **Promise.all**: Fetch patient and vitals in parallel (faster)
- **Error boundaries**: Catch rendering errors, not just async errors
- **Refresh button**: Manual reload without full page refresh
- **Loading states**: User knows what's happening
- **Empty state**: Helpful message when no data available

---

## Step 3: Patient Header Component

**src/components/PatientHeader.jsx**:

```jsx
import { format } from 'date-fns';

export default function PatientHeader({ patient, onRefresh }) {
  const name = getPatientName(patient);
  const age = calculateAge(patient.birthDate);
  const formattedBirthDate = patient.birthDate 
    ? format(new Date(patient.birthDate), 'MMMM d, yyyy')
    : 'Unknown';

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <div className="mt-2 flex gap-6 text-sm text-gray-600">
              <span>
                <strong>DOB:</strong> {formattedBirthDate} (Age {age})
              </span>
              <span>
                <strong>Gender:</strong> {capitalizeFirst(patient.gender)}
              </span>
              {patient.id && (
                <span>
                  <strong>MRN:</strong> {patient.id}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            aria-label="Refresh data"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}

function getPatientName(patient) {
  if (!patient?.name?.[0]) return 'Unknown Patient';
  
  const name = patient.name[0];
  const given = name.given?.join(' ') || '';
  const family = name.family || '';
  
  return `${given} ${family}`.trim() || 'Unknown Patient';
}

function calculateAge(birthDate) {
  if (!birthDate) return '?';
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

**Why these helper functions?**

- **Defensive coding**: Handles missing data gracefully
- **Date formatting**: Readable dates (not ISO strings)
- **Age calculation**: Current age, not birth year
- **Name assembly**: Handles FHIR's complex HumanName structure

---

## Step 4: Vitals Chart Component

**src/components/VitalsChart.jsx**:

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

export default function VitalsChart({ title, data, yAxisLabel, lineColor, className = '' }) {
  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>No {title.toLowerCase()} data available</p>
        </div>
      </div>
    );
  }

  // Find min/max for Y-axis domain
  const values = data.flatMap(d => [d.systolic, d.diastolic, d.value].filter(Boolean));
  const minValue = Math.floor(Math.min(...values) * 0.9);
  const maxValue = Math.ceil(Math.max(...values) * 1.1);

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), 'M/d')}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
            domain={[minValue, maxValue]}
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy h:mm a')}
            formatter={(value) => [`${value} ${yAxisLabel}`, '']}
          />
          
          {data[0]?.systolic !== undefined ? (
            // Blood pressure (two lines)
            <>
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
                name="Systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
                name="Diastolic"
              />
              <Legend />
            </>
          ) : (
            // Single value (heart rate, weight)
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ fill: lineColor }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-gray-500">Latest</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatLatestValue(data[data.length - 1], yAxisLabel)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Average</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatAverageValue(data, yAxisLabel)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Readings</p>
          <p className="text-lg font-semibold text-gray-900">{data.length}</p>
        </div>
      </div>
    </div>
  );
}

function formatLatestValue(latest, unit) {
  if (!latest) return 'N/A';
  
  if (latest.systolic !== undefined) {
    return `${latest.systolic}/${latest.diastolic} ${unit}`;
  }
  return `${latest.value} ${unit}`;
}

function formatAverageValue(data, unit) {
  if (data.length === 0) return 'N/A';
  
  if (data[0].systolic !== undefined) {
    const avgSystolic = Math.round(
      data.reduce((sum, d) => sum + d.systolic, 0) / data.length
    );
    const avgDiastolic = Math.round(
      data.reduce((sum, d) => sum + d.diastolic, 0) / data.length
    );
    return `${avgSystolic}/${avgDiastolic} ${unit}`;
  }
  
  const avgValue = Math.round(
    data.reduce((sum, d) => sum + d.value, 0) / data.length
  );
  return `${avgValue} ${unit}`;
}
```

**Chart design decisions**:

- **Responsive**: Adapts to screen size
- **Formatted dates**: Human-readable X-axis
- **Auto-scaling Y-axis**: Shows trends clearly
- **Summary stats**: Latest, average, count at a glance
- **Empty state**: Helpful message when no data
- **Blood pressure special case**: Two lines (systolic/diastolic)

---

## Step 5: FHIR Data Processing

**src/utils/fhir-helpers.js**:

```javascript
/**
 * Process FHIR Observation bundle into chart-ready data
 */
export function processObservations(bundle) {
  if (!bundle?.entry) {
    return {
      bloodPressure: [],
      heartRate: [],
      weight: []
    };
  }

  const observations = bundle.entry.map(e => e.resource);
  
  const bloodPressure = [];
  const heartRate = [];
  const weight = [];

  observations.forEach(obs => {
    const code = obs.code?.coding?.[0]?.code;
    const date = obs.effectiveDateTime || obs.effectiveInstant;
    
    if (!date) return; // Skip observations without date

    // Blood pressure (has components)
    if (code === '85354-9' && obs.component) {
      const systolic = obs.component.find(c => 
        c.code?.coding?.[0]?.code === '8480-6'
      );
      const diastolic = obs.component.find(c => 
        c.code?.coding?.[0]?.code === '8462-4'
      );

      if (systolic?.valueQuantity?.value && diastolic?.valueQuantity?.value) {
        bloodPressure.push({
          date,
          systolic: systolic.valueQuantity.value,
          diastolic: diastolic.valueQuantity.value
        });
      }
    }

    // Heart rate
    if (code === '8867-4' && obs.valueQuantity?.value) {
      heartRate.push({
        date,
        value: obs.valueQuantity.value
      });
    }

    // Weight
    if (code === '29463-7' && obs.valueQuantity?.value) {
      weight.push({
        date,
        value: obs.valueQuantity.value
      });
    }
  });

  // Sort by date (oldest first for charts)
  const sortByDate = (a, b) => new Date(a.date) - new Date(b.date);
  
  return {
    bloodPressure: bloodPressure.sort(sortByDate),
    heartRate: heartRate.sort(sortByDate),
    weight: weight.sort(sortByDate)
  };
}

/**
 * LOINC codes for vital signs
 */
export const LOINC_CODES = {
  BLOOD_PRESSURE_PANEL: '85354-9',
  SYSTOLIC_BP: '8480-6',
  DIASTOLIC_BP: '8462-4',
  HEART_RATE: '8867-4',
  BODY_WEIGHT: '29463-7',
  BODY_HEIGHT: '8302-2',
  BODY_TEMP: '8310-5',
  RESP_RATE: '9279-1',
  OXYGEN_SAT: '2708-6'
};
```

**Why separate data processing?**

- **Testable**: Pure functions, easy to unit test
- **Reusable**: Can use in multiple components
- **Maintainable**: LOINC codes in one place
- **Debuggable**: Log raw observations vs. processed data

---

## Step 6: Error Boundary

**src/components/ErrorBoundary.jsx**:

```jsx
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              ⚠️ Something Went Wrong
            </h2>
            <p className="text-gray-700 mb-4">
              The application encountered an unexpected error. This has been logged for investigation.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                Technical Details
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Why error boundaries?**

- **Graceful degradation**: Show error UI, don't crash
- **User-friendly**: Non-technical error message
- **Debuggable**: Technical details in collapsed section
- **Recoverable**: Reload button for quick fix

---

## Step 7: Testing Locally

### Development Server

```bash
npm run dev
```

**Test EHR launch**:

1. Visit [https://launch.smarthealthit.org](https://launch.smarthealthit.org)
2. Enter your launch URL: `http://localhost:5173/launch.html`
3. Select patient: Amy V. Shaw (smart-1288992)
4. Click "Launch"

**What should happen**:
- Redirects to launch.html
- Shows "Launching..." screen
- Redirects back to index.html with token
- Displays patient header and vitals charts

---

### Common Issues and Fixes

#### Issue: "Failed to fetch"

**Cause**: CORS error or wrong FHIR server URL

**Fix**:
```javascript
// In launch.html, verify iss parameter
console.log('ISS:', new URLSearchParams(window.location.search).get('iss'));
```

---

#### Issue: Charts show no data

**Cause**: Patient has no vital signs, or wrong LOINC codes

**Debug**:
```javascript
// In App.jsx, log raw observations
async function fetchVitals(fhirClient) {
  const bundle = await fhirClient.request(
    'Observation?category=vital-signs&_sort=-date&_count=50'
  );
  
  console.log('Raw bundle:', bundle);
  console.log('Observation codes:', bundle.entry?.map(e => 
    e.resource.code?.coding?.[0]?.code
  ));
  
  return processObservations(bundle);
}
```

---

#### Issue: "Invalid client_id"

**Cause**: Client ID not registered with server

**Fix**: For SMART Health IT sandbox, any client_id works. For production, register your app first.

---

## Step 8: Deployment

### Option 1: GitHub Pages

**vite.config.js**:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vitals-dashboard/', // Your GitHub repo name
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        launch: 'public/launch.html'
      }
    }
  }
})
```

**Deploy**:

```bash
npm run build
npm install -g gh-pages
gh-pages -d dist
```

Your app is live at: `https://username.github.io/vitals-dashboard/`

---

### Option 2: Netlify

**netlify.toml**:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deploy**:

```bash
npm run build
# Drag dist/ folder to Netlify web interface
# Or: netlify deploy --prod
```

---

### Option 3: Vercel

```bash
npm install -g vercel
vercel --prod
```

---

## Step 9: Production Considerations

### Security Checklist

- [ ] Use HTTPS (required for OAuth)
- [ ] Never commit client secrets (use environment variables)
- [ ] Implement PKCE for public clients
- [ ] Validate all server responses
- [ ] Handle token expiration/refresh
- [ ] Clear tokens on logout
- [ ] Rate limit API requests
- [ ] Sanitize user inputs

---

### Performance Optimization

```javascript
// Debounce refresh button
import { debounce } from 'lodash';

const debouncedRefresh = debounce(handleRefresh, 1000);
```

```javascript
// Cache FHIR responses
const cache = new Map();

async function cachedRequest(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const data = await client.request(url);
  cache.set(url, data);
  setTimeout(() => cache.delete(url), 5 * 60 * 1000); // 5 min TTL
  
  return data;
}
```

---

### Accessibility

```jsx
// Add ARIA labels
<button
  onClick={onRefresh}
  aria-label="Refresh patient data"
  className="..."
>
  <svg aria-hidden="true">...</svg>
  Refresh
</button>

// Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  ...
</div>
```

---

## Step 10: Next Steps

### Enhancements to Consider

1. **More vitals**: Add temperature, respiratory rate, oxygen saturation
2. **Date range filter**: Show last week/month/year
3. **Data export**: Download CSV/PDF of vitals
4. **Alerts**: