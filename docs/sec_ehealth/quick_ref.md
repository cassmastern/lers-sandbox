# SMART-on-FHIR and Integration Quick Reference

## Quick Start Checklist

- [ ] Register app with EHR/HALO
- [ ] Obtain `client_id` (and `client_secret` for confidential clients)
- [ ] Configure redirect URIs
- [ ] Discover SMART endpoints via `.well-known/smart-configuration`
- [ ] Implement OAuth 2.0 authorization flow with PKCE
- [ ] Handle token lifecycle (refresh, expiration)
- [ ] Test in sandbox environment

---

## Discovery Endpoint

```http
GET https://[fhir-base]/.well-known/smart-configuration
```

**Returns:**
```json
{
  "authorization_endpoint": "https://auth.example.com/authorize",
  "token_endpoint": "https://auth.example.com/token",
  "token_endpoint_auth_methods_supported": ["client_secret_basic"],
  "registration_endpoint": "https://auth.example.com/register",
  "scopes_supported": ["launch", "launch/patient", "patient/*.read"],
  "response_types_supported": ["code"],
  "capabilities": [
    "launch-ehr",
    "launch-standalone",
    "client-public",
    "client-confidential-symmetric",
    "context-ehr-patient",
    "sso-openid-connect"
  ]
}
```

---

## Authorization Flow

### Step 1: Authorization Request (EHR Launch)

```http
GET /authorize?
  response_type=code&
  client_id=[YOUR_CLIENT_ID]&
  redirect_uri=[YOUR_REDIRECT_URI]&
  scope=launch/patient patient/*.read&
  state=[RANDOM_STRING]&
  aud=[FHIR_BASE_URL]&
  launch=[LAUNCH_TOKEN]&
  code_challenge=[SHA256_HASH]&
  code_challenge_method=S256
```

### Step 2: Authorization Request (Standalone Launch)

```http
GET /authorize?
  response_type=code&
  client_id=[YOUR_CLIENT_ID]&
  redirect_uri=[YOUR_REDIRECT_URI]&
  scope=patient/*.read openid fhirUser&
  state=[RANDOM_STRING]&
  aud=[FHIR_BASE_URL]&
  code_challenge=[SHA256_HASH]&
  code_challenge_method=S256
```

**Note:** No `launch` parameter in standalone!

### Step 3: Token Exchange

```http
POST /token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic [BASE64(client_id:client_secret)]  // For confidential clients

grant_type=authorization_code&
code=[AUTH_CODE]&
redirect_uri=[YOUR_REDIRECT_URI]&
client_id=[YOUR_CLIENT_ID]&
code_verifier=[ORIGINAL_VERIFIER]
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1Qi...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "launch/patient patient/*.read",
  "patient": "123456",
  "encounter": "789",
  "refresh_token": "eyJ0eXAiOiJKV1Qi...",
  "id_token": "eyJ0eXAiOiJKV1Qi..."  // If openid scope
}
```

### Step 4: Token Refresh

```http
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token=[REFRESH_TOKEN]&
client_id=[YOUR_CLIENT_ID]&
scope=[ORIGINAL_SCOPES]
```

---

## SMART Scopes

### Context Scopes
| Scope | Description |
|-------|-------------|
| `launch` | Indicates EHR launch |
| `launch/patient` | Request patient context at launch |
| `launch/encounter` | Request encounter context at launch |

### Patient-Specific Scopes
| Scope | Description |
|-------|-------------|
| `patient/*.read` | Read all resources for patient in context |
| `patient/*.write` | Write all resources for patient in context |
| `patient/*.*` | Read and write all resources |
| `patient/Observation.read` | Read only Observations for patient |
| `patient/Condition.read` | Read only Conditions for patient |
| `patient/MedicationRequest.read` | Read only MedicationRequests |

### User Scopes
| Scope | Description |
|-------|-------------|
| `user/*.read` | Read all resources user can access |
| `user/*.write` | Write all resources user can access |
| `user/Practitioner.read` | Read Practitioner resources |

