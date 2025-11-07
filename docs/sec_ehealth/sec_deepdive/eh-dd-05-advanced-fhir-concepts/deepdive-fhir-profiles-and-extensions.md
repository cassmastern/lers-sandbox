# FHIR Profiles and Extensions

## Understanding Profiles: Constraints for Specific Use Cases

Base FHIR is intentionally flexible. A Patient resource can exist with just a `resourceType` field—no name, no identifier, no birthdate. This flexibility enables broad applicability, but it's too loose for real-world clinical systems.

**Profiles** solve this by adding constraints:

- **Tighten cardinality**: Make optional fields required (Patient.identifier: 0..* → 1..*)
- **Constrain data types**: Limit choices (Patient.deceased[x] must be deceasedBoolean, not deceasedDateTime)
- **Specify value sets**: Require codes from specific terminologies (Observation.code must be from LOINC)
- **Add extensions**: Introduce new data elements (race, ethnicity)
- **Define MustSupport**: Flag elements that systems must be able to process

Think of profiles as blueprints overlaid on base FHIR—they don't change the foundation, they add walls and plumbing.

---

## Why Profiles Matter

### Scenario 1: US Healthcare Certification

To achieve ONC certification in the US, EHR systems must support **US Core profiles**. These profiles enforce:

- Every Patient must have at least one identifier, one name, and gender
- Race and ethnicity must be captured (via extensions)
- Clinical resources must reference encounters
- Specific search parameters must be supported

Without US Core conformance, systems can't participate in federal programs or exchange data with other certified systems.

### Scenario 2: International Patient Summary (IPS)

A Norwegian patient vacations in Australia and has a medical emergency. The Australian hospital needs to access the patient's summary. **IPS profiles** ensure both countries structure data identically:

- Allergies use same structure and codes
- Medication lists are comparable
- Problem lists use standard terminologies

Profiles make cross-border care possible.

### Scenario 3: Research Networks

A cancer research consortium needs consistent genomics data across 50 institutions. A **custom profile** defines:

- Required genetic test results (HGVS notation)
- Mandatory tumor staging fields
- Specific specimen collection procedures

Without profiles, each institution would structure data differently, making aggregation impossible.

---

## Common Profile Types

### US Core Profiles (US Realm)

**Base URL**: `http://hl7.org/fhir/us/core/StructureDefinition/`

**Key profiles**:

- **us-core-patient**: Demographics with race/ethnicity extensions
- **us-core-observation-lab**: Laboratory results with category constraints
- **us-core-condition**: Diagnoses with required clinical and verification status
- **us-core-medicationrequest**: Prescriptions with required intent and status
- **us-core-procedure**: Procedures with required code and performed date
- **us-core-encounter**: Visits with required type and class

**Example differences** (Patient):

| Element | Base FHIR | US Core |
|---------|-----------|---------|
| identifier | 0..* | 1..* (required) |
| name | 0..* | 1..* (required) |
| gender | 0..1 | 1..1 (required) |
| race extension | N/A | 0..1 (MustSupport) |
| ethnicity extension | N/A | 0..1 (MustSupport) |

### International Patient Summary (IPS)

**Base URL**: `http://hl7.org/fhir/uv/ips/StructureDefinition/`

**Key profiles**:

- **Patient-uv-ips**: Demographics for international exchange
- **Observation-results-uv-ips**: Shareable lab/vital results
- **AllergyIntolerance-uv-ips**: Standardized allergy documentation
- **Medication-uv-ips**: Medication list using international codes

**Design principle**: Maximum interoperability with minimal constraints (unlike US Core which is more prescriptive).

### SMART App Launch Profiles

**Base URL**: `http://hl7.org/fhir/smart-app-launch/StructureDefinition/`

**Key profiles**:

- **patient-access-brands**: Branded EHR endpoints for patient apps
- **patient-access-endpoint**: OAuth/FHIR capability metadata

---

## Declaring Profile Conformance

Resources claim conformance via `meta.profile`:

```json
{
  "resourceType": "Patient",
  "meta": {
    "profile": [
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"
    ]
  },
  "identifier": [
    {
      "use": "usual",
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "MR",
          "display": "Medical Record Number"
        }]
      },
      "system": "http://hospital.example.org",
      "value": "MRN-123456"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "Shaw",
      "given": ["Amy", "Victoria"]
    }
  ],
  "gender": "female",
  "birthDate": "1987-02-20"
}
```

**What this declaration means**:

- Validators will check against US Core Patient rules
- Servers may enforce stricter validation
- Clients know what fields are guaranteed to be present
- Search parameters follow US Core requirements

---

## Searching by Profile

**Find all US Core patients**:

```http
GET /Patient?_profile=http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient
```

**Use case**: Quality measure reporting (only count certified-compliant records)

---

## Understanding MustSupport

**MustSupport** is a profile flag indicating:

> "If data is available, it MUST be included. If received, it MUST be processed meaningfully."

