# FHIR Search Parameters

## The Power of FHIR Search

FHIR search is where the API truly shines. Unlike simple key-value filtering, FHIR search supports:

- **Multi-criteria filtering**: Combine patient + date + category in one query
- **Search modifiers**: `:exact`, `:contains`, `:missing`, `:not`
- **Prefixes for comparisons**: `ge` (≥), `lt` (<), `ap` (approximately)
- **Chaining**: Search through references (`Observation?subject.name=Shaw`)
- **Reverse chaining**: Find referencing resources (`Patient?_has:Observation:patient:code=glucose`)
- **Includes**: Fetch related resources in one round-trip
- **Result control**: Sorting, pagination, element filtering

Mastering search parameters is essential for building performant apps. Let's explore with clinical scenarios.

---

## Search Parameter Types

Every search parameter has a type that determines how it's matched:

### string

**Used for**: Text fields (names, addresses, descriptions)

**Matching**: Case-insensitive prefix match

**Examples**:

```http
GET /Patient?name=Shaw
```

Matches: Shaw, Shawalski, Shawna (prefix matching)

```http
GET /Patient?address-city=Bost
```

Matches: Boston (prefix matching)

**Modifiers**:

- `:exact` - Case-sensitive exact match
- `:contains` - Substring match anywhere

```http
GET /Patient?name:exact=Shaw
```

Only matches "Shaw" (not "shaw" or "SHAW")

```http
GET /Patient?address:contains=Main
```

Matches: "123 Main St", "On Main Street", "Mainly Road" (anywhere in address)

---

### token

**Used for**: Coded values (identifiers, codes, booleans)

**Format**: `[system]|[code]` or just `[code]`

**Examples**:

```http
GET /Patient?identifier=http://hospital.org|MRN-123456
```

Exact match on system + value.

```http
GET /Observation?code=http://loinc.org|2345-7
```

Glucose observations (LOINC code).

**Omit system** (matches any system):

```http
GET /Observation?code=2345-7
```

Matches LOINC 2345-7 regardless of system.

**Modifiers**:

- `:not` - Negation
- `:text` - Search display text instead of code
- `:in` - Code in ValueSet
- `:not-in` - Code not in ValueSet

```http
GET /Condition?code:not=http://snomed.info/sct|73211009
```

Conditions that are NOT diabetes.

```http
GET /Observation?code:text=glucose
```

Observations with "glucose" in code.text or code.display.

---

### date

**Used for**: Dates and timestamps

**Format**: `YYYY`, `YYYY-MM`, `YYYY-MM-DD`, or full `YYYY-MM-DDThh:mm:ss±hh:mm`

**Prefixes**:

- `eq` - Equal (default)
- `ne` - Not equal
- `gt` - Greater than
- `lt` - Less than
- `ge` - Greater or equal (≥)
- `le` - Less or equal (≤)
- `sa` - Starts after
- `eb` - Ends before
- `ap` - Approximately

**Examples**:

```http
GET /Observation?date=2024-11-01
```

Observations on Nov 1, 2024 (exact day).

```http
GET /Observation?date=ge2024-01-01
```

Observations on or after Jan 1, 2024.

```http
GET /Observation?date=ge2024-01-01&date=le2024-12-31
```

Observations during 2024 (range query with two parameters).

```http
GET /Encounter?period=ap2024-06
```

Encounters around June 2024 (server interprets "approximately").

**Precision matters**:

```http
GET /Patient?birthdate=1987
```

Born in 1987 (any date).

```http
GET /Patient?birthdate=1987-02
```

Born in February 1987.

---

### number

**Used for**: Numeric values (ages, durations, scores)

**Prefixes**: Same as dates (`eq`, `ne`, `gt`, `lt`, `ge`, `le`, `ap`)

**Examples**:

```http
GET /RiskAssessment?probability=gt0.8
```

Risk assessments with probability > 80%.

```http
GET /Observation?value-quantity=95
```

Observations with value = 95 (any unit).

---

### quantity

**Used for**: Values with units (lab results, vitals)

**Format**: `[prefix][number]|[system]|[code]` or `[prefix][number]||[unit]`

**Examples**:

```http
GET /Observation?value-quantity=95||mg/dL
```

Glucose = 95 mg/dL (exact).

```http
GET /Observation?value-quantity=gt100||mmHg
```

Blood pressure > 100 mmHg.

```http
GET /Observation?value-quantity=ge7.0||%
```

HbA1c ≥ 7.0%.

**With system**:

```http
GET /Observation?value-quantity=95|http://unitsofmeasure.org|mg/dL
```

Explicit UCUM system.

