# Common FHIR REST Operations

## Understanding FHIR's RESTful Nature

FHIR is built on REST (Representational State Transfer) principles, using standard HTTP methods to manipulate resources. If you've worked with modern web APIs, FHIR will feel familiar—but with healthcare-specific constraints and guarantees.

Every FHIR interaction follows this pattern:

```
[HTTP Method] [Base URL]/[Resource Type]/[id]?[parameters]
```

The beauty of REST is its simplicity:

- **GET**: Read data (safe, idempotent)
- **POST**: Create new resources or execute operations
- **PUT**: Replace entire resources (idempotent)
- **PATCH**: Partially update resources
- **DELETE**: Remove resources (idempotent)

But FHIR adds healthcare-specific behaviors:

- Strict validation (resources must conform to profiles)
- Version tracking (every change creates a new version)
- Conditional operations (create-if-not-exists, update-if-unchanged)
- Search modifiers (`:exact`, `:contains`, `:missing`)
- Chaining and reverse chaining (search through relationships)

Let's explore each operation with real-world clinical scenarios.

---

## Base URL Structure

All FHIR operations start with a base URL:

```
https://launch.smarthealthit.org/v/r4/fhir
```

This identifies:

- **Protocol**: HTTPS (required for production)
- **Server**: launch.smarthealthit.org
- **Version**: r4 (FHIR R4)
- **Endpoint**: /fhir (base path)

Your app discovers this URL via SMART App Launch or manual configuration.

---

## READ Operations: Retrieving Resources

### GET [base]/[type]/[id] - Read by ID

**When to use**: You know the exact resource ID and need the current version.

**Example**: Fetch a specific patient