### What MustSupport Does NOT Mean

- ❌ "Field is required" (cardinality defines that)
- ❌ "Data must always exist"
- ❌ "Must display to user"

### What MustSupport DOES Mean

**For senders** (systems producing data):

- If patient has a phone number, include it in `Patient.telecom`
- Don't omit available data

**For receivers** (systems consuming data):

- Must be able to store the element
- Must be able to retrieve and return it
- Must process it "meaningfully" (app-specific definition)

### Example: US Core Patient.telecom

US Core marks `Patient.telecom` as MustSupport but cardinality is 0..* (optional).

**Sender obligations**:

```javascript
// BAD: Patient has phone number in database but we omit it
const patient = {
  resourceType: "Patient",
  name: [{family: "Shaw"}],
  // telecom omitted despite being available
};

// GOOD: Include available telecom data
const patient = {
  resourceType: "Patient",
  name: [{family: "Shaw"}],
  telecom: [
    {system: "phone", value: "555-555-5555", use: "home"}
  ]
};
```

**Receiver obligations**:

```javascript
// BAD: Ignoring telecom entirely
function displayPatient(patient) {
  console.log(`Name: ${patient.name[0].family}`);
  // Phone number not processed
}

// GOOD: Process telecom meaningfully
function displayPatient(patient) {
  console.log(`Name: ${patient.name[0].family}`);
  if (patient.telecom) {
    const phone = patient.telecom.find(t => t.system === 'phone');
    if (phone) {
      console.log(`Phone: ${phone.value}`);
    }
  }
}
```

---

## FHIR Extensions: Adding Custom Data

Extensions let you add data elements not in base FHIR without breaking interoperability. Other systems that don't understand your extension can safely ignore it.

### Extension Structure

```json
{
  "extension": [
    {
      "url": "http://example.org/fhir/StructureDefinition/patient-ethnicity",
      "valueCodeableConcept": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/v3-Ethnicity",
          "code": "2135-2",
          "display": "Hispanic or Latino"
        }]
      }
    }
  ]
}
```

**Key elements**:

- **url**: Globally unique identifier for this extension (like a namespace)
- **value[x]**: The actual data (can be any FHIR data type)

---

## Types of Extensions

### Simple Extensions (Single Value)

**Example**: Favorite color (not in base FHIR)

```json
{
  "resourceType": "Patient",
  "name": [{"family": "Shaw"}],
  "extension": [
    {
      "url": "http://example.org/fhir/StructureDefinition/favorite-color",
      "valueString": "blue"
    }
  ]
}
```

**Use case**: Custom patient preferences for UI personalization

---

### Complex Extensions (Nested Structure)

**Example**: Mother's maiden name with date range

```json
{
  "resourceType": "Patient",
  "name": [{"family": "Shaw"}],
  "extension": [
    {
      "url": "http://example.org/fhir/StructureDefinition/mothers-maiden-name",
      "extension": [
        {
          "url": "name",
          "valueString": "Johnson"
        },
        {
          "url": "period",
          "valuePeriod": {
            "start": "1960-05-15",
            "end": "1985-06-20"
          }
        }
      ]
    }
  ]
}
```

**Structure**: Outer extension with `url` but no `value[x]`, inner extensions with sub-elements.

**Use case**: Identity verification (security question)

---

### Modifier Extensions (Change Meaning)

**Regular extensions** don't change the meaning of the resource. You can ignore them and still understand the data.

**Modifier extensions** DO change meaning. Ignoring them could cause misinterpretation.

**Example**: Negation extension

```json
{
  "resourceType": "Procedure",
  "code": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "80146002",
      "display": "Appendectomy"
    }]
  },
  "subject": {"reference": "Patient/123"},
  "modifierExtension": [
    {
      "url": "http://example.org/fhir/StructureDefinition/procedure-not-performed",
      "valueBoolean": true
    }
  ]
}
```

**Meaning**: This procedure was **NOT** performed (contrary to what the resource implies).

**Critical**: Systems MUST reject resources with unrecognized modifierExtensions. You can't safely ignore them.

```javascript
function processProcedure(procedure) {
  // Check for unknown modifier extensions
  if (procedure.modifierExtension) {
    const recognized = ['http://example.org/fhir/StructureDefinition/procedure-not-performed'];
    const unknown = procedure.modifierExtension.filter(
      ext => !recognized.includes(ext.url)
    );
    
    if (unknown.length > 0) {
      throw new Error(`Cannot process procedure with unknown modifier extensions: ${unknown.map(e => e.url).join(', ')}`);
    }
  }
  
  // Process normally
  const notPerformed = procedure.modifierExtension?.find(
    ext => ext.url === 'http://example.org/fhir/StructureDefinition/procedure-not-performed'
  )?.valueBoolean;
  
  if (notPerformed) {
    console.log("Procedure was NOT performed");
  } else {
    console.log("Procedure was performed");
  }
}
```