**Gotcha**: Unit matching is case-sensitive. `mg/dL` ≠ `mg/dl`.

---

### reference

**Used for**: Links between resources (patient, encounter, requester)

**Format**: `[type]/[id]` or just `[id]`

**Examples**:

```http
GET /Observation?patient=Patient/smart-1288992
```

Observations for specific patient.

```http
GET /Observation?patient=smart-1288992
```

Same (type prefix optional if unambiguous).

```http
GET /MedicationRequest?requester=Practitioner/dr-johnson
```

Prescriptions by Dr. Johnson.

**Chaining** (search through references):

```http
GET /Observation?subject.name=Shaw
```

Observations where the subject (Patient) has name "Shaw".

```http
GET /Encounter?patient.identifier=http://hospital.org|MRN-123
```

Encounters for patient with specific MRN.

---

### composite

**Used for**: Combining multiple values (e.g., code + value)

**Format**: `[param1]$[param2]`

**Examples**:

```http
GET /Observation?code-value-quantity=http://loinc.org|8480-6$gt130
```

Systolic BP > 130 mmHg (code 8480-6 AND value > 130).

```http
GET /Observation?component-code-value-quantity=http://loinc.org|8462-4$lt60
```

Diastolic BP < 60 mmHg (in components).

---

## Common Search Parameters

These work across all resource types:

### _id

**Search by resource ID**:

```http
GET /Patient?_id=smart-1288992
```

Equivalent to `GET /Patient/smart-1288992`, but returns a searchset Bundle.

**Multiple IDs**:

```http
GET /Patient?_id=patient-1,patient-2,patient-3
```

Returns Bundle with all three patients (if they exist).

---

### _lastUpdated

**Search by modification timestamp**:

```http
GET /Observation?_lastUpdated=ge2024-11-01T00:00:00Z
```

Observations updated since midnight Nov 1.

**Use case**: Incremental sync

```javascript
let lastSync = localStorage.getItem('lastSync') || '2024-01-01T00:00:00Z';

async function syncNewObservations() {
  const bundle = await fetch(
    `/Observation?patient=smart-1288992&_lastUpdated=gt${lastSync}`
  ).then(r => r.json());
  
  const newObs = bundle.entry?.map(e => e.resource) || [];
  console.log(`Synced ${newObs.length} new/updated observations`);
  
  lastSync = new Date().toISOString();
  localStorage.setItem('lastSync', lastSync);
  
  return newObs;
}
```

---

### _tag, _profile, _security

**Search by metadata**:

```http
GET /Patient?_tag=http://example.org|test-data
```

Patients tagged as test data.

```http
GET /Observation?_profile=http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-lab
```

Observations conforming to US Core Lab profile.

---

### _text and _content

**Full-text search**:

```http
GET /Condition?_text=diabetes
```

Searches narrative text (Condition.text.div) for "diabetes".

```http
GET /Condition?_content=diabetes
```

Searches entire resource content (all fields) for "diabetes".

**Performance note**: Text search is slow. Use specific parameters when possible.

---

## Result Control Parameters

### _sort

**Sort results**:

```http
GET /Observation?patient=smart-1288992&_sort=date
```

Oldest first (ascending).

```http
GET /Observation?patient=smart-1288992&_sort=-date
```

Newest first (descending, `-` prefix).

**Multiple sort keys**:

```http
GET /Observation?patient=smart-1288992&_sort=-date,code
```

Sort by date descending, then code ascending.

---

### _count

**Limit results per page**:

```http
GET /Observation?patient=smart-1288992&_count=10
```

Return max 10 results (default varies by server, typically 50).

**Pagination**:

Response includes `link[relation="next"]`:

```json
{
  "resourceType": "Bundle",
  "link": [
    {
      "relation": "next",
      "url": "https://fhir.example.org/Observation?patient=smart-1288992&_count=10&_offset=10"
    }
  ]
}
```

Follow `next` link to get next page.

---

### _include and _revinclude

**Fetch related resources in one request**:

```http
GET /Observation?patient=smart-1288992&_include=Observation:performer
```

Returns Bundle with Observations + their performers (Practitioners).

```http
GET /Patient/smart-1288992?_revinclude=Observation:patient
```

Returns Patient + all Observations referencing that patient.

**Multiple includes**:

```http
GET /Observation?patient=smart-1288992&_include=Observation:performer&_include=Observation:encounter
```

Returns Observations + Performers + Encounters.

**Iterate includes** (follow references recursively):

```http
GET /Observation?patient=smart-1288992&_include=Observation:encounter&_include:iterate=Encounter:participant
```

Returns Observations → Encounters → Participants (two levels deep).

---

### _summary

