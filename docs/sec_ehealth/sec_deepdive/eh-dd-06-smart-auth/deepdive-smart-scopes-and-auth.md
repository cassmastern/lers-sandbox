# SMART Scopes and Authorization

## Granular Permissions for Healthcare Data

Scopes are the heart of OAuth authorization—they define **what** an app can do with **which** data. SMART-on-FHIR extends standard OAuth scopes with healthcare-specific patterns that enable fine-grained access control.

Think of scopes as access badges:
- 🔴 **Red badge**: Read-only access to patient vitals
- 🟡 **Yellow badge**: Read/write access to observations
- 🟢 **Green badge**: Full access to all patient resources

Without scopes, authorization would be all-or-nothing. Scopes let patients and providers grant precisely the access needed—nothing more.

---

## Scope Syntax: The Building Blocks

Scope syntax follows this basic pattern:

`[context]/[resource].[permission]`

Let's break down each component:

### Context (Who's data?)

**`patient/`** - Data for the current patient in context

- EHR launch: Patient from launch context
- Standalone launch: Authenticated patient
- **Use when**: App works with single patient at a time

**`user/`** - Data the authenticated user can access

- Clinician can access multiple patients
- Respects existing EHR access controls
- **Use when**: Provider-facing dashboards, population health tools

**`system/`** - Backend service access (no human user)

- Used for B2B integrations
- Bulk data export, analytics pipelines
- **Use when**: Automated workflows, scheduled jobs

---

### Resource (What data?)

**Specific resource type**: `Patient`, `Observation`, `Condition`, etc.

```
patient/Observation.read
```

Access only Observation resources.

**Wildcard**: `*` for all resource types

```
patient/*.read
```

Access all resources for patient (Observations, Conditions, Medications, etc.).

---

### Permission (What actions?)

**`.read`** - Read-only access

- GET operations
- Search operations
- Most common permission

**`.write`** - Create and update

- POST (create)
- PUT (update)
- Implies `.read` (need to read to update)

**`.*`** - Full access

- All CRUD operations
- Includes delete
- Rarely granted

---

## Common Scope Examples (From Your Scaffold)

### Patient-Specific Scopes (Most Common)

```
patient/Patient.read          # Demographics
patient/Observation.read      # Labs, vitals
patient/Condition.read        # Diagnoses
patient/MedicationRequest.read # Prescriptions
patient/AllergyIntolerance.read # Allergies
patient/Immunization.read     # Vaccines
patient/Procedure.read        # Procedures
patient/DiagnosticReport.read # Reports
patient/Encounter.read        # Visits
patient/DocumentReference.read # Documents
```

**Use case**: Patient-facing app showing own health data.

**Token response**:

```json
{
  "scope": "patient/Observation.read patient/Condition.read",
  "patient": "smart-1288992"
}
```

**API calls allowed**:

```http
✅ GET /Observation?patient=smart-1288992
✅ GET /Condition?patient=smart-1288992
❌ GET /Observation?patient=different-patient  (403 Forbidden)
❌ POST /Observation  (403 Insufficient scope - need .write)
```

---

### User-Level Scopes (Provider Access)

```
user/Patient.read          # Any patient user can access
user/Observation.read      # Cross-patient observations
user/Practitioner.read     # Colleague information
user/Organization.read     # Facility data
```

**Use case**: Provider dashboard showing panel of patients.

**Token response**:

```json
{
  "scope": "user/Patient.read user/Observation.read",
  "fhirUser": "https://fhir.example.org/Practitioner/dr-johnson"
}
```

**API calls allowed**:

```http
✅ GET /Patient?name=Smith  (returns all Smiths user can access)
✅ GET /Observation?patient=any-patient-id  (if user has access)
❌ GET /Patient (no filter)  (Some servers restrict this)
```

**Security note**: EHR enforces existing access controls. If Dr. Johnson can't access cardiology patients in EHR, `user/` scopes won't grant that access.

---

### Write Permissions (Create/Update)

```
patient/Observation.write      # Create/update observations
patient/Condition.write        # Create/update conditions
user/Patient.write             # Create/update any patient
```

**Use case**: Clinical documentation app, patient-reported outcomes.