### System Scopes (Backend Services)
| Scope | Description |
|-------|-------------|
| `system/*.read` | Read all resources (backend only) |
| `system/*.write` | Write all resources (backend only) |

### Special Scopes
| Scope | Description |
|-------|-------------|
| `openid` | OpenID Connect authentication |
| `fhirUser` | Get FHIR resource reference for user |
| `profile` | Get user profile info |
| `offline_access` | Request refresh token |
| `online_access` | Token valid only while user online |

---

## FHIR API Requests

### Read Single Resource

```http
GET /Patient/123456
Authorization: Bearer [ACCESS_TOKEN]
Accept: application/fhir+json
```

### Search Resources

```http
GET /Observation?patient=123456&category=vital-signs&date=ge2024-01-01
Authorization: Bearer [ACCESS_TOKEN]
Accept: application/fhir+json
```

### Common Search Parameters
- `patient` - Filter by patient
- `_id` - Resource ID
- `_lastUpdated` - Last update time
- `_count` - Number of results
- `_sort` - Sort order
- `date` - Date range (use `ge`, `le`, `gt`, `lt` prefixes)
- `code` - Filter by code
- `status` - Filter by status

### Create Resource

```http
POST /Observation
Authorization: Bearer [ACCESS_TOKEN]
Content-Type: application/fhir+json

{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "29463-7",
      "display": "Body Weight"
    }]
  },
  "subject": { "reference": "Patient/123456" },
  "valueQuantity": {
    "value": 70,
    "unit": "kg",
    "system": "http://unitsofmeasure.org",
    "code": "kg"
  }
}
```

### Update Resource

```http
PUT /Observation/789
Authorization: Bearer [ACCESS_TOKEN]
Content-Type: application/fhir+json

{
  "resourceType": "Observation",
  "id": "789",
  ... [complete updated resource]
}
```

### Delete Resource

```http
DELETE /Observation/789
Authorization: Bearer [ACCESS_TOKEN]
```

---

## PKCE Implementation

### Generate Code Verifier

```javascript
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}
```

### Generate Code Challenge

```javascript
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(buffer) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

---

## Common FHIR Resources

### Patient
```json
{
  "resourceType": "Patient",
  "id": "123",
  "name": [{ "family": "Smith", "given": ["John"] }],
  "birthDate": "1970-01-01",
  "gender": "male",
  "identifier": [{
    "system": "http://hospital.org/mrn",
    "value": "12345"
  }]
}
```

### Observation (Vital Signs)
```json
{
  "resourceType": "Observation",
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
      "display": "Blood pressure"
    }]
  },
  "subject": { "reference": "Patient/123" },
  "effectiveDateTime": "2024-01-15T10:30:00Z",
  "component": [
    {
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8480-6",
          "display": "Systolic"
        }]
      },
      "valueQuantity": { "value": 120, "unit": "mmHg" }
    },
    {
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8462-4",
          "display": "Diastolic"
        }]
      },
      "valueQuantity": { "value": 80, "unit": "mmHg" }
    }
  ]
}
```

### Condition (Diagnosis)
```json
{
  "resourceType": "Condition",
  "clinicalStatus": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
      "code": "active"
    }]
  },
  "code": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "73211009",
      "display": "Diabetes mellitus"
    }]
  },
  "subject": { "reference": "Patient/123" },
  "onsetDateTime": "2020-03-15"
}
```

### MedicationRequest
```json
{
  "resourceType": "MedicationRequest",
  "status": "active",
  "intent": "order",
  "medicationCodeableConcept": {
    "coding": [{
      "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
      "code": "206765",
      "display": "Metformin 500 MG"
    }]
  },
  "subject": { "reference": "Patient/123" },
  "dosageInstruction": [{
    "text": "Take 1 tablet twice daily with meals",
    "timing": {
      "repeat": { "frequency": 2, "period": 1, "periodUnit": "d" }
    },
    "doseAndRate": [{
      "doseQuantity": { "value": 1, "unit": "tablet" }
    }]
  }]
}
```

---

## Error Handling

### OAuth Errors (Authorization Callback)
```javascript
const params = new URLSearchParams(window.location.search);
if (params.has('error')) {
  const error = params.get('error');
  const description = params.get('error_description');
  
  switch(error) {
    case 'access_denied':
      // User denied consent
      break;
    case 'invalid_scope':
      // Requested scope not available
      break;
    case 'server_error':
      // Server error occurred
      break;
  }
}
```

### HTTP Status Codes
| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Fix request format/validation |
| 401 | Unauthorized | Token expired/invalid - refresh or re-auth |
| 403 | Forbidden | Insufficient scope - request more scopes |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Implement backoff, check Retry-After header |
| 500 | Server Error | Retry with exponential backoff |

### FHIR OperationOutcome
```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "invalid",
    "diagnostics": "Missing required field: subject",
    "location": ["Observation.subject"]
  }]
}
```

---

## Testing Tools

### SMART App Launcher
```
https://launch.smarthealthit.org/
```
- Test EHR and standalone launches
- Inspect requests/responses
- Multiple patient scenarios

### HAPI FHIR Server (Public Test Server)
```
https://hapi.fhir.org/baseR4
```

### Postman Collection
Import SMART-on-FHIR collection for API testing

### curl Examples

**Get Patient:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/fhir+json" \
     https://fhir.example.com/Patient/123
```