**Control response size**:

```http
GET /Patient?_summary=true
```

Returns summary view (omits text, extensions, non-essential elements).

```http
GET /Observation?patient=smart-1288992&_summary=count
```

Returns only Bundle.total (no resources), fast for counting.

**Options**:

- `true` - Summary view
- `text` - Text + essential fields
- `data` - Remove narrative text
- `count` - Just the count
- `false` - Full resources (default)

---

### _elements

**Return specific fields only**:

```http
GET /Patient/smart-1288992?_elements=name,birthDate,gender
```

Returns Patient with only name, birthDate, gender (omits telecom, address, etc.).

**Use case**: Mobile apps with limited bandwidth

```javascript
async function fetchPatientSummary(patientId) {
  return fetch(`/Patient/${patientId}?_elements=id,name,gender,birthDate`)
    .then(r => r.json());
}

// Returns lightweight Patient (~500 bytes vs. 5KB full resource)
```

---

## Search Modifiers

### :exact

**Case-sensitive exact match** (string parameters):

```http
GET /Patient?name:exact=Shaw
```

Matches "Shaw" but not "shaw" or "Shawalski".

---

### :contains

**Substring match anywhere** (string parameters):

```http
GET /Patient?address:contains=Main
```

Matches "123 Main St", "On Main Street", "Maintained by".

---

### :missing

**Check field presence**:

```http
GET /Patient?gender:missing=false
```

Patients with gender specified.

```http
GET /Observation?value-quantity:missing=true
```

Observations without a value (pending results).

---

### :not

**Negation** (token parameters):

```http
GET /Condition?code:not=http://snomed.info/sct|73211009
```

Conditions that are NOT diabetes.

---

### :above and :below

**Hierarchy search** (code systems with hierarchies like SNOMED):

```http
GET /Condition?code:below=http://snomed.info/sct|73211009
```

Any type of diabetes (Type 1, Type 2, gestational, etc.).

**Note**: Not all servers support hierarchy search. Check CapabilityStatement.

---

### :in and :not-in

**ValueSet membership**:

```http
GET /Observation?code:in=http://example.org/ValueSet/diabetes-labs
```

Observations with codes from the diabetes labs ValueSet (HbA1c, glucose, etc.).

---

## Chaining and Reverse Chaining

### Forward Chaining (.)

**Search through references**:

```http
GET /Observation?subject.name=Shaw
```

Observations where subject (Patient) has name "Shaw".

**Multiple levels**:

```http
GET /MedicationRequest?subject.generalPractitioner.name=Johnson
```

Medication requests where patient's general practitioner is Dr. Johnson (two-level chain).

**Limitation**: Some servers limit chaining depth.

---

### Reverse Chaining (_has)

**Find resources that reference this resource**:

```http
GET /Patient?_has:Observation:patient:code=http://loinc.org|2345-7
```

Patients who have glucose observations (LOINC 2345-7).

**Breakdown**:

- `_has`: Reverse chain operator
- `Observation`: Resource type that references Patient
- `patient`: Search parameter in Observation linking to Patient
- `code=http://loinc.org|2345-7`: Filter on Observations

**Use case**: Find diabetic patients (those with diabetes diagnosis)

```http
GET /Patient?_has:Condition:patient:code=http://snomed.info/sct|44054006
```

---

## FHIR Search Examples and Clinical Contexts

Below are several practical search examples you can use in various contexts:

# Base URL
BASE="https://launch.smarthealthit.org/v/r4/fhir"

# 1. Get a specific patient by ID
curl "$BASE/Patient/smart-1288992"

# 2. Search patients by name
curl "$BASE/Patient?name=Shaw"

# 3. Search patients by birthdate
curl "$BASE/Patient?birthdate=1987-02-20"

# 4. Get observations for a patient
curl "$BASE/Observation?patient=smart-1288992"

# 5. Get vital signs observations
curl "$BASE/Observation?patient=smart-1288992&category=vital-signs"

# 6. Get observations with specific code (blood pressure)
curl "$BASE/Observation?patient=smart-1288992&code=85354-9"

# 7. Get recent observations (sorted by date, descending)
curl "$BASE/Observation?patient=smart-1288992&_sort=-date&_count=10"

# 8. Get observations within date range
curl "$BASE/Observation?patient=smart-1288992&date=ge2020-01-01&date=le2023-12-31"

# 9. Get active conditions
curl "$BASE/Condition?patient=smart-1288992&clinical-status=active"

# 10. Get conditions by category
curl "$BASE/Condition?patient=smart-1288992&category=encounter-diagnosis"

# 11. Get active medication requests
curl "$BASE/MedicationRequest?patient=smart-1288992&status=active"