---

## Common US Core Extensions

### Race Extension

**URL**: `http://hl7.org/fhir/us/core/StructureDefinition/us-core-race`

**Structure**: Complex extension with OMB category + text

```json
{
  "resourceType": "Patient",
  "extension": [
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
      "extension": [
        {
          "url": "ombCategory",
          "valueCoding": {
            "system": "urn:oid:2.16.840.1.113883.6.238",
            "code": "2106-3",
            "display": "White"
          }
        },
        {
          "url": "text",
          "valueString": "White"
        }
      ]
    }
  ],
  "name": [{"family": "Shaw"}]
}
```

**OMB categories** (US Office of Management and Budget):

- 1002-5: American Indian or Alaska Native
- 2028-9: Asian
- 2054-5: Black or African American
- 2076-8: Native Hawaiian or Other Pacific Islander
- 2106-3: White

**Why two fields?**:

- **ombCategory**: Standardized code for statistical reporting
- **text**: Patient's own description (may be more specific: "Irish-American")

---

### Ethnicity Extension

**URL**: `http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity`

```json
{
  "resourceType": "Patient",
  "extension": [
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity",
      "extension": [
        {
          "url": "ombCategory",
          "valueCoding": {
            "system": "urn:oid:2.16.840.1.113883.6.238",
            "code": "2186-5",
            "display": "Not Hispanic or Latino"
          }
        },
        {
          "url": "text",
          "valueString": "Not Hispanic or Latino"
        }
      ]
    }
  ],
  "name": [{"family": "Shaw"}]
}
```

**OMB categories**:

- 2135-2: Hispanic or Latino
- 2186-5: Not Hispanic or Latino

---

### Birth Sex Extension

**URL**: `http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex`

```json
{
  "resourceType": "Patient",
  "extension": [
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex",
      "valueCode": "F"
    }
  ],
  "gender": "female",
  "name": [{"family": "Shaw"}]
}
```

**Values**: M, F, UNK

**Why separate from gender?**:

- **birthSex**: Biological sex assigned at birth (medical relevance for dosing, risk factors)
- **gender**: Administrative/social gender (preferred pronouns, identity)

A transgender man might have `birthSex: "F"` but `gender: "male"`.

---

## Complete Example: US Core Patient with Extensions

```json
{
  "resourceType": "Patient",
  "meta": {
    "profile": [
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"
    ]
  },
  "extension": [
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
      "extension": [
        {
          "url": "ombCategory",
          "valueCoding": {
            "system": "urn:oid:2.16.840.1.113883.6.238",
            "code": "2106-3",
            "display": "White"
          }
        },
        {
          "url": "detailed",
          "valueCoding": {
            "system": "urn:oid:2.16.840.1.113883.6.238",
            "code": "2108-9",
            "display": "European"
          }
        },
        {
          "url": "text",
          "valueString": "White, European ancestry"
        }
      ]
    },
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity",
      "extension": [
        {
          "url": "ombCategory",
          "valueCoding": {
            "system": "urn:oid:2.16.840.1.113883.6.238",
            "code": "2186-5",
            "display": "Not Hispanic or Latino"
          }
        },
        {
          "url": "text",
          "valueString": "Not Hispanic or Latino"
        }
      ]
    },
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex",
      "valueCode": "F"
    }
  ],
  "identifier": [
    {
      "use": "usual",
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "MR"
        }]
      },
      "system": "http://hospital.example.org",
      "value": "MRN-123456"
    },
    {
      "use": "official",
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "SS"
        }]
      },
      "system": "http://hl7.org/fhir/sid/us-ssn",
      "value": "123-45-6789"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "Shaw",
      "given": ["Amy", "Victoria"]
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "555-555-5555",
      "use": "home"
    },
    {
      "system": "email",
      "value": "amy.shaw@example.com"
    }
  ],
  "gender": "female",
  "birthDate": "1987-02-20",
  "address": [
    {
      "use": "home",
      "line": ["123 Main St", "Apt 4B"],
      "city": "Boston",
      "state": "MA",
      "postalCode": "02101",
      "country": "US"
    }
  ]
}
```

**What makes this US Core compliant**:

✅ Declared profile in meta.profile  
✅ At least one identifier (has two: MRN + SSN)  
✅ At least one name  
✅ Gender is present  
✅ Race extension included (MustSupport)  
✅ Ethnicity extension included (MustSupport)  
✅ BirthSex extension included (MustSupport)  

---

## Accessing Extensions in Code

### Reading Extensions

```javascript
function getExtensionValue(resource, url) {
  const ext = resource.extension?.find(e => e.url === url);
  if (!ext) return null;
  
  // Find the value[x] field
  const valueKey = Object.keys(ext).find(k => k.startsWith('value'));
  return ext[valueKey];
}

// Usage
const patient = /* ... fetch patient ... */;
const birthSex = getExtensionValue(
  patient,
  'http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex'
);
console.log(`Birth sex: ${birthSex}`); // "F"
```

