# Error Handling and OperationOutcome

## Why Error Handling Matters in Healthcare

In most web APIs, a 500 error with a generic message might be acceptable. In healthcare, poor error handling can have serious consequences:

- **Clinical impact**: "Failed to save medication order" without details → was it saved or not? Should the clinician retry?
- **Compliance risk**: Audit logs must capture WHY an operation failed
- **User experience**: "Resource invalid" is useless; "Patient.birthDate is required by US Core profile" is actionable
- **Debugging**: Distributed systems (EHR + SMART app + FHIR server) need rich context for troubleshooting

FHIR solves this with **OperationOutcome**, a structured resource that describes what went wrong, where, and why.

---

## The OperationOutcome Resource

OperationOutcome is FHIR's error/warning/info response format. It's returned when:

- **Operations fail**: Invalid requests, validation errors, authorization failures
- **Operations succeed with warnings**: "Resource saved, but birthDate format is deprecated"
- **Operations need additional info**: "Patient matched multiple records—clarify with identifier"

### Structure

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invalid",
      "details": {
        "text": "The resource does not conform to the profile"
      },
      "diagnostics": "Patient.birthDate: minimum required = 1, but only found 0",
      "location": ["Patient.birthDate"],
      "expression": ["Patient.birthDate"]
    }
  ]
}
```

Each **issue** has:

- **severity**: How serious is this? (`fatal`, `error`, `warning`, `information`)
- **code**: Machine-readable error type (from fixed valueset)
- **details**: Optional CodeableConcept with more context
- **diagnostics**: Human-readable explanation
- **location**: Where in the submitted resource (XPath-style or JSON pointer)
- **expression**: FHIRPath expression identifying the problem element

---

## Severity Levels

### fatal

**Meaning**: System is unavailable or operation cannot be processed at all.

**Example**: Database is down

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "fatal",
    "code": "exception",
    "diagnostics": "Database connection failed. Service temporarily unavailable."
  }]
}
```

**HTTP Status**: 500 Internal Server Error

**Client action**: Show error message, disable operations, retry with exponential backoff.

---

### error

**Meaning**: Operation failed. Resource not saved/updated.

**Example**: Required field missing

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "required",
    "diagnostics": "Observation.status is required",
    "location": ["Observation.status"],
    "expression": ["Observation.status"]
  }]
}
```

**HTTP Status**: 400 Bad Request, 422 Unprocessable Entity, 404 Not Found

**Client action**: Fix the error and retry.

---

### warning

**Meaning**: Operation succeeded, but something is suboptimal.

**Example**: Using deprecated code

```json
{
  "resourceType": "Patient",
  "id": "new-patient-123",
  "name": [{"family": "Doe"}],
  "gender": "male"
}
```

**Response** (201 Created):

**Body**:

```json
{
  "resourceType": "Patient",
  "id": "new-patient-123",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2024-11-06T16:00:00Z"
  },
  "name": [{"family": "Doe"}],
  "gender": "male",
  "contained": [
    {
      "resourceType": "OperationOutcome",
      "issue": [{
        "severity": "warning",
        "code": "business-rule",
        "diagnostics": "Patient birthDate is missing. Consider adding for age-based rules."
      }]
    }
  ]
}
```

**Client action**: Log warning, optionally prompt user to address.

---

### information

**Meaning**: Informational message, not a problem.

**Example**: Duplicate resource detected but not created

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "information",
    "code": "duplicate",
    "diagnostics": "Patient with identifier MRN-123 already exists. Returning existing resource.",
    "location": ["Patient.identifier[0]"]
  }]
}
```

**HTTP Status**: 200 OK (with existing resource)

**Client action**: Continue normally.

---

## Issue Type Codes

FHIR defines 40+ issue types. Here are the most important:

### Structural Errors

**invalid**: Content doesn't match spec

```json
{
  "severity": "error",
  "code": "invalid",
  "diagnostics": "Resource JSON is not valid FHIR: expected 'resourceType' field"
}
```