**Search Observations:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/fhir+json" \
     "https://fhir.example.com/Observation?patient=123&category=vital-signs"
```

---

## HALO-Specific Gotchas

### Token Expiration
- **Default:** 1 hour
- **Action:** Implement proactive refresh (e.g., at 55 minutes)
- **Test:** Verify refresh token flow works

### Rate Limiting
- **Typical Limit:** 100 requests/minute
- **Headers:** Check `X-RateLimit-*` headers
- **Strategy:** Implement exponential backoff and request batching

### Redirect URI Matching
- Must match **exactly** (including trailing slash, protocol, port)
- Test: `https://app.com/callback` ≠ `https://app.com/callback/`

### Scope Requirements
- Some HALO deployments require specific scopes beyond SMART standard
- Check: HALO documentation for custom scopes
- Example: `halo/custom.read`

### Tenant Isolation
- Multi-tenant HALO deployments may require tenant ID in requests
- Header: `X-Tenant-ID: your-tenant-id`
- Check: HALO configuration docs

### FHIR Profiles
- HALO may use custom FHIR profiles with additional required fields
- Validate: Resources against HALO's CapabilityStatement
- Example: Custom extensions on Patient resource

---

## Security Best Practices

### ✅ DO
- Use PKCE for all public clients
- Validate `state` parameter on callback
- Store tokens securely (httpOnly cookies, secure storage)
- Use HTTPS everywhere
- Implement token rotation
- Request minimal necessary scopes
- Set short token expiration times
- Log security events
- Validate JWT signatures
- Sanitize all user input

### ❌ DON'T
- Store tokens in localStorage (XSS vulnerable)
- Include tokens in URLs
- Share client credentials
- Use implicit flow (deprecated)
- Skip state validation
- Request more scopes than needed
- Ignore token expiration
- Log sensitive data (tokens, PHI)
- Trust client-side data without validation

---

## Quick Reference URLs

| Resource | URL |
|----------|-----|
| SMART Spec | http://hl7.org/fhir/smart-app-launch/ |
| FHIR R4 Spec | http://hl7.org/fhir/R4/ |
| SMART Sandbox | https://launch.smarthealthit.org/ |
| OAuth 2.0 RFC | https://tools.ietf.org/html/rfc6749 |
| PKCE RFC | https://tools.ietf.org/html/rfc7636 |
| JWT RFC | https://tools.ietf.org/html/rfc7519 |