**Implications**:
- `.write` includes `.read` (can't update without reading)
- Creates audit trail entries
- Higher scrutiny during authorization
- May require additional user confirmation

**API calls allowed**:

```http
✅ POST /Observation  (create new)
✅ PUT /Observation/obs-123  (update existing)
✅ GET /Observation/obs-123  (read - implied)
```

---

### Wildcard Scopes (Broad Access)

```
patient/*.read    # Read all resources for patient
user/*.read       # Read all resources user can access
patient/*.write   # Full write access for patient
user/*.*          # Full access to all user resources
```

**Use case**: Comprehensive health apps, EHR integrations.

**Security consideration**: Request wildcards only when truly needed. Narrower scopes build user trust.

**Example request**:

```javascript
const scopes = [
  'launch',
  'launch/patient',
  'patient/*.read',  // All patient resources
  'openid',
  'fhirUser',
  'offline_access'
].join(' ');
```

---

## OpenID Connect Scopes (Identity)

### `openid` - Enable OIDC authentication

**Required for**: Getting ID token with user identity claims.

**Returns**: `id_token` in token response (JWT with user info).

```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "access_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

**ID token claims**:

```json
{
  "sub": "dr-johnson-123",
  "name": "Dr. Sarah Johnson",
  "email": "sarah.johnson@hospital.org",
  "fhirUser": "https://fhir.example.org/Practitioner/dr-johnson"
}
```

---

### `profile` - User profile information

**Returns**: Name, family name, given name, middle name, nickname, preferred username, profile URL, picture URL, website, gender, birthdate, zoneinfo, locale.

---

### `email` - Email address

**Returns**: `email` and `email_verified` claims.

---

### `fhirUser` - FHIR resource URL for user

**Returns**: `fhirUser` claim in token response.

```json
{
  "fhirUser": "https://fhir.example.org/Practitioner/dr-johnson"
}
```

**Use case**: Fetch authenticated user's FHIR resource to display profile, specialty, organization.

```javascript
// After authorization
const fhirUserUrl = tokenResponse.fhirUser;
const practitioner = await fetch(fhirUserUrl, {
  headers: {Authorization: `Bearer ${tokenResponse.access_token}`}
}).then(r => r.json());

console.log(`Logged in as: ${practitioner.name[0].text}`);
console.log(`Specialty: ${practitioner.qualification[0].code.text}`);
```

---

## Launch Context Scopes (EHR Integration)

### `launch` - Enable EHR launch

**Required for**: EHR-initiated launch flow.

**Must include**: `launch` parameter in authorization request.

**Without this scope**: Authorization server rejects launch token.

---

### `launch/patient` - Request patient context

**Returns**: `patient` claim in token response.

```json
{
  "patient": "smart-1288992"
}
```

**Use case**: App needs to know which patient is in context.

**If not requested**: Token response won't include patient ID (app must prompt user or fail).

---

### `launch/encounter` - Request encounter context

**Returns**: `encounter` claim in token response.

```json
{
  "encounter": "smart-enc-456"
}
```

**Use case**: Clinical documentation apps that need encounter context for billing, note-taking.

**Common pattern**:

```javascript
const scopes = [
  'launch',
  'launch/patient',
  'launch/encounter',
  'patient/*.read',
  'openid',
  'fhirUser'
].join(' ');
```

---

## Offline Access (Long-Term Tokens)

### `offline_access` - Request refresh token

**Returns**: `refresh_token` in token response.

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "refresh_abc123",
  "expires_in": 3600
}
```

**Use case**: Apps that need access when user is not actively logged in.

**Examples**:
- Fitness tracker syncing daily
- Medication reminder app
- Research study data collection

**User experience**: Consent screen shows "Keep access after you log out" or similar language.

**Security**: Refresh tokens should be stored securely (encrypted storage, server-side only).

---

## Typical Scope Combinations (From Your Scaffold)

### Basic Read-Only App (Patient Portal)

```
openid fhirUser launch launch/patient
patient/Patient.read
patient/Observation.read
patient/Condition.read
```

**What it enables**:
- User identity (openid, fhirUser)
- EHR launch support (launch, launch/patient)
- Read patient demographics
- Read observations and conditions

---

### Comprehensive Read Access (Health Summary)

```
openid fhirUser launch launch/patient offline_access
patient/*.read
```

**What it enables**:
- Everything in basic scope
- All patient resources (wildcard)
- Long-term access (offline_access)

**User sees**: "This app will access your complete health record and keep access after you log out."

---

### Clinical Documentation App (Provider Tool)

```
openid profile fhirUser launch launch/patient launch/encounter
patient/Patient.read
patient/Observation.write
patient/Condition.write
```

**What it enables**:
- Provider identity with profile
- EHR launch with encounter context
- Read patient demographics
- Create/update observations and conditions

**Use case**: SOAP note documentation, clinical data entry.

---

### Provider Dashboard (Population Health)

```
openid profile fhirUser launch
user/Patient.read
user/Observation.read
user/Condition.read
user/Encounter.read
```

**What it enables**:
- Provider identity
- EHR launch (no specific patient)
- Read across patient panel
- View observations, conditions, encounters for multiple patients

**Use case**: Quality measure dashboard, care gap analysis.

---

### Backend Service (No User)

```
system/Patient.read
system/Observation.read
```

**Authentication**: Client credentials grant (not authorization code).

**No user interaction**: Automated workflow.

**Use case**: Bulk data export, analytics pipeline, report generation.

**Example token request**:

```http
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&
scope=system/Patient.read system/Observation.read&
client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&
client_assertion=eyJhbGciOiJSUzI1NiIs...
```

---

## Scope Negotiation: Requested vs. Granted

**Important**: Authorization server may grant **subset** of requested scopes.

**Scenario**: App requests:

```
patient/*.read patient/*.write offline_access
```

**User denies write access and offline access**. Token response:

```json
{
  "scope": "patient/*.read",
  "patient": "smart-1288992"
}
```

**Your app must check** granted scopes before attempting operations:

```javascript
function checkScope(grantedScopes, requiredScope) {
  const scopes = grantedScopes.split(' ');
  
  // Exact match
  if (scopes.includes(requiredScope)) return true;
  
  // Wildcard match
  const [context, resource] = requiredScope.split('/');
  const wildcardWrite = `${context}/*.write`;
  const wildcardAll = `${context}/*.*`;
  
  if (scopes.includes(wildcardWrite) || scopes.includes(wildcardAll)) return true;
  
  // .write implies .read
  if (requiredScope.endsWith('.read')) {
    const writeScope = requiredScope.replace('.read', '.write');
    if (scopes.includes(writeScope)) return true;
  }
  
  return false;
}

// Usage
const granted = tokenResponse.scope;

if (checkScope(granted, 'patient/Observation.write')) {
  // Show "Record Blood Pressure" button
} else {
  // Hide button or show "Read-only access" message
}

if (!checkScope(granted, 'offline_access')) {
  console.warn('No offline access - user will need to re-authorize periodically');
}
```

---

## Scope Best Practices

### 1. Request Minimum Necessary Scopes

```javascript
// BAD: Over-requesting
const scopes = 'launch launch/patient patient/*.* offline_access';

// GOOD: Request only what you need
const scopes = 'launch launch/patient patient/Observation.read patient/Condition.read';
```

**Why**: Users trust apps that request minimal access. Reduces security risk.

---

### 2. Explain Scopes to Users

**In-app explanation before authorization**:

```
This app will request access to:
• Your vital signs (blood pressure, heart rate)
• Your condition history (diagnoses)

This app will NOT access:
• Your medication list
• Your billing information
• Other patients' data
```

---

### 3. Handle Partial Grants Gracefully

```javascript
// Check granted scopes and adapt UI
const grantedScopes = tokenResponse.scope.split(' ');

if (grantedScopes.includes('patient/Observation.write')) {
  showRecordDataButton();
} else {
  showReadOnlyMessage();
}

if (!grantedScopes.includes('offline_access')) {
  showPeriodicReauthorizationWarning();
}
```

---

### 4. Use `.write` Carefully

- Require user confirmation before writing data
- Implement undo functionality
- Log all modifications for audit
- Validate data thoroughly before submission

---

## Common Scope Errors

### Error: insufficient_scope

**Cause**: Token doesn't have required scope for operation.

**Example**: Trying to create Observation with only `.read` scope.

**Response**:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "forbidden",
    "diagnostics": "Insufficient scope. Required: patient/Observation.write, Have: patient/Observation.read"
  }]
}
```

**Fix**: Request appropriate scope or disable unavailable features.

---

### Error: invalid_scope

**Cause**: Requested scope not supported by server.

**Example**: Server doesn't support `patient/*.write`.

**Response**:

```json
{
  "error": "invalid_scope",
  "error_description": "Scope not supported: patient/*.write"
}
```

**Fix**: Check CapabilityStatement for supported scopes. Request alternative scopes.

---

## Next Steps

Now, armed with understanding about how to request and use scopes, let's explore how apps discover server capabilities.