**structure**: Structural problem

```json
{
  "severity": "error",
  "code": "structure",
  "diagnostics": "Observation.code must be a CodeableConcept, got string"
}
```

**required**: Missing required element

```json
{
  "severity": "error",
  "code": "required",
  "diagnostics": "Patient.name: minimum cardinality is 1, found 0",
  "location": ["Patient.name"]
}
```

---

### Value Errors

**value**: Invalid value

```json
{
  "severity": "error",
  "code": "value",
  "diagnostics": "Patient.birthDate '2025-13-40' is not a valid date",
  "location": ["Patient.birthDate"]
}
```

**code-invalid**: Invalid code

```json
{
  "severity": "error",
  "code": "code-invalid",
  "diagnostics": "Observation.code '99999-9' is not a valid LOINC code",
  "location": ["Observation.code.coding[0].code"]
}
```

**invariant**: Constraint rule violated

```json
{
  "severity": "error",
  "code": "invariant",
  "diagnostics": "obs-7: If Observation.code is vital-signs, category must include vital-signs",
  "expression": ["Observation"]
}
```

---

### Business Logic Errors

**business-rule**: Business rule violation

```json
{
  "severity": "error",
  "code": "business-rule",
  "diagnostics": "Cannot prescribe opioid without valid DEA number",
  "location": ["MedicationRequest"]
}
```

**conflict**: Version conflict

```json
{
  "severity": "error",
  "code": "conflict",
  "diagnostics": "Resource has been modified. Expected version 3, but current version is 4",
  "location": ["Patient.meta.versionId"]
}
```

**duplicate**: Duplicate resource

```json
{
  "severity": "error",
  "code": "duplicate",
  "diagnostics": "Patient with SSN 123-45-6789 already exists",
  "location": ["Patient.identifier[1]"]
}
```

---

### Authorization Errors

**security**: Security problem

```json
{
  "severity": "error",
  "code": "security",
  "diagnostics": "Access denied: insufficient scopes. Required: patient/Observation.read"
}
```

**login**: Authentication needed

```json
{
  "severity": "error",
  "code": "login",
  "diagnostics": "Authorization token is missing or invalid"
}
```

**forbidden**: Forbidden operation

```json
{
  "severity": "error",
  "code": "forbidden",
  "diagnostics": "User does not have permission to delete Patient resources"
}
```

---

### Server Errors

**exception**: Unhandled exception

```json
{
  "severity": "fatal",
  "code": "exception",
  "diagnostics": "Unexpected error processing request. Request ID: 7f3b2e1c"
}
```

**timeout**: Request timed out

```json
{
  "severity": "error",
  "code": "timeout",
  "diagnostics": "Request exceeded 30 second timeout"
}
```

**throttled**: Rate limited

```json
{
  "severity": "error",
  "code": "throttled",
  "diagnostics": "Rate limit exceeded: 100 requests per minute. Retry after 45 seconds.",
  "details": {
    "text": "Rate limit exceeded"
  }
}
```

---

### Not Found Errors

**not-found**: Resource doesn't exist

```json
{
  "severity": "error",
  "code": "not-found",
  "diagnostics": "Patient/unknown-123 not found"
}
```

**deleted**: Resource was deleted

```json
{
  "severity": "error",
  "code": "deleted",
  "diagnostics": "Patient/old-456 was deleted on 2024-10-01",
  "location": ["Patient/old-456"]
}
```

---