---

## Debugging Checklist

- [ ] Verify SMART configuration endpoint is accessible
- [ ] Check redirect URI matches exactly
- [ ] Confirm client_id is correct
- [ ] Validate state parameter
- [ ] Check PKCE verifier/challenge match
- [ ] Verify scopes are supported by EHR
- [ ] Check token hasn't expired
- [ ] Confirm Authorization header format: `Bearer <token>`
- [ ] Validate FHIR resource structure
- [ ] Check for CORS issues (browser console)
- [ ] Review server logs for detailed errors
- [ ] Test with known-good access token
- [ ] Verify network connectivity to FHIR server
- [ ] Check for rate limiting (429 responses)
- [ ] Validate aud parameter matches FHIR base URL

---

## Common Integration Patterns

### Pattern 1: Simple Patient Dashboard
1. EHR launches app with patient context
2. App exchanges code for token (includes patient ID)
3. App fetches: Patient, Observations, Conditions, Medications
4. Display summary dashboard

### Pattern 2: Clinical Decision Support
1. App requests `patient/*.read` and `user/Practitioner.read`
2. Fetch patient data and analyze
3. Display recommendations based on clinical rules
4. Optionally write back results with `patient/*.write`

### Pattern 3: Data Entry App
1. Request `patient/*.write` scope
2. Validate input data against FHIR profiles
3. POST/PUT resources to FHIR server
4. Handle validation errors and retry

### Pattern 4: Batch Data Analysis (Backend)
1. Use system scopes (`system/*.read`)
2. Authenticate with client credentials
3. Query multiple patient records
4. Perform population-level analytics

---

## Pro Tips

### Optimize FHIR Queries
```http
# Use _revinclude to get related resources in one call
GET /Patient/123?_revinclude=Observation:patient

# Use _elements to limit returned fields
GET /Patient/123?_elements=id,name,birthDate

# Use _summary for lightweight responses
GET /Patient/123?_summary=true

# Batch requests to reduce round trips
POST / 
Content-Type: application/fhir+json
{
  "resourceType": "Bundle",
  "type": "batch",
  "entry": [
    { "request": { "method": "GET", "url": "Patient/123" } },
    { "request": { "method": "GET", "url": "Observation?patient=123" } }
  ]
}
```

### Token Management Strategy
```javascript
class TokenManager {
  constructor() {
    this.refreshThreshold = 300000; // 5 minutes before expiry
  }
  
  shouldRefresh(expiresAt) {
    return Date.now() >= (expiresAt - this.refreshThreshold);
  }
  
  async getValidToken() {
    const tokenData = this.getStoredToken();
    
    if (this.shouldRefresh(tokenData.expiresAt)) {
      return await this.refreshToken();
    }
    
    return tokenData.accessToken;
  }
}
```

### Error Recovery Pattern
```javascript
async function fhirRequestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 401) {
        // Token expired, refresh and retry
        await refreshToken();
        continue;
      }
      
      if (response.status === 429) {
        // Rate limited, wait and retry
        const retryAfter = response.headers.get('Retry-After') || Math.pow(2, i);
        await sleep(retryAfter * 1000);
        continue;
      }
      
      if (response.ok) {
        return await response.json();
      }
      
      throw new Error(`HTTP ${response.status}`);
      
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

### Secure Token Storage (Browser)
```javascript
// ✅ Use httpOnly cookie (set by backend)
// Backend sets cookie after token exchange
res.cookie('smart_token', tokenData, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600000
});

// ✅ Use sessionStorage for temporary data
sessionStorage.setItem('patient_context', JSON.stringify({
  patientId: tokenData.patient,
  encounterId: tokenData.encounter
}));

