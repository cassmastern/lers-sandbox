# SMART-on-FHIR Architecture Overview

## High-level Architecture

Below is a high-level diagram showing FHIR architecture.

```mermaid
graph TB
    subgraph "SMART App"
        A[Client Application]
        B[SMART Library]
    end
  
    subgraph "Authorization Server"
        C[OAuth 2.0 Server]
        D[Launch Context]
    end
  
    subgraph "FHIR Server"
        E[FHIR API]
        F[Resource Store]
    end
  
    A --> B
    B --> C
    C --> D
    B --> E
    E --> F
  
    A -.->|1. Launch Request| C
    C -.->|2. Authorization Code| B
    B -.->|3. Token Exchange| C
    C -.->|4. Access Token| B
    B -.->|5. API Requests| E
    E -.->|6. FHIR Resources| B
```

Let's examine its core components and their interactions.

## The Three-Party Dance

Every SMART-on-FHIR interaction involves three actors. Understanding their roles is crucial to grasping how the system works:

### 1. The FHIR Server (Data Source)

**What it does**: Stores and exposes clinical data through FHIR REST APIs.

**Examples**:

- Epic's FHIR endpoint (`https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4`)
- Cerner's endpoint (`https://fhir-myrecord.cerner.com/r4`)
- Public sandboxes like SMART Health IT (`https://launch.smarthealthit.org/v/r4/fhir`)

**Responsibilities**:

- Authenticate requests (via OAuth tokens)
- Authorize access based on scopes
- Return FHIR resources matching search criteria
- Validate and accept resource submissions (if write access granted)

**Key capability**: The FHIR server's `/metadata` endpoint returns a `CapabilityStatement` describing what resources it supports, what operations are allowed, and where to find authorization endpoints.

### 2. The Authorization Server (Security Gatekeeper)

**What it does**: Issues access tokens after verifying identity and permissions.

**Examples**:

