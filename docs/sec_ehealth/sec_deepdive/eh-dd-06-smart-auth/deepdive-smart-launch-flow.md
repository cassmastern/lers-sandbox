# SMART Launch Flow

## Two Launch Patterns for Different Contexts

SMART-on-FHIR supports two fundamentally different ways to start an app, each optimized for specific use cases. Understanding when to use each pattern is crucial for building the right user experience.

---

## EHR Launch (Provider-Initiated)

### The Clinical Workflow

**Scenario**: Dr. Johnson is reviewing Amy Shaw's chart in the EHR. She clicks the "Cardiac Risk Calculator" app button.

**What happens**:

1. EHR redirects to app with context: `launch?iss=...&launch=...`
2. App discovers OAuth endpoints via `iss` (FHIR server URL)
3. App redirects to authorization endpoint **with launch token**
4. Authorization server validates launch token (contains patient ID, encounter ID)
5. User approves (or approval is pre-configured for integrated apps)
6. App receives access token **with patient/encounter context already populated**
7. App immediately displays Amy Shaw's data—no manual patient selection

**Key advantage**: Zero additional clicks. The app automatically knows which patient to show.

### Launch URL Parameters

**EHR initiates**:

```http
GET https://your-app.com/launch?
  iss=https://fhir.example.org&
  launch=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXRpZW50IjoiMTIzIiwiZW5jb3VudGVyIjoiNDU2In0
```

**Parameters**:

- **`iss`**: Issuer (FHIR server base URL). Used to discover OAuth endpoints.
- **`launch`**: Opaque JWT containing context. Don't try to decode it—just pass it through.

**Your app stores these** for use in authorization request.

### Authorization Request (EHR Launch)

**Your app redirects to authorization endpoint**:

```http
GET https://auth.example.org/authorize?
  response_type=code&
  client_id=your_app_id&
  redirect_uri=https://your-app.com/callback&
  scope=launch launch/patient launch/encounter patient/*.read user/Practitioner.read openid fhirUser&
  state=abc123&
  aud=https://fhir.example.org&
  launch=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Critical parameters for EHR launch**:

- **`scope=launch`**: Required to indicate EHR-initiated launch
- **`scope=launch/patient`**: Request patient context
- **`scope=launch/encounter`**: Request encounter context
- **`launch=...`**: The token from EHR (authorization server validates this)
- **`aud=...`**: Must match FHIR server URL

### Token Response (EHR Launch)

**Authorization server returns context in token response**:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "launch launch/patient launch/encounter patient/*.read user/Practitioner.read openid fhirUser",
  "patient": "smart-1288992",
  "encounter": "smart-enc-456",
  "fhirUser": "https://fhir.example.org/Practitioner/dr-johnson"
}
```

**Context claims**:

- **`patient`**: Patient ID from EHR context (Amy Shaw)
- **`encounter`**: Current encounter ID (Nov 1 office visit)
- **`fhirUser`**: FHIR resource URL for authenticated user (Dr. Johnson)

**Your app immediately fetches**:

```http
GET /Patient/smart-1288992
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

No patient search needed—context is provided automatically.

### Example Implementation (JavaScript)

```javascript
// launch.html - Entry point from EHR
async function handleEHRLaunch() {
  const params = new URLSearchParams(window.location.search);
  const iss = params.get('iss');
  const launch = params.get('launch');
  
  if (!iss || !launch) {
    throw new Error('Missing iss or launch parameter');
  }
  
  // Store for later use
  sessionStorage.setItem('iss', iss);
  sessionStorage.setItem('launch', launch);
  
  // Discover OAuth endpoints
  const config = await fetch(`${iss}/.well-known/smart-configuration`).then(r => r.json());
  
  // Build authorization URL
  const state = generateRandomString();
  sessionStorage.setItem('state', state);
  
  const authUrl = `${config.authorization_endpoint}?` +
    `response_type=code&` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent('launch launch/patient launch/encounter patient/*.read openid fhirUser')}&` +
    `state=${state}&` +
    `aud=${encodeURIComponent(iss)}&` +
    `launch=${launch}`;
  
  window.location.href = authUrl;
}

handleEHRLaunch();
```