// ❌ Never use localStorage for tokens (XSS vulnerable)
localStorage.setItem('access_token', token); // DON'T DO THIS!
```

---

## 🎓 Learning Path

### Beginner
1. Understand OAuth 2.0 basics
2. Set up SMART sandbox account
3. Try EHR launch with sample app
4. Read basic FHIR resources (Patient, Observation)
5. Implement simple patient dashboard

### Intermediate
1. Implement PKCE flow from scratch
2. Handle token refresh logic
3. Work with complex FHIR resources (Bundle, DocumentReference)
4. Implement error handling and retry logic
5. Add write capabilities

### Advanced
1. Implement backend services with system scopes
2. Custom FHIR profiles and extensions
3. Performance optimization (batching, caching)
4. Production deployment and monitoring
5. Security hardening and penetration testing

---

## Troubleshooting Guide

### Issue: "Invalid redirect URI"
**Cause:** URI mismatch between request and registration  
**Solution:** 
- Check exact match including protocol, port, path, trailing slash
- Verify registration in EHR app registry
- Test: `https://app.com/callback` vs `https://app.com/callback/`

### Issue: "Invalid scope"
**Cause:** Requested scope not supported by EHR  
**Solution:**
- Check `.well-known/smart-configuration` for `scopes_supported`
- Request only necessary scopes
- Verify EHR supports SMART App Launch 2.0

### Issue: Token expired immediately
**Cause:** Clock skew between systems  
**Solution:**
- Sync system clocks (use NTP)
- Add buffer time when checking expiration
- Implement proactive token refresh

### Issue: 403 Forbidden on FHIR request
**Cause:** Insufficient scope or patient context mismatch  
**Solution:**
- Verify token includes required scope
- Check patient ID matches context
- Review OperationOutcome for details

### Issue: CORS errors in browser
**Cause:** Browser blocking cross-origin requests  
**Solution:**
- Proxy FHIR requests through your backend
- Configure CORS headers on FHIR server (if you control it)
- Use server-side token exchange

### Issue: Rate limit errors (429)
**Cause:** Too many requests in short time  
**Solution:**
- Implement exponential backoff
- Use batch requests to consolidate calls
- Cache responses when appropriate
- Check `Retry-After` header

---

## Pre-Production Checklist

### Security
- [ ] PKCE implemented for public clients
- [ ] State parameter validated
- [ ] Tokens stored securely (not in localStorage)
- [ ] HTTPS enforced everywhere
- [ ] Client secret secured (if confidential client)
- [ ] Input validation on all user data
- [ ] JWT signatures verified
- [ ] Sensitive data not logged

### Functionality
- [ ] Token refresh implemented
- [ ] Error handling for all API calls
- [ ] Offline mode (if applicable)
- [ ] Data validation before FHIR POST/PUT
- [ ] Loading states in UI
- [ ] Graceful degradation

### Performance
- [ ] Request batching where possible
- [ ] Response caching strategy
- [ ] Rate limiting handling
- [ ] Lazy loading of data
- [ ] Optimized FHIR queries (_elements, _summary)

### Compliance
- [ ] HIPAA compliance review
- [ ] Patient consent flow
- [ ] Audit logging
- [ ] Data retention policy
- [ ] Privacy policy updated
- [ ] Terms of service

### Testing
- [ ] Unit tests for core logic
- [ ] Integration tests with FHIR server
- [ ] E2E tests for critical flows
- [ ] Security testing (OWASP Top 10)
- [ ] Load testing
- [ ] Cross-browser testing

### Monitoring
- [ ] Error tracking (e.g., Sentry)
- [ ] Performance monitoring (e.g., New Relic)
- [ ] Uptime monitoring
- [ ] Log aggregation
- [ ] Alert configuration
- [ ] Dashboard for key metrics

---

## Support Resources

### Official Documentation
- **SMART App Launch**: http://hl7.org/fhir/smart-app-launch/
- **FHIR R4**: http://hl7.org/fhir/R4/
- **HL7 FHIR Chat**: https://chat.fhir.org/