- Often the same system as the FHIR server (e.g., Epic's OAuth service)
- Sometimes a separate identity provider (e.g., hospital SSO)

**Responsibilities**:

- Present login screens (for EHR-launch) or validate launch tokens (for provider-launch)
- Display consent screens ("Allow this app to access your medications?")
- Issue short-lived access tokens (typically 1 hour expiry)
- Provide refresh tokens for long-running access

**OAuth endpoints**:

- `/authorize`: Where users log in and grant consent
- `/token`: Where apps exchange authorization codes for access tokens

### 3. The SMART App (Client Application)

**What it does**: Requests data, processes it, and presents results to users.

**Examples**:

- A web app embedded in an EHR iframe
- A standalone patient portal
- A mobile app connecting to multiple EHRs

**Responsibilities**:

- Discover authorization endpoints (via `/metadata`)
- Initiate OAuth flow (authorization code grant)
- Store and refresh access tokens securely
- Make authenticated FHIR API calls
- Handle errors gracefully (expired tokens, missing data, etc.)

## The Two Launch Patterns

SMART apps can start in two fundamentally different ways, each with distinct security implications:

### EHR Launch (Provider Context)

**Scenario**: A clinician clicks an app button inside their EHR while viewing a patient chart.

**Flow**:

1. **EHR initiates**: Redirects to app with launch context parameters
   ```
   https://app.example.com?
     iss=https://fhir.example.org&
     launch=eyJhbGciOiJIUzI1NiIs...
   ```
2. **App discovers endpoints**: Fetches `iss` metadata to find OAuth URLs
3. **App redirects to authorization**: Includes `launch` parameter to maintain context
4. **Authorization server validates**: Checks that launch token is valid and unexpired
5. **User grants consent**: (Or consent is pre-approved for integrated apps)
6. **App receives token**: Access token includes patient/encounter context automatically

**Key advantage**: The app automatically knows *which* patient and encounter to work with—no manual selection needed. The clinician's workflow is seamless.

**Launch parameters passed back**:

```json
{
  "patient": "smart-1288992",
  "encounter": "smart-encounter-123",
  "user": "Practitioner/smart-pract-456"
}
```

### Standalone Launch (Patient Access)

**Scenario**: A patient opens your app directly (mobile app, web portal) outside any EHR.

**Flow**:

1. **User initiates**: Opens app, enters EHR's FHIR base URL
2. **App discovers endpoints**: Fetches metadata
3. **App redirects to authorization**: No `launch` parameter—user will log in fresh
4. **User authenticates**: Enters credentials at EHR's login page
5. **User grants consent**: Explicitly authorizes data access
6. **App receives token**: Access token includes patient ID *if* user authenticated as patient

**Key difference**: No pre-selected patient context. If scopes allow (`patient/*.read`), the token represents the authenticated patient. If scopes require launch context (`launch/patient`), this flow fails.

**Use case**: Patient-facing apps, research studies, population health tools accessing multiple patients.

## Actors and Flows — Sequence

Now that you understand the actors and flows, here's how they connect:

```mermaid
sequenceDiagram
    participant U as User (Clinician/Patient)
    participant A as SMART App
    participant EHR as FHIR Server
    participant Auth as Authorization Server

    Note over U,Auth: 1. Discovery Phase
    A->>EHR: GET /metadata
    EHR-->>A: CapabilityStatement<br/>(OAuth URLs, supported resources)

    Note over U,Auth: 2. Authorization Phase (EHR Launch)
    U->>EHR: Click app button in EHR
    EHR->>A: Redirect with iss + launch token
    A->>Auth: GET /authorize?<br/>client_id, scope, redirect_uri, launch
    Auth->>U: Login prompt (if needed)
    U->>Auth: Credentials + Consent
    Auth->>A: Redirect with authorization code
    A->>Auth: POST /token<br/>(code, client_secret)
    Auth-->>A: Access token + patient context

    Note over U,Auth: 3. Data Access Phase
    A->>EHR: GET /Patient/{id}<br/>(Authorization: Bearer {token})
    EHR-->>A: Patient resource
    A->>EHR: GET /Observation?patient={id}&category=vital-signs
    EHR-->>A: Bundle of Observations
    A->>U: Display vitals in app UI

    Note over U,Auth: 4. Token Refresh (after 1 hour)
    A->>Auth: POST /token<br/>(refresh_token, grant_type=refresh_token)
    Auth-->>A: New access token
```

## Data Flow Zoom-In: Reading a Patient's Vitals

Let's trace a real request to see how the pieces interact:

**1. App has valid access token with scope `patient/Observation.read`**

**2. App constructs search query**:

```http
GET /Observation?patient=smart-1288992&category=vital-signs&_sort=-date&_count=10
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Accept: application/fhir+json
```

**3. FHIR server validates**:

- Is the token signature valid? (JWT verification)
- Is the token expired? (Check `exp` claim)
- Does the scope allow `Observation.read`? (Check `scope` claim)
- Is `smart-1288992` the authorized patient? (Check `patient` claim or resource-level permissions)

**4. Server executes search**:

- Filter: `subject=Patient/smart-1288992`
- Filter: `category=http://terminology.hl7.org/CodeSystem/observation-category|vital-signs`
- Sort: Descending by `effectiveDateTime`
- Limit: 10 results

**5. Server returns Bundle**:

```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 47,
  "entry": [
    {
      "resource": {
        "resourceType": "Observation",
        "id": "bp-12345",
        "status": "final",
        "category": [{
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
            "code": "vital-signs"
          }]
        }],
        "code": {
          "coding": [{
            "system": "http://loinc.org",
            "code": "85354-9",
            "display": "Blood pressure panel"
          }]
        },
        "subject": {"reference": "Patient/smart-1288992"},
        "effectiveDateTime": "2024-11-01T10:30:00Z",
        "component": [
          {
            "code": {
              "coding": [{
                "system": "http://loinc.org",
                "code": "8480-6",
                "display": "Systolic blood pressure"
              }]
            },
            "valueQuantity": {
              "value": 128,
              "unit": "mmHg",
              "system": "http://unitsofmeasure.org",
              "code": "mm[Hg]"
            }
          },
          {
            "code": {
              "coding": [{
                "system": "http://loinc.org",
                "code": "8462-4",
                "display": "Diastolic blood pressure"
              }]
            },
            "valueQuantity": {
              "value": 82,
              "unit": "mmHg",
              "system": "http://unitsofmeasure.org",
              "code": "mm[Hg]"
            }
          }
        ]
      }
    },
    // ... 9 more Observation resources
  ]
}
```

**6. App parses and displays**: Extracts systolic/diastolic values, renders chart.

## Security Boundaries

Understanding where trust lies is critical:

### What the FHIR Server Trusts

- **The authorization server**: Tokens issued by the auth server are trusted implicitly (via JWT signature verification)
- **The app registration**: Client IDs are pre-registered; the server knows which apps are allowed

### What the Authorization Server Trusts

- **The user's credentials**: Password, biometric, SSO token
- **The app's redirect URI**: Must match registered value to prevent token theft
- **The launch context**: If provided by the EHR, it's trusted as authentic

### What the App Must NOT Trust

- **Data in URLs**: Launch tokens and authorization codes are sensitive—never log them
- **User input as patient IDs**: Always use IDs from the token's context claims
- **Expired tokens**: Must handle 401 Unauthorized and refresh proactively

### What the User Controls

- **Consent scope**: Can deny access to specific resource types
- **Session duration**: Can revoke app access in EHR settings (which invalidates tokens)

## Common Architectural Patterns

### Pattern 1: Embedded iFrame

**Use case**: EHR-integrated app that fits within EHR's UI chrome.

**Pros**: Seamless UX, automatic context, fast launch.

**Cons**: Limited screen real estate, cross-origin restrictions, EHR dictates lifecycle.

### Pattern 2: Standalone Web App
**Use case**: Patient portal or research tool accessing multiple EHRs.

**Pros**: Full control over UI/UX, works across vendors, can aggregate data.

**Cons**: User must know EHR's FHIR URL, manual authentication per EHR.

### Pattern 3: Backend Service (B2B)

**Use case**: Population health analytics, bulk data export.

**Pros**: No user interaction, can run scheduled jobs, access all patients.

**Cons**: Requires system-level scopes (`system/*.read`), higher security bar, not all servers support.

**Auth flow**: Client credentials grant (no user login).

### Pattern 4: Mobile Native App

**Use case**: Patient-facing iOS/Android app.

**Pros**: Best mobile UX, push notifications, offline support.

**Cons**: Securely storing refresh tokens, handling deep links, passing app store review.

**Key consideration**: Use PKCE (Proof Key for Code Exchange) to prevent authorization code interception.

## What Makes This Architecture Resilient?

### Standards-Based

- OAuth 2.0 is battle-tested across industries
- FHIR builds on web standards (REST, JSON, HTTP)
- Extensibility through profiles and extensions

### Decentralized Trust

- No central authority needed (unlike proprietary APIs)
- Each organization runs its own servers
- Apps can discover capabilities dynamically

### Scope Isolation

- Fine-grained permissions prevent over-access
- Users can audit what apps accessed in EHR logs
- Servers can revoke misbehaving apps

### Backward Compatibility

- FHIR R4 is the current stable version
- Servers can support multiple FHIR versions
- Apps can negotiate capabilities via CapabilityStatement

## Next Steps

This should have covered the architecture just enough to comfortably zoom into the actual FHIR resources that flow through FHIR's data pipes.