## Complete Error Example (OperationOutcome)

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invalid",
      "details": {
        "text": "The resource does not conform to the profile"
      },
      "diagnostics": "Patient.birthDate: minimum required = 1, but only found 0",
      "location": ["Patient.birthDate"],
      "expression": ["Patient.birthDate"]
    },
    {
      "severity": "warning",
      "code": "business-rule",
      "details": {
        "text": "Patient age indicates pediatric patient but no guardian contact provided"
      },
      "diagnostics": "Consider adding guardian information for minors"
    }
  ]
}
```

**What this tells us**:

1. **First issue (error)**: Patient creation FAILED because birthDate is missing (required by profile)
2. **Second issue (warning)**: Even if birthDate were provided, there's a business rule concern about missing guardian info

**HTTP Status**: 422 Unprocessable Entity (validation error)

**Client response**:

```javascript
async function createPatient(patient) {
  const response = await fetch('/Patient', {
    method: 'POST',
    headers: {'Content-Type': 'application/fhir+json'},
    body: JSON.stringify(patient)
  });
  
  if (!response.ok) {
    const outcome = await response.json();
    
    if (outcome.resourceType === 'OperationOutcome') {
      const errors = outcome.issue.filter(i => i.severity === 'error');
      const warnings = outcome.issue.filter(i => i.severity === 'warning');
      
      if (errors.length > 0) {
        console.error("Validation errors:");
        errors.forEach(err => {
          console.error(`- ${err.location?.[0] || 'Unknown'}: ${err.diagnostics}`);
        });
        throw new Error("Patient validation failed");
      }
      
      if (warnings.length > 0) {
        console.warn("Validation warnings:");
        warnings.forEach(warn => {
          console.warn(`- ${warn.diagnostics}`);
        });
      }
    }
  }
  
  return response.json();
}
```

**Output**:

```
Validation errors:
- Patient.birthDate: Patient.birthDate: minimum required = 1, but only found 0

Error: Patient validation failed
```

---

## HTTP Status Codes and OperationOutcome

### 200 OK

**With OperationOutcome**: Operation succeeded, but has warnings

```http
HTTP/1.1 200 OK
Content-Type: application/fhir+json
```

**Body** (resource + contained OperationOutcome):

```json
{
  "resourceType": "Patient",
  "id": "patient-123",
  "contained": [
    {
      "resourceType": "OperationOutcome",
      "issue": [{
        "severity": "warning",
        "code": "business-rule",
        "diagnostics": "Phone number format should include country code"
      }]
    }
  ],
  "name": [{"family": "Doe"}]
}
```

---

### 201 Created

**Success**, resource created. May include warnings in contained OperationOutcome (as shown above).

---

### 400 Bad Request

**Malformed request**:

- Invalid JSON
- Missing Content-Type header
- Syntactically incorrect URL

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "invalid",
    "diagnostics": "Request body is not valid JSON: unexpected token at line 5"
  }]
}
```

---

### 401 Unauthorized

**Missing or invalid authentication**:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "login",
    "diagnostics": "Authorization header is required"
  }]
}
```

---

### 403 Forbidden

**Authenticated but not authorized**:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "forbidden",
    "diagnostics": "Token valid but lacks patient/Observation.write scope"
  }]
}
```

---

### 404 Not Found

**Resource doesn't exist**:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "not-found",
    "diagnostics": "Patient/unknown-patient-999 not found"
  }]
}
```

---

### 409 Conflict

**Version conflict or duplicate resource**:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "conflict",
    "diagnostics": "Resource version mismatch. Expected version 3, current version 5"
  }]
}
```

---

### 410 Gone

**Resource was deleted**:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "deleted",
    "diagnostics": "Patient/deleted-patient-123 was deleted on 2024-10-15"
  }]
}
```

---

### 412 Precondition Failed

**If-Match header version mismatch**:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "conflict",
    "diagnostics": "If-Match header specifies version 2, but current version is 3"
  }]
}
```

---

### 422 Unprocessable Entity

**Valid JSON, but violates FHIR rules**:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "required",
      "diagnostics": "Observation.status is required",
      "location": ["Observation.status"]
    },
    {
      "severity": "error",
      "code": "required",
      "diagnostics": "Observation.code is required",
      "location": ["Observation.code"]
    }
  ]
}
```

---

### 429 Too Many Requests

**Rate limit exceeded**:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "throttled",
    "diagnostics": "Rate limit: 100 requests/minute exceeded. Retry after 30 seconds."
  }]
}
```