```http
GET /Patient/smart-1288992
Accept: application/fhir+json
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Response** (200 OK):

```json
{
  "resourceType": "Patient",
  "id": "smart-1288992",
  "meta": {
    "versionId": "3",
    "lastUpdated": "2024-10-15T14:22:00Z"
  },
  "name": [
    {"family": "Shaw", "given": ["Amy", "Victoria"]}
  ],
  "gender": "female",
  "birthDate": "1987-02-20"
}
```

**HTTP Headers**:

- **Accept**: `application/fhir+json` (or `application/fhir+xml`)
- **Authorization**: OAuth 2.0 Bearer token (from SMART launch)

**Response Headers**:

- **ETag**: `W/"3"` (version tag for optimistic locking)
- **Last-Modified**: `Tue, 15 Oct 2024 14:22:00 GMT`

**Status codes**:

- **200 OK**: Resource found and returned
- **404 Not Found**: Resource ID doesn't exist
- **410 Gone**: Resource was deleted
- **401 Unauthorized**: Invalid/missing token
- **403 Forbidden**: Token valid but no permission for this resource

**Error handling**:

```javascript
async function fetchPatient(patientId) {
  try {
    const response = await fetch(`/Patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json'
      }
    });
    
    if (response.status === 404) {
      return {error: "Patient not found", code: 404};
    }
    
    if (response.status === 410) {
      return {error: "Patient record was deleted", code: 410};
    }
    
    if (!response.ok) {
      const outcome = await response.json();
      return {error: outcome.issue[0].diagnostics, code: response.status};
    }
    
    return await response.json();
  } catch (error) {
    return {error: "Network error", details: error.message};
  }
}
```

---

### GET [base]/[type]/[id]/_history/[vid] - Read Specific Version

**When to use**: Auditing, comparing changes over time, retrieving deleted resources.

**Example**: Fetch version 2 of a patient record

```http
GET /Patient/smart-1288992/_history/2
```

**Response** (200 OK):

```json
{
  "resourceType": "Patient",
  "id": "smart-1288992",
  "meta": {
    "versionId": "2",
    "lastUpdated": "2024-06-15T10:00:00Z"
  },
  "name": [
    {"family": "Shaw", "given": ["Amy"]}
  ],
  "gender": "female",
  "birthDate": "1987-02-20"
}
```

**Use case**: Compare v2 (before middle name added) with v3 (current):

```javascript
async function compareVersions(resourceType, id, oldVersion, newVersion) {
  const v1 = await fetch(`/${resourceType}/${id}/_history/${oldVersion}`);
  const v2 = await fetch(`/${resourceType}/${id}/_history/${newVersion}`);
  
  // Compare names
  console.log("Old name:", v1.name[0].given.join(' '));  // "Amy"
  console.log("New name:", v2.name[0].given.join(' '));  // "Amy Victoria"
}
```

---

## CREATE Operations: Adding New Resources

### POST [base]/[type] - Create New Resource

**When to use**: Adding a new observation, patient, condition, etc.

**Example**: Record a new blood pressure reading

```http
POST /Observation
Content-Type: application/fhir+json
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Body**:

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
      "display": "Blood pressure panel"
    }]
  },
  "subject": {"reference": "Patient/smart-1288992"},
  "effectiveDateTime": "2024-11-06T10:30:00-05:00",
  "component": [
    {
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8480-6",
          "display": "Systolic blood pressure"
        }]
      },
      "valueQuantity": {"value": 128, "unit": "mmHg"}
    },
    {
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8462-4",
          "display": "Diastolic blood pressure"
        }]
      },
      "valueQuantity": {"value": 82, "unit": "mmHg"}
    }
  ]
}
```

**Response** (201 Created):

```http
HTTP/1.1 201 Created
Location: https://fhir.example.org/Observation/new-obs-12345/_history/1
ETag: W/"1"
Last-Modified: Wed, 06 Nov 2024 15:30:00 GMT
Content-Type: application/fhir+json
```

**Body**:

```json
{
  "resourceType": "Observation",
  "id": "new-obs-12345",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2024-11-06T15:30:00Z"
  },
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "85354-9",
      "display": "Blood pressure panel"
    }]
  },
  "subject": {"reference": "Patient/smart-1288992"},
  "effectiveDateTime": "2024-11-06T10:30:00-05:00",
  "component": [
    {
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8480-6"
        }]
      },
      "valueQuantity": {"value": 128, "unit": "mmHg"}
    },
    {
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8462-4"
        }]
      },
      "valueQuantity": {"value": 82, "unit": "mmHg"}
    }
  ]
}
```

**Key response elements**:

- **Location header**: Full URL to newly created resource (includes server-assigned ID)
- **ETag**: Version 1 (first version)
- **201 Created**: Standard HTTP success code for resource creation
- **id field**: Server assigned "new-obs-12345" (client didn't provide this)

**JavaScript example**:

```javascript
async function createObservation(observation) {
  const response = await fetch('/Observation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/fhir+json',
      'Authorization': `Bearer ${accessToken}`,
      'Prefer': 'return=representation'  // Request full resource in response
    },
    body: JSON.stringify(observation)
  });
  
  if (response.status === 201) {
    const created = await response.json();
    const newId = created.id;
    console.log(`Created Observation/${newId}`);
    return created;
  } else {
    const outcome = await response.json();
    console.error("Creation failed:", outcome.issue);
    throw new Error(outcome.issue[0].diagnostics);
  }
}
```

**Status codes**:

- **201 Created**: Success
- **400 Bad Request**: Invalid JSON or missing required fields
- **422 Unprocessable Entity**: Valid JSON but violates FHIR rules (e.g., missing `status`)
- **409 Conflict**: Duplicate resource (if conditional create checks fail)

---

## UPDATE Operations: Modifying Resources

### PUT [base]/[type]/[id] - Replace Resource

**When to use**: Updating a resource when you have the complete updated version.

**Example**: Update patient's phone number

**Step 1**: Fetch current version

```http
GET /Patient/smart-1288992
```

**Step 2**: Modify locally

```javascript
const patient = await fetchPatient('smart-1288992');
patient.telecom = [
  {
    system: "phone",
    value: "555-555-7777",  // New number
    use: "mobile"
  }
];
```

**Step 3**: Send entire updated resource

```http
PUT /Patient/smart-1288992
Content-Type: application/fhir+json
If-Match: W/"3"
```

**Body** (entire resource, including unchanged fields):

```json
{
  "resourceType": "Patient",
  "id": "smart-1288992",
  "meta": {
    "versionId": "3"
  },
  "name": [
    {"family": "Shaw", "given": ["Amy", "Victoria"]}
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "555-555-7777",
      "use": "mobile"
    }
  ],
  "gender": "female",
  "birthDate": "1987-02-20"
}
```

**Response** (200 OK):

```http
HTTP/1.1 200 OK
ETag: W/"4"
Last-Modified: Wed, 06 Nov 2024 16:00:00 GMT
```

**Body**:

```json
{
  "resourceType": "Patient",
  "id": "smart-1288992",
  "meta": {
    "versionId": "4",
    "lastUpdated": "2024-11-06T16:00:00Z"
  },
  "name": [
    {"family": "Shaw", "given": ["Amy", "Victoria"]}
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "555-555-7777",
      "use": "mobile"
    }
  ],
  "gender": "female",
  "birthDate": "1987-02-20"
}
```

**Optimistic locking with If-Match**:

The `If-Match: W/"3"` header prevents lost updates:

- If version is still 3: Update succeeds (version becomes 4)
- If another client updated (version now 4+): Server returns 412 Precondition Failed

**Handling version conflicts**:

```javascript
async function updatePatient(patientId, updates) {
  let retries = 3;
  
  while (retries > 0) {
    // Fetch current version
    const response = await fetch(`/Patient/${patientId}`);
    const patient = await response.json();
    const currentVersion = patient.meta.versionId;
    
    // Apply updates
    Object.assign(patient, updates);
    
    // Attempt update with version check
    const updateResponse = await fetch(`/Patient/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/fhir+json',
        'If-Match': `W/"${currentVersion}"`
      },
      body: JSON.stringify(patient)
    });
    
    if (updateResponse.ok) {
      return await updateResponse.json();
    }
    
    if (updateResponse.status === 412) {
      console.log("Version conflict, retrying...");
      retries--;
      continue;
    }
    
    throw new Error(`Update failed: ${updateResponse.status}`);
  }
  
  throw new Error("Max retries exceeded");
}
```

**Status codes**:

- **200 OK**: Update succeeded
- **412 Precondition Failed**: Version mismatch (someone else updated)
- **404 Not Found**: Resource doesn't exist
- **422 Unprocessable Entity**: Invalid resource content

---

### PATCH [base]/[type]/[id] - Partial Update

**When to use**: Changing specific fields without sending entire resource (more efficient).

**Example**: Update observation status from "preliminary" to "final"

```http
PATCH /Observation/obs-12345
Content-Type: application/json-patch+json
```

**Body** (JSON Patch format):

```json
[
  {
    "op": "replace",
    "path": "/status",
    "value": "final"
  }
]
```

**Response** (200 OK):

```json
{
  "resourceType": "Observation",
  "id": "obs-12345",
  "meta": {
    "versionId": "2",
    "lastUpdated": "2024-11-06T16:15:00Z"
  },
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "2345-7"
    }]
  },
  "subject": {"reference": "Patient/smart-1288992"},
  "valueQuantity": {"value": 95, "unit": "mg/dL"}
}
```

**JSON Patch operations**:

- **replace**: Change existing value
- **add**: Add new field or array element
- **remove**: Delete field
- **move**: Rename field
- **copy**: Duplicate field
- **test**: Verify value before applying changes

**Complex patch example** (add interpretation):

```json
[
  {
    "op": "test",
    "path": "/status",
    "value": "final"
  },
  {
    "op": "add",
    "path": "/interpretation",
    "value": [{
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
        "code": "N",
        "display": "Normal"
      }]
    }]
  }
]
```

The `test` operation ensures status is "final" before adding interpretation (atomic check-and-set).

**Status codes**:

- **200 OK**: Patch succeeded
- **400 Bad Request**: Invalid JSON Patch syntax
- **409 Conflict**: Test operation failed
- **422 Unprocessable Entity**: Patch would create invalid resource

---

## DELETE Operations: Removing Resources

### DELETE [base]/[type]/[id] - Delete Resource

**When to use**: Removing erroneous data, patient-requested deletion (right to be forgotten).

**Example**: Delete duplicate observation

```http
DELETE /Observation/duplicate-obs-999
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Response** (204 No Content):