---

## Standalone Launch (Patient-Initiated)

### The Consumer Workflow

**Scenario**: Amy Shaw opens her blood pressure tracking app on her phone. She wants to import data from her EHR.

**What happens**:

1. App asks: "Which health system do you use?" (or user enters FHIR URL)
2. App discovers OAuth endpoints
3. App redirects to authorization **without launch token**
4. User authenticates with EHR credentials
5. User explicitly authorizes data sharing
6. App receives access token with patient ID (Amy's own ID)
7. App fetches Amy's data

**Key advantage**: Works outside EHR context. Patient controls data sharing.

### Configuration

**Your app has pre-configured FHIR server URLs**:

```javascript
const fhirServers = [
  {
    name: "Epic Production",
    url: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
  },
  {
    name: "Cerner Sandbox",
    url: "https://fhir-myrecord.cerner.com/r4"
  },
  {
    name: "SMART Health IT Sandbox",
    url: "https://launch.smarthealthit.org/v/r4/fhir"
  }
];
```

Or user enters custom URL.

### Authorization Request (Standalone Launch)

**Your app redirects to authorization endpoint**:

```http
GET https://auth.example.org/authorize?
  response_type=code&
  client_id=your_app_id&
  redirect_uri=https://your-app.com/callback&
  scope=patient/*.read offline_access openid fhirUser&
  state=def456&
  aud=https://fhir.example.org
```

**Differences from EHR launch**:
- ❌ No `launch` parameter (no context token)
- ❌ No `launch` scope
- ❌ No `launch/patient` or `launch/encounter` scopes
- ✅ Use `patient/*.read` (scoped to authenticated patient)
- ✅ Request `offline_access` for long-term access

### Authentication and Consent

**User sees**:

```
┌────────────────────────────────────┐
│  Example Hospital Portal           │
├────────────────────────────────────┤
│  Username: amy.shaw@example.com    │
│  Password: ••••••••                │
│                                    │
│  [ Log In ]                        │
└────────────────────────────────────┘

    ↓ (After login)

┌────────────────────────────────────┐
│  Blood Pressure Tracker            │
│  is requesting access to:          │
├────────────────────────────────────┤
│  ☑ Your demographics               │
│  ☑ Your vital signs                │
│  ☑ Your conditions                 │
│  ☑ Keep access after you log out  │
│                                    │
│  [ Deny ]         [ Allow ]        │
└────────────────────────────────────┘
```

**User authenticates as patient** (not as provider). Authorization server knows this is Amy Shaw.

### Token Response (Standalone Launch)

**Authorization server returns patient context**:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "patient/*.read offline_access openid fhirUser",
  "patient": "smart-1288992",
  "fhirUser": "https://fhir.example.org/Patient/smart-1288992",
  "refresh_token": "refresh_abc123"
}
```

**Key differences**:

- **`patient`**: Authenticated patient's ID (Amy's own ID)
- **`fhirUser`**: Points to Patient resource (not Practitioner)
- **`refresh_token`**: Present if `offline_access` granted (long-term access)
- ❌ No `encounter` (not launched from EHR context)

### Example Implementation (JavaScript)

```javascript
// Configuration
const FHIR_SERVER = 'https://launch.smarthealthit.org/v/r4/fhir';

async function handleStandaloneLaunch() {
  // Discover OAuth endpoints
  const config = await fetch(`${FHIR_SERVER}/.well-known/smart-configuration`).then(r => r.json());
  
  // Build authorization URL
  const state = generateRandomString();
  sessionStorage.setItem('state', state);
  sessionStorage.setItem('iss', FHIR_SERVER);
  
  const authUrl = `${config.authorization_endpoint}?` +
    `response_type=code&` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent('patient/*.read offline_access openid fhirUser')}&` +
    `state=${state}&` +
    `aud=${encodeURIComponent(FHIR_SERVER)}`;
  
  window.location.href = authUrl;
}

handleStandaloneLaunch();
```

---

## Comparison: EHR Launch vs. Standalone Launch