### Reading Complex Extensions

```javascript
function getRaceText(patient) {
  const raceExt = patient.extension?.find(
    e => e.url === 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race'
  );
  
  if (!raceExt) return null;
  
  const textExt = raceExt.extension?.find(e => e.url === 'text');
  return textExt?.valueString;
}

// Usage
const raceText = getRaceText(patient);
console.log(`Race: ${raceText}`); // "White, European ancestry"
```

### Adding Extensions

```javascript
function addBirthSexExtension(patient, birthSex) {
  if (!patient.extension) {
    patient.extension = [];
  }
  
  // Remove existing birthSex extension if present
  patient.extension = patient.extension.filter(
    e => e.url !== 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex'
  );
  
  // Add new extension
  patient.extension.push({
    url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex',
    valueCode: birthSex
  });
}

// Usage
addBirthSexExtension(patient, 'F');
```

---

## Slicing: Dividing Arrays into Constrained Subsets

Profiles can **slice** arrays to enforce structure on multi-valued elements.

**Example**: Blood pressure Observation has two components (systolic and diastolic). A profile can define:

- **Slice 1 "systolic"**: component where code = LOINC 8480-6, cardinality 1..1
- **Slice 2 "diastolic"**: component where code = LOINC 8462-4, cardinality 1..1

This ensures every blood pressure Observation has exactly one systolic and one diastolic reading.

**Unsliced structure** (base FHIR):

```
Observation.component: 0..*
  code: 1..1
  value[x]: 0..1
```

**Sliced structure** (Vitals profile):

```
Observation.component: 2..2
  Slice "systolic": 1..1
    code: 1..1 (fixed to LOINC 8480-6)
    valueQuantity: 1..1
  Slice "diastolic": 1..1
    code: 1..1 (fixed to LOINC 8462-4)
    valueQuantity: 1..1
```

**Conformant resource**:

```json
{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "85354-9"
    }]
  },
  "subject": {"reference": "Patient/123"},
  "component": [
    {
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8480-6"
        }]
      },
      "valueQuantity": {"value": 120, "unit": "mmHg"}
    },
    {
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8462-4"
        }]
      },
      "valueQuantity": {"value": 80, "unit": "mmHg"}
    }
  ]
}
```

**Non-conformant** (only systolic):

```json
{
  "component": [
    {
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8480-6"
        }]
      },
      "valueQuantity": {"value": 120, "unit": "mmHg"}
    }
    // Missing diastolic slice - validation fails
  ]
}
```

---

## CapabilityStatement: Discovering Server Support

Servers declare their profile support via CapabilityStatement:

```http
GET /metadata
```

**Response** (excerpt):

```json
{
  "resourceType": "CapabilityStatement",
  "rest": [{
    "mode": "server",
    "resource": [
      {
        "type": "Patient",
        "profile": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
        "supportedProfile": [
          "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
          "http://hl7.org/fhir/uv/ips/StructureDefinition/Patient-uv-ips"
        ],
        "interaction": [
          {"code": "read"},
          {"code": "search-type"},
          {"code": "create"},
          {"code": "update"}
        ],
        "searchParam": [
          {"name": "name", "type": "string"},
          {"name": "birthdate", "type": "date"},
          {"name": "identifier", "type": "token"}
        ]
      }
    ]
  }]
}
```

**What this tells you**:

- **profile**: Primary profile for validation (US Core Patient)
- **supportedProfile**: This server also accepts IPS patients
- Resources submitted without profile declaration will be validated against US Core
- Search parameters follow US Core requirements

---

## Validation Against Profiles

### Server-Side Validation

When you POST a Patient:

```http
POST /Patient
Content-Type: application/fhir+json
```

**Body** (missing required identifier):

```json
{
  "resourceType": "Patient",
  "meta": {
    "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
  },
  "name": [{"family": "Doe"}],
  "gender": "male"
}
```

**Response** (422 Unprocessable Entity):

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "required",
    "diagnostics": "US Core Patient Profile: Patient.identifier: minimum cardinality is 1, but found 0",
    "location": ["Patient.identifier"]
  }]
}
```

---

### Explicit Validation with $validate

Test profile conformance without creating resource:

```http
POST /Patient/$validate
Content-Type: application/fhir+json
```

**Body**:

```json
{
  "resourceType": "Parameters",
  "parameter": [
    {
      "name": "resource",
      "resource": {
        "resourceType": "Patient",
        "name": [{"family": "Doe"}],
        "gender": "male"
      }
    },
    {
      "name": "profile",
      "valueUri": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"
    }
  ]
}
```

**Response**: OperationOutcome detailing all validation errors.

---

## Best Practices

### 1. Declare Profiles Explicitly

```javascript
// GOOD: Explicit profile declaration
const patient = {
  resourceType: "Patient",
  meta: {
    profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
  },
  identifier: [{system: "http://hospital.org", value: "MRN-123"}],
  name: [{family: "Doe"}],
  gender: "male"
};