```http
HTTP/1.1 204 No Content
```

**No body** (successful deletion returns empty response).

**What happens**:

- Resource is marked as deleted (soft delete)
- Subsequent GET returns 410 Gone
- Resource still accessible via history: `GET /Observation/duplicate-obs-999/_history/1`

**Hard delete** (optional server support):

Some servers support permanent deletion via `X-Hard-Delete` header (non-standard):

```http
DELETE /Observation/duplicate-obs-999
X-Hard-Delete: true
```

This permanently removes all versions (cannot be recovered).

**Status codes**:

- **204 No Content**: Deleted successfully
- **404 Not Found**: Resource doesn't exist (already deleted or never existed)
- **405 Method Not Allowed**: Server doesn't support DELETE
- **409 Conflict**: Resource is referenced by others (cascading delete policy)

**Safety check before delete**:

```javascript
async function safeDelete(resourceType, id) {
  // Check if resource is referenced by others
  const references = await fetch(
    `/${resourceType}?_id=${id}&_summary=count&_revinclude=*`
  );
  
  if (references.total > 1) {  // > 1 because resource itself is included
    console.warn(`Resource is referenced by ${references.total - 1} other resources`);
    return {
      deleted: false,
      reason: "Resource is still referenced"
    };
  }
  
  const response = await fetch(`/${resourceType}/${id}`, {
    method: 'DELETE'
  });
  
  return {
    deleted: response.status === 204,
    status: response.status
  };
}
```