**Headers**:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

---

### 500 Internal Server Error

**Server exception**:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "fatal",
    "code": "exception",
    "diagnostics": "Unexpected error. Request ID: 7f3b2e1c-4d5a-6b7c"
  }]
}
```

---

### 503 Service Unavailable

**Server maintenance or overload**:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "fatal",
    "code": "transient",
    "diagnostics": "Service temporarily unavailable. Scheduled maintenance until 22:00 UTC."
  }]
}
```

---

## Error Handling Best Practices

### 1. Always Check for OperationOutcome

```javascript
async function fhirRequest(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  
  // Even 200 OK can have warnings
  if (data.resourceType === 'OperationOutcome') {
    handleOperationOutcome(data);
  }
  
  // Check for contained OperationOutcome
  if (data.contained) {
    const outcome = data.contained.find(r => r.resourceType === 'OperationOutcome');
    if (outcome) {
      handleOperationOutcome(outcome);
    }
  }
  
  return data;
}

function handleOperationOutcome(outcome) {
  outcome.issue.forEach(issue => {
    switch (issue.severity) {
      case 'fatal':
      case 'error':
        console.error(`[${issue.code}] ${issue.diagnostics}`);
        break;
      case 'warning':
        console.warn(`[${issue.code}] ${issue.diagnostics}`);
        break;
      case 'information':
        console.info(`[${issue.code}] ${issue.diagnostics}`);
        break;
    }
  });
}
```

---

### 2. Extract Actionable Field Information

```javascript
function getFieldErrors(outcome) {
  return outcome.issue
    .filter(i => i.severity === 'error' && i.location)
    .map(i => ({
      field: i.location[0],
      message: i.diagnostics,
      code: i.code
    }));
}

// Usage
const errors = getFieldErrors(outcome);
errors.forEach(err => {
  // Highlight field in UI
  document.querySelector(`[name="${err.field}"]`).classList.add('error');
  // Show message
  showTooltip(err.field, err.message);
});
```

---

### 3. Retry Logic for Transient Errors

```javascript
async function fhirRequestWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (response.status === 429) {
        // Rate limited
        const retryAfter = response.headers.get('Retry-After') || 30;
        console.log(`Rate limited, retrying after ${retryAfter}s`);
        await sleep(retryAfter * 1000);
        continue;
      }
      
      if (response.status >= 500) {
        // Server error - maybe transient
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Server error, retrying in ${delay}ms`);
          await sleep(delay);
          continue;
        }
      }
      
      return data;
    } catch (error) {
      if (attempt < maxRetries) {
        console.log(`Network error, retrying (${attempt}/${maxRetries})`);
        await sleep(1000 * attempt);
        continue;
      }
      throw error;
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

### 4. User-Friendly Error Messages

```javascript
function getUserFriendlyMessage(outcome) {
  const errorMap = {
    'required': (issue) => `${issue.location?.[0]} is required`,
    'invalid': (issue) => `${issue.location?.[0]} has an invalid value`,
    'not-found': (issue) => `The requested resource was not found`,
    'forbidden': (issue) => `You don't have permission for this action`,
    'conflict': (issue) => `This record was recently updated. Please refresh and try again.`,
    'throttled': (issue) => `Too many requests. Please wait a moment and try again.`,
  };
  
  const primaryError = outcome.issue.find(i => i.severity === 'error');
  if (!primaryError) return "Operation completed with warnings";
  
  const mapper = errorMap[primaryError.code];
  return mapper ? mapper(primaryError) : primaryError.diagnostics;
}

// Usage
if (!response.ok) {
  const outcome = await response.json();
  alert(getUserFriendlyMessage(outcome));
}
```

---

## Next Steps

You now understand error handling and OperationOutcome. Next, we'll explore resource validation in depth.

→ [FHIR Validation](deepdive-fhir-validation.md)