// BAD: Relying on server defaults
const patient = {
  resourceType: "Patient",
  // No profile declared - server may apply wrong validation
  name: [{family: "Doe"}]
};
```

---

### 2. Check CapabilityStatement Before Submitting

```javascript
async function getSupportedProfiles(resourceType) {
  const caps = await fetch('/metadata').then(r => r.json());
  const resourceDef = caps.rest[0].resource.find(r => r.type === resourceType);
  return resourceDef?.supportedProfile || [];
}

// Usage
const profiles = await getSupportedProfiles('Patient');
if (profiles.includes('http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient')) {
  // Safe to use US Core Patient
  patient.meta.profile = ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'];
}
```

---

### 3. Handle MustSupport Gracefully

```javascript
function prepareUSCorePatient(rawPatient) {
  const patient = {
    resourceType: "Patient",
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
    },
    identifier: rawPatient.identifier, // Required
    name: rawPatient.name, // Required
    gender: rawPatient.gender // Required
  };
  
  // MustSupport elements: include if available
  if (rawPatient.telecom) {
    patient.telecom = rawPatient.telecom;
  }
  
  if (rawPatient.address) {
    patient.address = rawPatient.address;
  }
  
  if (rawPatient.birthDate) {
    patient.birthDate = rawPatient.birthDate;
  }
  
  // Extensions: include if available
  if (rawPatient.race) {
    patient.extension = patient.extension || [];
    patient.extension.push(buildRaceExtension(rawPatient.race));
  }
  
  return patient;
}
```

---

### 4. Use Standard Extensions When Possible

```javascript
// BAD: Custom extension for common concept
{
  "extension": [{
    "url": "http://myhospital.org/patient-race",
    "valueString": "White"
  }]
}

// GOOD: Use standard US Core extension
{
  "extension": [{
    "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
    "extension": [
      {
        "url": "ombCategory",
        "valueCoding": {
          "system": "urn:oid:2.16.840.1.113883.6.238",
          "code": "2106-3",
          "display": "White"
        }
      },
      {
        "url": "text",
        "valueString": "White"
      }
    ]
  }]
}
```

---

### 5. Document Custom Extensions

If creating custom extensions:

```javascript
/**
 * Extension: Preferred Pharmacy
 * URL: http://example.org/fhir/StructureDefinition/preferred-pharmacy
 * Type: Reference(Organization)
 * Context: Patient
 * Description: Patient's preferred pharmacy for prescription fulfillment
 * 
 * Example:
 * {
 *   "extension": [{
 *     "url": "http://example.org/fhir/StructureDefinition/preferred-pharmacy",
 *     "valueReference": {
 *       "reference": "Organization/pharmacy-123",
 *       "display": "CVS Pharmacy #4567"
 *     }
 *   }]
 * }
 */
```

Publish StructureDefinition resource documenting the extension formally.

---

## Common Pitfalls

### Pitfall 1: Assuming Profiles Add Fields

**Wrong assumption**: "US Core adds race field to Patient"

**Reality**: Race is an **extension**, not a base field. Base Patient structure is unchanged.

```javascript
// BAD: Looking for race as a top-level field
const race = patient.race; // undefined

// GOOD: Access via extension
const raceExt = patient.extension?.find(
  e => e.url === 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race'
);
const race = raceExt?.extension?.find(e => e.url === 'text')?.valueString;
```

---

### Pitfall 2: Confusing MustSupport with Required

**Wrong assumption**: "MustSupport = required field"

**Reality**: MustSupport means "process if present" not "must exist"

```javascript
// This is VALID US Core Patient (telecom is MustSupport but 0..*)
{
  "resourceType": "Patient",
  "meta": {
    "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
  },
  "identifier": [{system: "http://hospital.org", value: "MRN-123"}],
  "name": [{family: "Doe"}],
  "gender": "male"
  // No telecom - still valid!
}

// This is INVALID (identifier is 1..* - required)
{
  "resourceType": "Patient",
  "meta": {
    "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
  },
  "name": [{family: "Doe"}],
  "gender": "male"
  // Missing identifier - validation fails
}
```

---

### Pitfall 3: Using Wrong Profile URL

**Wrong**: Using base FHIR URL when you mean US Core

```json
{
  "meta": {
    "profile": ["http://hl7.org/fhir/StructureDefinition/Patient"]
  }
}
```

This declares conformance to **base FHIR**, not US Core (no identifier requirement).

**Right**: Use specific profile URL

```json
{
  "meta": {
    "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
  }
}
```

---

### Pitfall 4: Ignoring Extension URLs

**Wrong**: Assuming all extensions with same structure are equivalent

```javascript
// These are DIFFERENT extensions
const ext1 = {
  url: "http://example.org/race",
  valueString: "White"
};