# 12. Get medications with intent=order
curl "$BASE/MedicationRequest?patient=smart-1288992&intent=order"

# 13. Get recent encounters
curl "$BASE/Encounter?patient=smart-1288992&_sort=-date&_count=5"

# 14. Get encounters by type
curl "$BASE/Encounter?patient=smart-1288992&type=http://snomed.info/sct|185349003"

# 15. Get procedures for patient
curl "$BASE/Procedure?patient=smart-1288992"

# 16. Get allergies
curl "$BASE/AllergyIntolerance?patient=smart-1288992"

# 17. Get immunizations
curl "$BASE/Immunization?patient=smart-1288992"

# 18. Get diagnostic reports
curl "$BASE/DiagnosticReport?patient=smart-1288992"

# 19. Search with multiple parameters (AND logic)
curl "$BASE/Observation?patient=smart-1288992&category=laboratory&date=ge2022-01-01"

# 20. Use _include to get referenced resources
curl "$BASE/Observation?patient=smart-1288992&_include=Observation:performer"

# 21. Use _revinclude to get referencing resources
curl "$BASE/Patient/smart-1288992?_revinclude=Observation:patient"

# 22. Get only specific fields with _elements
curl "$BASE/Patient/smart-1288992?_elements=name,birthDate,gender"

# 23. Use _summary for abbreviated results
curl "$BASE/Patient/smart-1288992?_summary=true"

# 24. Pagination with _count and _offset
curl "$BASE/Observation?patient=smart-1288992&_count=20&_offset=0"

# 25. Search by token (identifier)
curl "$BASE/Patient?identifier=http://hospital.smarthealthit.org|smart-1288992"

# Search Prefixes:
# eq - equals (default)
# ne - not equals
# gt - greater than
# lt - less than
# ge - greater or equal
# le - less or equal
# sa - starts after
# eb - ends before
# ap - approximately

Let's add clinical context to several key patterns:

### Example: Patient Demographics

```bash
# Find patient by name
GET /Patient?name=Shaw

# Find patients by birthdate
GET /Patient?birthdate=1987-02-20

# Find patients born in specific year
GET /Patient?birthdate=ge1980&birthdate=lt1990
# Patients born in the 1980s
```

**Clinical context**: Patient lookup at check-in.

---

### Example: Vital Signs Trending

```bash
# Get all vital signs for patient
GET /Observation?patient=smart-1288992&category=vital-signs

# Get blood pressure readings only
GET /Observation?patient=smart-1288992&code=85354-9

# Get recent vitals (last 10)
GET /Observation?patient=smart-1288992&category=vital-signs&_sort=-date&_count=10

# Get vitals within date range
GET /Observation?patient=smart-1288992&category=vital-signs&date=ge2024-01-01&date=le2024-12-31
```

**Clinical context**: Trending dashboard showing BP/pulse over time.

---

### Example: Lab Result Monitoring

```bash
# Get all lab results
GET /Observation?patient=smart-1288992&category=laboratory

# Get glucose results
GET /Observation?patient=smart-1288992&code=2345-7

# Get HbA1c results showing worsening control
GET /Observation?patient=smart-1288992&code=4548-4&value-quantity=ge7.0

# Get recent labs with performer info
GET /Observation?patient=smart-1288992&category=laboratory&_sort=-date&_count=5&_include=Observation:performer
```

**Clinical context**: Diabetes management review.

---

### Example: Active Problem List

```bash
# Get active conditions
GET /Condition?patient=smart-1288992&clinical-status=active

# Get encounter diagnoses
GET /Condition?patient=smart-1288992&category=encounter-diagnosis

# Get conditions by code
GET /Condition?patient=smart-1288992&code=http://snomed.info/sct|44054006
# Find diabetes diagnosis
```

**Clinical context**: Problem list display in EHR.

---

### Example: Medication Reconciliation

```bash
# Get active medication orders
GET /MedicationRequest?patient=smart-1288992&status=active

# Get medications with intent=order
GET /MedicationRequest?patient=smart-1288992&intent=order

# Get recent medications with reasons
GET /MedicationRequest?patient=smart-1288992&_sort=-authored-on&_count=10&_include=MedicationRequest:reason-reference
```

**Clinical context**: Medication reconciliation at hospital admission.

---

### Example: Care Coordination

```bash
# Get recent encounters
GET /Encounter?patient=smart-1288992&_sort=-date&_count=5

# Get encounters by type
GET /Encounter?patient=smart-1288992&type=http://snomed.info/sct|185349003
# Follow-up visits only

# Get procedures for patient
GET /Procedure?patient=smart-1288992

# Get immunizations
GET /Immunization?patient=smart-1288992

# Get allergies
GET /AllergyIntolerance?patient=smart-1288992&clinical-status=active
```