---

## SEARCH Operations: Querying Resources

### GET [base]/[type]?[parameters] - Search by Criteria

**When to use**: Finding resources matching specific criteria (most common operation).

**Basic examples**:

**Search patients by name**:

```http
GET /Patient?name=Shaw
```

**Search observations for patient**:

```http
GET /Observation?patient=smart-1288992
```

**Search active conditions**:

```http
GET /Condition?patient=smart-1288992&clinical-status=active
```

**Complex example** (recent lab results for patient):

```http
GET /Observation?patient=smart-1288992&category=laboratory&date=ge2024-01-01&_sort=-date&_count=20
```

Parameters:

- `patient=smart-1288992`: Filter to specific patient
- `category=laboratory`: Only lab results (not vitals)
- `date=ge2024-01-01`: From Jan 1, 2024 onward (`ge` = greater-or-equal)
- `_sort=-date`: Sort descending by date (newest first, `-` prefix)
- `_count=20`: Limit to 20 results per page

**Response** (searchset Bundle):

```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 47,
  "link": [
    {
      "relation": "self",
      "url": "https://fhir.example.org/Observation?patient=smart-1288992&category=laboratory&date=ge2024-01-01&_sort=-date&_count=20"
    },
    {
      "relation": "next",
      "url": "https://fhir.example.org/Observation?patient=smart-1288992&category=laboratory&date=ge2024-01-01&_sort=-date&_count=20&_offset=20"
    }
  ],
  "entry": [
    {
      "fullUrl": "https://fhir.example.org/Observation/hba1c-20241101",
      "resource": {
        "resourceType": "Observation",
        "id": "hba1c-20241101",
        "status": "final",
        "category": [{
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
            "code": "laboratory"
          }]
        }],
        "code": {
          "coding": [{
            "system": "http://loinc.org",
            "code": "4548-4",
            "display": "Hemoglobin A1c"
          }]
        },
        "subject": {"reference": "Patient/smart-1288992"},
        "effectiveDateTime": "2024-11-01T09:15:00Z",
        "valueQuantity": {"value": 7.2, "unit": "%"}
      },
      "search": {
        "mode": "match",
        "score": 1.0
      }
    }
    // ... 19 more entries
  ]
}
```

**Pagination handling**:

```javascript
async function fetchAllResults(searchUrl) {
  const allResources = [];
  let url = searchUrl;
  
  while (url) {
    const bundle = await fetch(url).then(r => r.json());
    
    // Extract resources
    const resources = bundle.entry?.map(e => e.resource) || [];
    allResources.push(...resources);
    
    // Find next link
    const nextLink = bundle.link?.find(l => l.relation === "next");
    url = nextLink?.url;
    
    console.log(`Fetched ${resources.length} resources (total: ${allResources.length}/${bundle.total})`);
  }
  
  return allResources;
}

// Usage
const allLabs = await fetchAllResults(
  "/Observation?patient=smart-1288992&category=laboratory&_count=50"
);
console.log(`Fetched all ${allLabs.length} lab results`);
```

We'll explore search parameters in depth in the next document.

---

## HISTORY Operations: Viewing Changes

### GET [base]/[type]/[id]/_history - Resource History

**When to use**: Auditing changes, tracking who modified what and when.

**Example**: View all versions of a patient record

```http
GET /Patient/smart-1288992/_history
```

**Response** (history Bundle):

```json
{
  "resourceType": "Bundle",
  "type": "history",
  "total": 4,
  "entry": [
    {
      "fullUrl": "https://fhir.example.org/Patient/smart-1288992/_history/4",
      "resource": {
        "resourceType": "Patient",
        "id": "smart-1288992",
        "meta": {
          "versionId": "4",
          "lastUpdated": "2024-11-06T16:00:00Z"
        },
        "name": [{"family": "Shaw", "given": ["Amy", "Victoria"]}],
        "telecom": [{"system": "phone", "value": "555-555-7777"}],
        "gender": "female",
        "birthDate": "1987-02-20"
      },
      "request": {
        "method": "PUT",
        "url": "Patient/smart-1288992"
      },
      "response": {
        "status": "200"
      }
    },
    {
      "fullUrl": "https://fhir.example.org/Patient/smart-1288992/_history/3",
      "resource": {
        "resourceType": "Patient",
        "id": "smart-1288992",
        "meta": {
          "versionId": "3",
          "lastUpdated": "2024-10-15T14:22:00Z"
        },
        "name": [{"family": "Shaw", "given": ["Amy", "Victoria"]}],
        "gender": "female",
        "birthDate": "1987-02-20"
      },
      "request": {
        "method": "PUT",
        "url": "Patient/smart-1288992"
      },
      "response": {
        "status": "200"
      }
    }
    // ... versions 2 and 1
  ]
}
```