### Community
- **FHIR Zulip**: https://chat.fhir.org/
- **HL7 FHIR List**: https://chat.fhir.org/#narrow/stream/179166-implementers
- **Stack Overflow**: Tag `fhir` or `smart-on-fhir`

### Testing Tools
- **SMART App Launcher**: https://launch.smarthealthit.org/
- **HAPI Test Server**: https://hapi.fhir.org/baseR4
- **Inferno Test Suite**: https://inferno.healthit.gov/
- **Touchstone Testing**: https://touchstone.aegis.net/

### Libraries
- **JavaScript**: fhirclient.js (https://github.com/smart-on-fhir/client-js)
- **Python**: fhirclient (https://github.com/smart-on-fhir/client-py)
- **Java**: HAPI FHIR (https://hapifhir.io/)
- **.NET**: Firely SDK (https://fire.ly/)

---

## HALO-Specific Quick Reference

### Typical HALO Configuration
```javascript
{
  fhirBaseUrl: 'https://fhir.halo.yourdomain.com',
  authEndpoint: 'https://auth.halo.yourdomain.com/oauth2/authorize',
  tokenEndpoint: 'https://auth.halo.yourdomain.com/oauth2/token',
  clientId: 'your-registered-client-id',
  scopes: ['launch/patient', 'patient/*.read', 'offline_access'],
  
  // HALO-specific
  tenantId: 'your-tenant-id',
  apiVersion: 'R4',
  rateLimit: 100, // requests per minute
  tokenExpiry: 3600 // 1 hour
}
```

### HALO Common Headers
```javascript
{
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
  'Accept': 'application/fhir+json',
  'Content-Type': 'application/fhir+json',
  'X-Tenant-ID': 'your-tenant-id', // If multi-tenant
  'X-Request-ID': 'unique-request-id' // For tracing
}
```

### HALO Rate Limit Handling
```javascript
async function haloRequest(url, options) {
  const response = await fetch(url, options);
  
  // Check rate limit headers
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After') || 60;
    console.warn(`Rate limited. Retry after ${retryAfter}s`);
    await sleep(retryAfter * 1000);
    return haloRequest(url, options); // Retry
  }
  
  return response;
}
```

### HALO Custom Extensions (Example)
```json
{
  "resourceType": "Patient",
  "id": "123",
  "extension": [
    {
      "url": "http://halo.example.com/fhir/StructureDefinition/patient-priority",
      "valueString": "VIP"
    },
    {
      "url": "http://halo.example.com/fhir/StructureDefinition/last-sync",
      "valueDateTime": "2024-01-15T10:30:00Z"
    }
  ],
  "name": [{ "family": "Smith", "given": ["John"] }]
}
```

---

## Common Gotchas & Solutions

### Gotcha #1: Token in URL
```javascript
// ❌ Do NOT expose token in URL/logs
window.location.href = `/dashboard?token=${accessToken}`;

// ✅ Use secure storage
sessionStorage.setItem('token_data', JSON.stringify(tokenData));
window.location.href = '/dashboard';
```

### Gotcha #2: Not Validating State
```javascript
// ❌ CSRF — vulnerable
const code = new URLSearchParams(window.location.search).get('code');
exchangeCodeForToken(code);

// ✅ Validate state
const params = new URLSearchParams(window.location.search);
const state = params.get('state');
const storedState = sessionStorage.getItem('oauth_state');

if (state !== storedState) {
  throw new Error('State mismatch - possible CSRF attack');
}
```

### Gotcha #3: Hardcoded FHIR Base URL
```javascript
// ❌ Doesn't work across environments
const fhirBase = 'https://fhir.production.com';

// ✅ Discover dynamically
const iss = new URLSearchParams(window.location.search).get('iss');
const config = await fetch(`${iss}/.well-known/smart-configuration`)
  .then(r => r.json());
```

### Gotcha #4: Ignoring Token Expiration
```javascript
// ❌ Do NOT use expired token
const token = sessionStorage.getItem('access_token');
fetch(fhirUrl, { headers: { Authorization: `Bearer ${token}` } });

// ✅ Check expiration
async function getValidToken() {
  const tokenData = JSON.parse(sessionStorage.getItem('token_data'));
  
  if (Date.now() >= tokenData.expiresAt - 60000) { // 1 min buffer
    return await refreshToken();
  }
  
  return tokenData.accessToken;
}
```

### Gotcha #5: Not Handling Bundle Pagination
```javascript
// ❌ Do NOT get first page only
const response = await fetch(`${fhirBase}/Observation?patient=123`);
const bundle = await response.json();
const observations = bundle.entry; // Missing subsequent pages!

// ✅ Follow next links
async function getAllResources(initialUrl) {
  let allResources = [];
  let url = initialUrl;
  
  while (url) {
    const response = await fetch(url, { headers: await getHeaders() });
    const bundle = await response.json();
    
    if (bundle.entry) {
      allResources.push(...bundle.entry.map(e => e.resource));
    }
    
    // Get next page URL
    url = bundle.link?.find(l => l.relation === 'next')?.url;
  }
  
  return allResources;
}
```

### Gotcha #6: Creating Resources Without Validation
```javascript
// ❌ Missing required fields
await fetch(`${fhirBase}/Observation`, {
  method: 'POST',
  body: JSON.stringify({ resourceType: 'Observation' })
  // Missing: status, code, subject - will fail!
});

// ✅ Validate before sending
function validateObservation(obs) {
  const required = ['status', 'code', 'subject'];
  const missing = required.filter(field => !obs[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (!['final', 'amended', 'corrected'].includes(obs.status)) {
    throw new Error(`Invalid status: ${obs.status}`);
  }
  
  return true;
}
```

---

## Code Snippets Library

### Complete SMART Launch (Minimal)
```javascript
// 1. Handle launch
const urlParams = new URLSearchParams(window.location.search);
const iss = urlParams.get('iss');
const launch = urlParams.get('launch');

if (iss && launch) {
  // Discover endpoints
  const config = await fetch(`${iss}/.well-known/smart-configuration`)
    .then(r => r.json());
  
  // Generate PKCE
  const verifier = generateRandomString(128);
  const challenge = await sha256(verifier).then(base64url);
  sessionStorage.setItem('verifier', verifier);
  
  // Redirect to authorize
  const authUrl = new URL(config.authorization_endpoint);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', 'my-app-id');
  authUrl.searchParams.set('redirect_uri', window.location.origin + '/callback');
  authUrl.searchParams.set('scope', 'launch/patient patient/*.read');
  authUrl.searchParams.set('state', generateRandomString(32));
  authUrl.searchParams.set('aud', iss);
  authUrl.searchParams.set('launch', launch);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  
  window.location.href = authUrl.toString();
}

// 2. Handle callback
const code = urlParams.get('code');
if (code) {
  const verifier = sessionStorage.getItem('verifier');
  
  const tokenResponse = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: window.location.origin + '/callback',
      client_id: 'my-app-id',
      code_verifier: verifier
    })
  }).then(r => r.json());
  
  sessionStorage.setItem('token', tokenResponse.access_token);
  sessionStorage.setItem('patient', tokenResponse.patient);
}
```

### FHIR Search with Filters
```javascript
async function searchObservations(patientId, filters = {}) {
  const url = new URL(`${fhirBase}/Observation`);
  
  // Base filter
  url.searchParams.set('patient', patientId);
  
  // Optional filters
  if (filters.category) {
    url.searchParams.set('category', filters.category);
  }
  
  if (filters.dateFrom) {
    url.searchParams.set('date', `ge${filters.dateFrom}`);
  }
  
  if (filters.dateTo) {
    url.searchParams.set('date', `le${filters.dateTo}`);
  }
  
  if (filters.code) {
    url.searchParams.set('code', filters.code);
  }
  
  if (filters.count) {
    url.searchParams.set('_count', filters.count);
  }
  
  if (filters.sort) {
    url.searchParams.set('_sort', filters.sort);
  }
  
  const token = await getValidToken();
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/fhir+json'
    }
  });
  
  return response.json();
}

// Usage
const vitals = await searchObservations('123', {
  category: 'vital-signs',
  dateFrom: '2024-01-01',
  count: 50,
  sort: '-date'
});
```

### Create Observation Helper
```javascript
function createObservation(patientId, code, value, unit) {
  return {
    resourceType: 'Observation',
    status: 'final',
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
        code: 'vital-signs',
        display: 'Vital Signs'
      }]
    }],
    code: {
      coding: [{
        system: 'http://loinc.org',
        code: code.code,
        display: code.display
      }]
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: new Date().toISOString(),
    valueQuantity: {
      value: value,
      unit: unit,
      system: 'http://unitsofmeasure.org',
      code: unit
    }
  };
}

// Usage
const weightObs = createObservation('123', 
  { code: '29463-7', display: 'Body Weight' },
  70, 'kg'
);

await fetch(`${fhirBase}/Observation`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/fhir+json'
  },
  body: JSON.stringify(weightObs)
});
```

---

## Performance Optimization Tips

### 1. Use Batch Requests
```javascript
const batchRequest = {
  resourceType: 'Bundle',
  type: 'batch',
  entry: [
    {
      request: {
        method: 'GET',
        url: 'Patient/123'
      }
    },
    {
      request: {
        method: 'GET',
        url: 'Observation?patient=123&category=vital-signs&_count=10'
      }
    },
    {
      request: {
        method: 'GET',
        url: 'Condition?patient=123&clinical-status=active'
      }
    }
  ]
};

const response = await fetch(`${fhirBase}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/fhir+json'
  },
  body: JSON.stringify(batchRequest)
});
```

### 2. Implement Caching
```javascript
class FHIRCache {
  constructor(ttl = 300000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear() {
    this.cache.clear();
  }
}

const cache = new FHIRCache();

async function getPatient(patientId) {
  const cacheKey = `patient-${patientId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) return cached;
  
  const patient = await fetch(`${fhirBase}/Patient/${patientId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  cache.set(cacheKey, patient);
  return patient;
}
```

### 3. Lazy Load Data
```javascript
// Load critical data first, defer non-critical
async function loadPatientDashboard(patientId) {
  // Critical: Load immediately
  const patient = await getPatient(patientId);
  renderPatientHeader(patient);
  
  // Non-critical: Load in background
  Promise.all([
    getRecentVitals(patientId),
    getActiveConditions(patientId),
    getActiveMedications(patientId)
  ]).then(([vitals, conditions, medications]) => {
    renderVitals(vitals);
    renderConditions(conditions);
    renderMedications(medications);
  });
}
```

---

## Final Checklist Before Going Live

### Documentation
- [ ] API integration documented
- [ ] Error handling documented
- [ ] Security measures documented
- [ ] Deployment process documented
- [ ] Incident response plan created

### Legal & Compliance
- [ ] BAA signed with EHR vendor
- [ ] Privacy policy reviewed by legal
- [ ] Terms of service finalized
- [ ] HIPAA compliance verified
- [ ] State-specific requirements checked

### Operations
- [ ] Monitoring dashboards configured
- [ ] Alert thresholds set
- [ ] On-call rotation established
- [ ] Backup and recovery tested
- [ ] Disaster recovery plan documented

### Support
- [ ] User documentation created
- [ ] Support team trained
- [ ] Escalation paths defined
- [ ] Known issues documented
- [ ] FAQ prepared

---

**Last Updated:** `[date]`  
**Version:** `[version #]`  
**SMART App Launch Version:** `2.0.0 (<<v2.2.0 — Dec 2025?>>)`   
**FHIR Version:** `R4 (4.0.1)` `(<<5?>>)`

---