**Clinical context**: Pre-visit summary preparation.

---

### Example: Clinical Decision Support

```bash
# Find diabetic patients without recent HbA1c
GET /Patient?_has:Condition:patient:code=http://snomed.info/sct|44054006

# Then for each patient, check for recent HbA1c
GET /Observation?patient={patientId}&code=4548-4&date=ge2024-08-01

# If no results, patient needs HbA1c test (care gap)
```

**Clinical context**: Quality measure reporting (diabetic patients due for HbA1c).

---

### Example: Advanced Includes

```bash
# Get observation with patient info in one request
GET /Observation?_id=obs-123&_include=Observation:subject

# Get patient with all observations
GET /Patient/smart-1288992?_revinclude=Observation:patient

# Get patient with observations and their performers
GET /Patient/smart-1288992?_revinclude=Observation:patient&_include:iterate=Observation:performer

# Complex: Patient → Observations → DiagnosticReports
GET /Patient/smart-1288992?_revinclude=Observation:patient&_revinclude:iterate=DiagnosticReport:result
```

**Clinical context**: Chart review page needing complete patient context.

---

## Search Optimization Strategies

### Strategy 1: Start Narrow

```javascript
// Bad: Fetch everything, filter client-side
const allObs = await fetch('/Observation?patient=smart-1288992').then(r => r.json());
const labs = allObs.entry.filter(e => e.resource.category?.[0]?.coding?.[0]?.code === 'laboratory');

// Good: Filter on server
const labs = await fetch('/Observation?patient=smart-1288992&category=laboratory').then(r => r.json());
```

**Why**: Network bandwidth, server load, client parsing time.

---

### Strategy 2: Use _elements for Lists

```javascript
// Bad: Fetch full resources for list view
const patients = await fetch('/Patient?_count=50').then(r => r.json());
// Each patient is 5KB → 250KB total

// Good: Fetch only needed fields
const patients = await fetch('/Patient?_count=50&_elements=id,name,birthDate,gender').then(r => r.json());
// Each patient is 500 bytes → 25KB total (10x reduction)
```

---

### Strategy 3: Batch Includes

```javascript
// Bad: N+1 query problem
const obs = await fetch('/Observation?patient=smart-1288992&_count=10').then(r => r.json());
for (const entry of obs.entry) {
  const performer = await fetch(`/${entry.resource.performer[0].reference}`);
  // 10 extra HTTP requests!
}

// Good: Use _include
const bundle = await fetch('/Observation?patient=smart-1288992&_count=10&_include=Observation:performer').then(r => r.json());
const observations = bundle.entry.filter(e => e.resource.resourceType === 'Observation');
const performers = bundle.entry.filter(e => e.resource.resourceType === 'Practitioner');
// 1 HTTP request total
```

---

### Strategy 4: Cache Capabilities

```javascript
// Bad: Check capabilities on every search
async function searchObservations(params) {
  const caps = await fetch('/metadata').then(r => r.json());
  if (caps.rest[0].resource.find(r => r.type === 'Observation')) {
    return fetch(`/Observation?${params}`).then(r => r.json());
  }
}

// Good: Cache capabilities for session
let cachedCapabilities = null;

async function getCapabilities() {
  if (!cachedCapabilities) {
    cachedCapabilities = await fetch('/metadata').then(r => r.json());
  }
  return cachedCapabilities;
}
```

---

## Common Search Errors

### Error: Invalid Parameter Name

**Query**:

```http
GET /Observation?patient-id=smart-1288992
```

**Response** (400 Bad Request):

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "invalid",
    "diagnostics": "Unknown search parameter 'patient-id'. Did you mean 'patient'?"
  }]
}
```

**Fix**: Use `patient` not `patient-id`.

---

### Error: Invalid Prefix

**Query**:

```http
GET /Observation?date=>=2024-01-01
```

**Response** (400 Bad Request):

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "invalid",
    "diagnostics": "Invalid date prefix '>='. Use 'ge' for greater-or-equal."
  }]
}
```

**Fix**: Use `ge` not `>=`.

---

### Error: Type Mismatch

**Query**:

```http
GET /Observation?date=Shaw
```

**Response** (400 Bad Request):

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "invalid",
    "diagnostics": "Parameter 'date' expects date format, got 'Shaw'"
  }]
}
```

---

## Next Steps

You now understand FHIR search parameters in depth. Next, we'll explore error handling and OperationOutcome resources.

→ [Error Handling and Validation](deepdive-error-handling.md)