Each entry shows:

- Full resource at that version
- HTTP method used (PUT, POST, DELETE)
- Timestamp

**Use case**: Audit trail

```javascript
async function auditResourceChanges(resourceType, id) {
  const historyBundle = await fetch(`/${resourceType}/${id}/_history`).then(r => r.json());
  
  const changes = historyBundle.entry.map(entry => {
    return {
      version: entry.resource.meta.versionId,
      timestamp: entry.resource.meta.lastUpdated,
      method: entry.request.method,
      // Simple diff: compare with next version
    };
  });
  
  changes.forEach(change => {
    console.log(`v${change.version} - ${change.timestamp} - ${change.method}`);
  });
  
  return changes;
}
```

---

### GET [base]/[type]/_history - Type-Level History

**When to use**: See all changes to a resource type (e.g., all Patient updates in last hour).

**Example**:

```http
GET /Patient/_history?_since=2024-11-06T15:00:00Z&_count=50
```

Returns history Bundle with all Patient resources created/updated since 3 PM.

---

### GET [base]/_history - System-Level History

**When to use**: Complete audit log of all changes to any resource type.

**Example**:

```http
GET /_history?_since=2024-11-06T00:00:00Z
```

Returns massive Bundle with ALL resource changes today (use cautiously!).

---

## CAPABILITIES: Discovering Server Features

### GET [base]/metadata - CapabilityStatement

**When to use**: Before interacting with server, discover what it supports.

**Example**:

```http
GET /metadata
```

**Response** (abbreviated):

```json
{
  "resourceType": "CapabilityStatement",
  "status": "active",
  "date": "2024-01-01",
  "kind": "instance",
  "fhirVersion": "4.0.1",
  "format": ["json", "xml"],
  "rest": [{
    "mode": "server",
    "security": {
      "extension": [{
        "url": "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris",
        "extension": [
          {
            "url": "authorize",
            "valueUri": "https://auth.example.org/authorize"
          },
          {
            "url": "token",
            "valueUri": "https://auth.example.org/token"
          }
        ]
      }],
      "service": [{
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/restful-security-service",
          "code": "SMART-on-FHIR"
        }]
      }]
    },
    "resource": [
      {
        "type": "Patient",
        "profile": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
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
      },
      {
        "type": "Observation",
        "interaction": [
          {"code": "read"},
          {"code": "search-type"},
          {"code": "create"}
        ],
        "searchParam": [
          {"name": "patient", "type": "reference"},
          {"name": "code", "type": "token"},
          {"name": "date", "type": "date"},
          {"name": "category", "type": "token"}
        ]
      }
    ]
  }]
}
```

**What you learn**:

- **OAuth endpoints**: Where to get tokens (authorize, token URLs)
- **Supported resources**: Patient, Observation (but maybe not Medication)
- **Supported operations**: read, search-type, create, update (no delete for Observation)
- **Search parameters**: Which filters work
- **Profiles**: US Core Patient (stricter requirements than base FHIR)

**Client usage**:

```javascript
async function discoverCapabilities(baseUrl) {
  const caps = await fetch(`${baseUrl}/metadata`).then(r => r.json());
  
  const capabilities = {
    fhirVersion: caps.fhirVersion,
    oauthAuthorize: caps.rest[0].security.extension[0].extension.find(e => e.url === "authorize").valueUri,
    oauthToken: caps.rest[0].security.extension[0].extension.find(e => e.url === "token").valueUri,
    resources: {}
  };
  
  caps.rest[0].resource.forEach(res => {
    capabilities.resources[res.type] = {
      profile: res.profile,
      canRead: res.interaction.some(i => i.code === "read"),
      canSearch: res.interaction.some(i => i.code === "search-type"),
      canCreate: res.interaction.some(i => i.code === "create"),
      canUpdate: res.interaction.some(i => i.code === "update"),
      canDelete: res.interaction.some(i => i.code === "delete"),
      searchParams: res.searchParam?.map(p => p.name) || []
    };
  });
  
  return capabilities;
}

// Usage
const caps = await discoverCapabilities("https://fhir.example.org");
console.log("Supports Patient read?", caps.resources.Patient.canRead);
console.log("Patient search params:", caps.resources.Patient.searchParams);
```

---

## Next Steps

You now understand the core FHIR REST operations. Next, we'll dive deep into search parameters—the most powerful and complex part of the API.

→ [FHIR Search Parameters](deepdive-fhir-search-parameters.md)