const ext2 = {
  url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
  extension: [
    {url: "ombCategory", valueCoding: {code: "2106-3"}}
  ]
};
```

**Right**: Always check URL when processing extensions

```javascript
function findExtension(resource, url) {
  return resource.extension?.find(e => e.url === url);
}

const usRace = findExtension(
  patient,
  'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race'
);
```

---

### Pitfall 5: Not Validating Before Submission

**Wrong**: Assume client-side validation is enough

```javascript
// BAD: Submit without validation
await fetch('/Patient', {
  method: 'POST',
  body: JSON.stringify(patient)
});
// Server rejects with cryptic error
```

**Right**: Use $validate first or handle errors gracefully

```javascript
// GOOD: Validate explicitly
const validationResult = await fetch('/Patient/$validate', {
  method: 'POST',
  body: JSON.stringify({
    resourceType: "Parameters",
    parameter: [
      {name: "resource", resource: patient},
      {name: "profile", valueUri: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"}
    ]
  })
});

const outcome = await validationResult.json();
if (outcome.issue?.some(i => i.severity === 'error')) {
  console.error("Validation failed:", outcome.issue);
  // Fix errors before submitting
} else {
  // Safe to create
  await fetch('/Patient', {
    method: 'POST',
    body: JSON.stringify(patient)
  });
}
```

---

## Real-World Extension Examples

### Example 1: Patient's Preferred Pharmacy

**Scenario**: Hospital system needs to track patient's preferred pharmacy for e-prescribing.

**Extension definition**:

```json
{
  "resourceType": "StructureDefinition",
  "url": "http://hospital.example.org/fhir/StructureDefinition/preferred-pharmacy",
  "name": "PreferredPharmacy",
  "status": "active",
  "kind": "complex-type",
  "abstract": false,
  "context": [{
    "type": "element",
    "expression": "Patient"
  }],
  "type": "Extension",
  "baseDefinition": "http://hl7.org/fhir/StructureDefinition/Extension",
  "derivation": "constraint",
  "differential": {
    "element": [{
      "path": "Extension",
      "short": "Preferred pharmacy for prescriptions",
      "definition": "Reference to the Organization representing the patient's preferred pharmacy"
    }, {
      "path": "Extension.value[x]",
      "type": [{
        "code": "Reference",
        "targetProfile": ["http://hl7.org/fhir/StructureDefinition/Organization"]
      }]
    }]
  }
}
```

**Usage in Patient resource**:

```json
{
  "resourceType": "Patient",
  "id": "patient-123",
  "name": [{family: "Shaw", given: ["Amy"]}],
  "extension": [
    {
      "url": "http://hospital.example.org/fhir/StructureDefinition/preferred-pharmacy",
      "valueReference": {
        "reference": "Organization/pharmacy-cvs-4567",
        "display": "CVS Pharmacy #4567 - Main Street"
      }
    }
  ]
}
```

**Application code**:

```javascript
function getPreferredPharmacy(patient) {
  const ext = patient.extension?.find(
    e => e.url === 'http://hospital.example.org/fhir/StructureDefinition/preferred-pharmacy'
  );
  return ext?.valueReference;
}

// Usage
const pharmacy = getPreferredPharmacy(patient);
if (pharmacy) {
  console.log(`Preferred pharmacy: ${pharmacy.display}`);
  // Route prescription to this pharmacy
}
```

---

### Example 2: Observation Interpretation Comments

**Scenario**: Lab wants to add free-text interpretation beyond coded interpretation field.

**Extension definition** (simplified):

```json
{
  "url": "http://lab.example.org/fhir/StructureDefinition/interpretation-comment",
  "name": "InterpretationComment",
  "context": [{
    "type": "element",
    "expression": "Observation"
  }],
  "type": "Extension",
  "differential": {
    "element": [{
      "path": "Extension.value[x]",
      "type": [{
        "code": "string"
      }]
    }]
  }
}
```

**Usage**:

```json
{
  "resourceType": "Observation",
  "id": "glucose-elevated",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "2345-7",
      "display": "Glucose"
    }]
  },
  "subject": {"reference": "Patient/123"},
  "valueQuantity": {"value": 145, "unit": "mg/dL"},
  "interpretation": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
      "code": "H",
      "display": "High"
    }]
  }],
  "extension": [
    {
      "url": "http://lab.example.org/fhir/StructureDefinition/interpretation-comment",
      "valueString": "Slightly elevated but within expected range for non-fasting sample. Recommend fasting glucose if persistent."
    }
  ]
}
```

**Display in UI**:

```javascript
function displayObservation(obs) {
  console.log(`${obs.code.text}: ${obs.valueQuantity.value} ${obs.valueQuantity.unit}`);
  
  // Show coded interpretation
  if (obs.interpretation) {
    const interp = obs.interpretation[0].coding[0].display;
    console.log(`Interpretation: ${interp}`);
  }
  
  // Show extension comment if present
  const commentExt = obs.extension?.find(
    e => e.url === 'http://lab.example.org/fhir/StructureDefinition/interpretation-comment'
  );
  if (commentExt) {
    console.log(`Lab comment: ${commentExt.valueString}`);
  }
}

