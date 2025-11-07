# Using the SMART Health IT Sandbox

## Your Free FHIR Testing Environment

The SMART Health IT project provides a public, free sandbox perfect for learning and testing SMART-on-FHIR applications. No registration, no API keys, no credit card—just start building.

**Base URL**: [https://launch.smarthealthit.org/v/r4/fhir](https://launch.smarthealthit.org/v/r4/fhir)

---

## What's Included

### Pre-Populated Test Data

**Test patients with realistic clinical scenarios**:

- **smart-1288992** (Amy V. Shaw): Adult female with diabetes, hypertension, comprehensive history
- **smart-1032702**: Pediatric patient with immunization records
- **smart-1137192**: Elderly patient with multiple chronic conditions

**Each patient has**:
- Demographics (name, DOB, gender, contact info)
- Observations (vitals, lab results spanning years)
- Conditions (active and historical diagnoses)
- Medications (current and past prescriptions)
- Allergies, immunizations, encounters, procedures

---

## Quick Start: Read a Patient

**No authentication required** for basic read operations:

```bash
curl -H "Accept: application/fhir+json" \
  https://launch.smarthealthit.org/v/r4/fhir/Patient/smart-1288992
```

**Response**: Complete Patient resource with demographics.

---

## Testing SMART Launch

### Option 1: Use the Launch Simulator

**URL**: [https://launch.smarthealthit.org](https://launch.smarthealthit.org)

**Steps**:
1. Visit launch simulator
2. Select a test patient (e.g., Amy V. Shaw)
3. Choose provider (e.g., Dr. Susan Clark)
4. Select your app's launch URL
5. Click "Launch"

The simulator sends your app the `iss` and `launch` parameters, mimicking an EHR launch.

---

### Option 2: Test Your App Live

**Register your app** (optional, for testing):

1. Your app needs a public URL (use ngrok for local development)
2. Configure redirect URI: `https://your-app.com/callback`
3. Use client_id: `your_app_id` (or leave blank for public client)

**Launch flow**:
- App receives: `GET /launch?iss=https://launch.smarthealthit.org/v/r4/fhir&launch=...`
- App discovers config: `GET /.well-known/smart-configuration`
- App redirects to auth: User selects patient and approves
- App receives token: Includes `patient` claim

---

## Example Queries

### Get Patient Demographics

```bash
curl https://launch.smarthealthit.org/v/r4/fhir/Patient/smart-1288992
```

---

### Search Recent Vital Signs

```bash
curl "https://launch.smarthealthit.org/v/r4/fhir/Observation?\
patient=smart-1288992&\
category=vital-signs&\
_sort=-date&\
_count=5"
```

---

### Get Active Conditions

```bash
curl "https://launch.smarthealthit.org/v/r4/fhir/Condition?\
patient=smart-1288992&\
clinical-status=active"
```

---

### Search with Include

```bash
curl "https://launch.smarthealthit.org/v/r4/fhir/Observation?\
patient=smart-1288992&\
_count=5&\
_include=Observation:performer"
```

Returns observations plus their performers in one bundle.

---

## Other Public Sandboxes

### HAPI FHIR Test Server

**URL**: http://hapi.fhir.org/baseR4

**Features**:
- Open R4 server (no authentication)
- Full CRUD operations
- Create your own test data
- Public—data is shared and may be deleted

**Use for**: Basic FHIR testing, learning resource structure.

---

### Epic Sandbox

**URL**: https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4

**Features**:
- Production-like environment
- Requires registration
- Mimics real Epic deployment

**Use for**: Testing against Epic specifically before production.

---

### Cerner Sandbox

**URL**: https://fhir-myrecord.cerner.com/r4

**Features**:
- Cerner test environment
- OAuth required
- Patient access API testing

**Use for**: Testing Cerner integration.

---

## Best Practices for Sandbox Testing

### 1. Don't Rely on Sandbox Data Stability

Sandbox data can change or be reset. Don't build tests that depend on specific resource IDs existing forever.

**Good**: Query by criteria

```javascript
const patients = await fetch('/Patient?name=Shaw').then(r => r.json());
const amy = patients.entry.find(e => e.resource.birthDate === '1987-02-20');
```

**Bad**: Hardcode ID that might disappear

```javascript
const amy = await fetch('/Patient/smart-1288992').then(r => r.json());
```

---

### 2. Test Edge Cases

**Create test scenarios**:
- Patient with no observations
- Encounter without location
- Observation without value (pending result)
- Resources with minimal fields

---

### 3. Test Pagination

Sandbox has limited data, but test pagination logic:

```javascript
let allResults = [];
let url = '/Observation?patient=smart-1288992&_count=5';

while (url) {
  const bundle = await fetch(url).then(r => r.json());
  allResults.push(...bundle.entry.map(e => e.resource));
  
  const nextLink = bundle.link?.find(l => l.relation === 'next');
  url = nextLink?.url;
}
```

---

### 4. Test Error Handling

**Trigger errors intentionally**:
- Request non-existent resource: `GET /Patient/invalid-id` → 404
- Request without Accept header → May return XML
- Invalid search parameter → OperationOutcome

---

## Transitioning to Production

**Before deploying to a real EHR**:

1. **Test against vendor sandbox** (Epic, Cerner, etc.)
2. **Validate with real scopes** (sandboxes are permissive)
3. **Handle rate limiting** (production servers throttle requests)
4. **Test token refresh** (production tokens expire faster)
5. **Verify profile conformance** (use US Core validator)
6. **Test with minimal scopes** (don't rely on admin access)

---

## Next Steps

Now that you have a sandbox to experiment with, let's explore the sample application.