| Aspect | EHR Launch | Standalone Launch |
|--------|------------|-------------------|
| **Initiated by** | EHR (provider clicks button) | Patient (opens app directly) |
| **Context** | Automatic (patient + encounter) | User-determined (their own data) |
| **`launch` parameter** | Required | Not used |
| **`launch` scope** | Required | Not included |
| **`launch/patient` scope** | Request if needed | Not included |
| **Patient selection** | Automatic | Authenticated user |
| **Use case** | Clinical decision support, order entry | Patient portals, fitness apps |
| **Typical scopes** | `user/*.read` (provider access) | `patient/*.read` (own data) |
| **refresh_token** | Optional (provider might log out) | Common (ongoing access) |

---

## SMART Launch Sequence Diagram

Here is a visual overview of the launch flow for reference:

```mermaid
sequenceDiagram
    participant User
    participant EHR
    participant App
    participant Auth as Authorization Server
    participant FHIR as FHIR Server

    User->>EHR: Select SMART App
    EHR->>Auth: Launch request with iss, launch params
    Auth->>App: Redirect to app launch URL
    App->>Auth: Authorization request with client_id, scope, redirect_uri
    Auth->>User: Present authorization screen
    User->>Auth: Approve access
    Auth->>App: Redirect with authorization code
    App->>Auth: Exchange code for access token
    Auth->>App: Return access token + patient context
    App->>FHIR: Request resources with Bearer token
    FHIR->>App: Return FHIR resources
    App->>User: Display patient data
```

---

## Handling Both Launch Types

**Smart apps often support both patterns**:

```javascript
// Detect launch type
function detectLaunchType() {
  const params = new URLSearchParams(window.location.search);
  
  if (params.has('iss') && params.has('launch')) {
    return 'ehr-launch';
  } else if (window.location.pathname === '/standalone-launch') {
    return 'standalone-launch';
  } else {
    return 'unknown';
  }
}

// Route accordingly
const launchType = detectLaunchType();

if (launchType === 'ehr-launch') {
  handleEHRLaunch();
} else if (launchType === 'standalone-launch') {
  handleStandaloneLaunch();
} else {
  showLaunchSelector(); // Let user choose
}
```

---

## Common Launch Errors

### Error: invalid_request (missing launch parameter)

**Cause**: EHR launch without `launch` parameter in authorization request

```json
{
  "error": "invalid_request",
  "error_description": "Missing required parameter: launch"
}
```

**Fix**: Include `launch` parameter from EHR redirect, and `launch` scope.

---

### Error: Patient context not available

**Cause**: Requested `launch/patient` but EHR didn't provide patient context

**Fix**: Check if patient is actually selected in EHR before launching app.

---

### Error: Scope not supported

**Cause**: EHR doesn't support requested scope (e.g., `launch/encounter`)

```json
{
  "error": "invalid_scope",
  "error_description": "Scope not supported: launch/encounter"
}
```

**Fix**: Check CapabilityStatement for supported scopes. Make optional scopes gracefully degrade.

---

## Best Practices

### 1. Declare Launch Types in Client Registration

Tell EHR which launch patterns you support:

```json
{
  "client_id": "your_app_id",
  "launch_uri": "https://your-app.com/launch",
  "redirect_uris": ["https://your-app.com/callback"],
  "grant_types": ["authorization_code"],
  "scope": "launch launch/patient patient/*.read"
}
```

---

### 2. Validate Context After Token Exchange

```javascript
// EHR launch - verify patient context
if (tokenResponse.patient) {
  console.log(`Launched for patient: ${tokenResponse.patient}`);
} else {
  console.error('Expected patient context but none provided');
}

// Standalone launch - verify authenticated as patient
if (tokenResponse.fhirUser?.includes('/Patient/')) {
  console.log('Authenticated as patient');
} else {
  console.warn('Unexpected user type');
}
```

---

### 3. Handle Missing Context Gracefully

```javascript
// If encounter context not provided, prompt user
if (!tokenResponse.encounter) {
  // Show encounter selector UI
  const encounters = await fetchEncounters(tokenResponse.patient);
  const selected = await promptUserToSelectEncounter(encounters);
  // Continue with selected encounter
}
```

---

## Next Steps

We saw how apps are launched. Next, let's explore the granular permissions controlled by SMART scopes.