// Output:
// Glucose: 145 mg/dL
// Interpretation: High
// Lab comment: Slightly elevated but within expected range for non-fasting sample. Recommend fasting glucose if persistent.
```

---

### Example 3: Specimen Collection Difficulty

**Scenario**: Document challenges during specimen collection for quality control.

**Extension** (complex with sub-elements):

```json
{
  "resourceType": "Specimen",
  "id": "blood-sample-difficult",
  "type": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "119297000",
      "display": "Blood specimen"
    }]
  },
  "subject": {"reference": "Patient/123"},
  "collection": {
    "collectedDateTime": "2024-11-06T09:15:00Z"
  },
  "extension": [
    {
      "url": "http://hospital.example.org/fhir/StructureDefinition/collection-difficulty",
      "extension": [
        {
          "url": "encountered",
          "valueBoolean": true
        },
        {
          "url": "description",
          "valueString": "Patient has difficult venous access. Required 3 attempts."
        },
        {
          "url": "affectsQuality",
          "valueBoolean": false
        }
      ]
    }
  ]
}
```

**Processing**:

```javascript
function getCollectionDifficulty(specimen) {
  const diffExt = specimen.extension?.find(
    e => e.url === 'http://hospital.example.org/fhir/StructureDefinition/collection-difficulty'
  );
  
  if (!diffExt) return null;
  
  const encountered = diffExt.extension?.find(e => e.url === 'encountered')?.valueBoolean;
  const description = diffExt.extension?.find(e => e.url === 'description')?.valueString;
  const affectsQuality = diffExt.extension?.find(e => e.url === 'affectsQuality')?.valueBoolean;
  
  return {encountered, description, affectsQuality};
}

// Usage
const difficulty = getCollectionDifficulty(specimen);
if (difficulty?.encountered) {
  console.warn(`Collection difficulty: ${difficulty.description}`);
  if (difficulty.affectsQuality) {
    console.error("Sample quality may be compromised!");
  }
}
```

---

## Profile and Extension Discovery

### Finding Available Profiles

**1. Check server's CapabilityStatement**:

```javascript
async function discoverProfiles() {
  const caps = await fetch('/metadata').then(r => r.json());
  const profiles = {};
  
  caps.rest[0].resource.forEach(res => {
    profiles[res.type] = {
      primary: res.profile,
      supported: res.supportedProfile || []
    };
  });
  
  return profiles;
}

// Usage
const profiles = await discoverProfiles();
console.log("Patient profiles:", profiles.Patient.supported);
// ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
//  "http://hl7.org/fhir/uv/ips/StructureDefinition/Patient-uv-ips"]
```

---

**2. Query FHIR registries**:

- **Simplifier.net**: https://simplifier.net/
- **FHIR Registry**: http://fhir.org/guides/registry/
- **National/regional registries**: US Core (https://hl7.org/fhir/us/core/), AU Base, UK Core, etc.

---

### Finding Extensions for a Profile

**Query StructureDefinition resources**:

```http
GET /StructureDefinition?base=http://hl7.org/fhir/StructureDefinition/Patient&type=Extension
```

Returns all extensions defined for Patient.

**Parse StructureDefinition**:

```javascript
async function getProfileExtensions(profileUrl) {
  const structDef = await fetch(`/StructureDefinition?url=${encodeURIComponent(profileUrl)}`)
    .then(r => r.json());
  
  if (structDef.entry?.length === 0) {
    console.log("Profile not found");
    return [];
  }
  
  const profile = structDef.entry[0].resource;
  const extensions = [];
  
  profile.differential?.element?.forEach(elem => {
    if (elem.path.includes('.extension')) {
      const extUrl = elem.type?.[0]?.profile?.[0];
      if (extUrl) {
        extensions.push({
          name: elem.sliceName || elem.path,
          url: extUrl,
          cardinality: `${elem.min || 0}..${elem.max || '*'}`,
          mustSupport: elem.mustSupport || false
        });
      }
    }
  });
  
  return extensions;
}

// Usage
const extensions = await getProfileExtensions(
  'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'
);
extensions.forEach(ext => {
  console.log(`${ext.name}: ${ext.url} (${ext.cardinality})${ext.mustSupport ? ' [MustSupport]' : ''}`);
});
// Output:
// race: http://hl7.org/fhir/us/core/StructureDefinition/us-core-race (0..1) [MustSupport]
// ethnicity: http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity (0..1) [MustSupport]
// birthsex: http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex (0..1) [MustSupport]
```

---

## Testing Profile Conformance

### Unit Testing Approach

```javascript
const {FhirValidator} = require('fhir-validator');

describe('US Core Patient Conformance', () => {
  const validator = new FhirValidator();
  
  test('Valid US Core Patient passes validation', () => {
    const patient = {
      resourceType: "Patient",
      meta: {
        profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
      },
      identifier: [{system: "http://hospital.org", value: "MRN-123"}],
      name: [{family: "Doe", given: ["John"]}],
      gender: "male"
    };
    
    const result = validator.validate(patient, {
      profile: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'
    });
    
    expect(result.valid).toBe(true);
  });
  
  test('Patient without identifier fails US Core validation', () => {
    const patient = {
      resourceType: "Patient",
      meta: {
        profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
      },
      name: [{family: "Doe", given: ["John"]}],
      gender: "male"
    };
    
    const result = validator.validate(patient, {
      profile: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'
    });
    
    expect(result.valid).toBe(false);
    expect(result.messages).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        message: expect.stringContaining('identifier')
      })
    );
  });
  
  test('Race extension is properly structured', () => {
    const patient = {
      resourceType: "Patient",
      meta: {
        profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
      },
      identifier: [{system: "http://hospital.org", value: "MRN-123"}],
      name: [{family: "Doe"}],
      gender: "male",
      extension: [
        {
          url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
          extension: [
            {
              url: "ombCategory",
              valueCoding: {
                system: "urn:oid:2.16.840.1.113883.6.238",
                code: "2106-3",
                display: "White"
              }
            },
            {
              url: "text",
              valueString: "White"
            }
          ]
        }
      ]
    };
    
    const result = validator.validate(patient, {
      profile: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'
    });
    
    expect(result.valid).toBe(true);
  });
});
```

---

### Integration Testing with Live Server

```javascript
async function testProfileSupport(baseUrl, profile) {
  // Create minimal conformant resource
  const patient = {
    resourceType: "Patient",
    meta: {profile: [profile]},
    identifier: [{system: "http://test.org", value: "TEST-123"}],
    name: [{family: "TestPatient"}],
    gender: "unknown"
  };
  
  // Validate against server
  const validateResponse = await fetch(`${baseUrl}/Patient/$validate`, {
    method: 'POST',
    headers: {'Content-Type': 'application/fhir+json'},
    body: JSON.stringify({
      resourceType: "Parameters",
      parameter: [
        {name: "resource", resource: patient},
        {name: "profile", valueUri: profile}
      ]
    })
  });
  
  const outcome = await validateResponse.json();
  const errors = outcome.issue?.filter(i => i.severity === 'error') || [];
  
  if (errors.length === 0) {
    console.log(`✓ Server supports ${profile}`);
    return true;
  } else {
    console.log(`✗ Server does not fully support ${profile}`);
    errors.forEach(err => console.log(`  - ${err.diagnostics}`));
    return false;
  }
}

// Usage
await testProfileSupport(
  'https://launch.smarthealthit.org/v/r4/fhir',
  'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'
);
```

---

## Summary: Profiles vs. Extensions

| Aspect | Profiles | Extensions |
|--------|----------|------------|
| **Purpose** | Constrain existing resources | Add new data elements |
| **Scope** | Entire resource structure | Individual fields |
| **Cardinality** | Can tighten (0..* → 1..*) | Defines own cardinality |
| **Location** | Declared in meta.profile | Appear in extension array |
| **Validation** | Server validates against profile | Server validates extension structure |
| **Interop impact** | Must match profile for conformance | Can be ignored if not understood |
| **Examples** | US Core Patient, IPS AllergyIntolerance | Race, ethnicity, custom identifiers |

---

## Key Takeaways

**Profiles**:

- ✅ Use established profiles (US Core, IPS) when possible
- ✅ Declare profile in meta.profile for clarity
- ✅ Validate resources against profiles before submission
- ✅ Check server's CapabilityStatement for supported profiles
- ❌ Don't assume profile compliance without validation

**Extensions**:

- ✅ Use standard extensions when available (US Core race/ethnicity)
- ✅ Document custom extensions thoroughly
- ✅ Check extension URL exactly (namespace matters)
- ✅ Handle missing extensions gracefully (they're often optional)
- ❌ Don't ignore modifierExtensions (they change meaning)
- ❌ Don't create custom extensions for data already in base FHIR

**MustSupport**:

- ✅ Include MustSupport elements if data is available
- ✅ Build apps that can process MustSupport elements
- ❌ Don't confuse MustSupport with required (check cardinality)

---

## Next Steps

This completes the Advanced FHIR Concepts section. We've now covered:

- ✅ How profiles constrain resources for specific use cases
- ✅ MustSupport semantics and obligations
- ✅ Extension structure (simple, complex, modifier)
- ✅ Common US Core extensions (race, ethnicity, birthsex)
- ✅ Profile validation and conformance testing

Next, we'll explore SMART authorization—how apps obtain secure access to FHIR data.
