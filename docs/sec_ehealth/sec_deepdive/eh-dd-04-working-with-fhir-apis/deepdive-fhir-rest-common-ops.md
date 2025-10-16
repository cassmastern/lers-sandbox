# Common FHIR Operations (REST API)

## Layout 1

> information laoyout 1

---

### Base URL

```http
https://launch.smarthealthit.org/v/r4/fhir
```

### READ - Get a specific resource by ID

`GET [base]/[resourceType]/[id]`Example:`GET /Patient/smart-1288992`Response: `200 OK + Patient resource`Headers:

- Authorization: `Bearer [access_token]`
- Accept: `application/fhir+json`

### READ - Get a specific version of a resource

`GET [base]/[resourceType]/[id]/_history/[version]`
Example:
`GET /Patient/smart-1288992/_history/1`
Response: `200 OK + versioned Patient resource`

### UPDATE - Replace an existing resource

`PUT [base]/[resourceType]/[id]`
Example:
`PUT /Patient/smart-1288992`
`Content-Type: application/fhir+json`
Body: `Updated Patient resource`
Response: `200 OK` or `201 Created`

### PATCH - Partial update of a resource

`PATCH [base]/[resourceType]/[id]`
Content-Type: `application/json-patch+json`
Body: `JSON Patch document`

```json
[
  { "op": "replace", "path": "/name/0/given/0", "value": "John" }
]
```

Response: `200 OK`

### DELETE - Remove a resource

`DELETE [base]/[resourceType]/[id]`
Example: `DELETE /Observation/12345`
Response: `204 No Content`

### CREATE - Create a new resource

`POST [base]/[resourceType]`
Content-Type: `application/fhir+json`
Body: \[New resource (without id)]
Response: `201 Created`
Location: `[base]/[resourceType]/[new-id]`

### SEARCH - Query for resources

`GET [base]/[resourceType]?[parameters]`

### Common search parameters

- `_id`: Resource ID
- `_lastUpdated`: Last update time
- `_tag`: Tag search
- `_profile`: Profile search
- `_security`: Security label search
- `_text`: Text search
- `_content`: Content search
- `_list`: List membership
- `_has`: Reverse chaining
- `_type`: Resource type (for system searches)

### Result parameters:

- `_sort`: Sort results (+field ascending, -field descending)
- `_count`: Page size
- `_include`: Include referenced resources
- `_revinclude`: Include resources that reference this
- `_summary`: Return summary (true, text, data, count)
- `_elements`: Return specific elements
- `_contained`: Include contained resources

Examples:
`GET /Patient?name=Smith&_count=10`
`GET /Observation?patient=123&category=vital-signs&_sort=-date`
`GET /Condition?subject=Patient/123&clinical-status=active`
Response: `200 OK + Bundle (searchset)`

### SEARCH (POST) - Complex searches

`POST [base]/[resourceType]/_search`
Content-Type: `application/x-www-form-urlencoded`
Body: `name=Smith&birthdate=1970-01-01`
Response: `200 OK + Bundle`

### HISTORY - Get resource history

Instance level: `GET [base]/[resourceType]/[id]/_history`
Type level: `GET [base]/[resourceType]/_history`
System level: `GET [base]/_history`

Parameters:

- `_count`: Page size
- `_since`: Start date
- `_at`: Point in time

Response: `200 OK + Bundle (history)`

### CAPABILITIES - Get server capabilities

`GET [base]/metadata`
Response: `200 OK + CapabilityStatement`

### BATCH - Multiple independent operations

`POST [base]`
Content-Type: `application/fhir+json`
Body: `Bundle with type=batch`

```json
{
  "resourceType": "Bundle",
  "type": "batch",
  "entry": [
    {
      "request": {
        "method": "GET",
        "url": "Patient/123"
      }
    },
    {
      "request": {
        "method": "POST",
        "url": "Observation"
      },
      "resource": { ... }
    }
  ]
}
```

Response: `200 OK + Bundle with responses`

### TRANSACTION - Atomic bundle operation

`POST [base]`
Content-Type: `application/fhir+json`
Body: `Bundle with type=transaction`

```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "fullUrl": "urn:uuid:patient-temp-id",
      "request": {
        "method": "POST",
        "url": "Patient"
      },
      "resource": { ... }
    },
    {
      "request": {
        "method": "POST",
        "url": "Observation"
      },
      "resource": {
        "subject": {
          "reference": "urn:uuid:patient-temp-id"
        }
      }
    }
  ]
}
```

All succeed or all fail atomically.
Response:  `200 OK + Bundle with responses`

### OPERATIONS - Named operations

System level: `POST [base]/$[operation]`
Type level: `POST [base]/[resourceType]/$[operation]`
Instance level: `POST [base]/[resourceType]/[id]/$[operation]`

Common operations:

- `$validate`: Validate a resource
- `$meta`: Get/add/delete metadata
- `$everything`: Get all related resources
- `$document`: Generate document
- `$translate`: Translate codes
- `$expand`: Expand value set

Examples:
`POST /Patient/123/$everything`
`POST /ValueSet/abc/$expand`

Content-Type: `application/fhir+json`
Body: `Parameters resource`

### CONDITIONAL OPERATIONS

Conditional Read: `GET [base]/[type]?[search parameters]`
If-None-Match: `W/"[version]"`
Conditional Create: `POST [base]/[type]`
If-None-Exist: `[search parameters]`

Conditional Update: `PUT [base]/[type]?[search parameters]`
Conditional Delete: `DELETE [base]/[type]?[search parameters]`
Example: `POST /Patient`
If-None-Exist: `identifier=http://hospital.org|MRN123`

### SEARCH MODIFIERS

`:exact` - Exact match
`:contains` - Contains substring
`:missing` - Element is missing (true/false)
`:text` - Text search in narrative
`:not` - Negation
`:above` - Hierarchy above
`:below` - Hierarchy below
`:in` - Code in value set
`:not-in` - Code not in value set
`:of-type` - Type filter for references

Examples:
`GET /Patient?name:exact=Smith`
`GET /Observation?code:text=glucose`
`GET /Patient?active:missing=false`
`GET /Condition?code:not=http://snomed.info/sct|1234`

### SEARCH PREFIXES (for numbers, dates, quantities)

`eq` - Equal (default)
`ne` - Not equal
`gt` - Greater than
`lt` - Less than
`ge` - Greater or equal
`le` - Less or equal
`sa` - Starts after
`eb` - Ends before
`ap` - Approximately

Examples:
`GET /Observation?date=ge2023-01-01`
`GET /Observation?value-quantity=gt100`
`GET /Patient?birthdate=le2000-01-01`

### CHAINING AND REVERSE CHAINING

**Forward chaining (.) - Search through references:**
`GET /Observation?subject.name=Smith`
`GET /DiagnosticReport?result.code=http://loinc.org|789-8`
`GET /Encounter?patient.identifier=12345`

**Reverse chaining (_has) - Find resources that reference this:**
`GET /Patient?_has:Observation:patient:code=http://loinc.org|789-8`
(Find patients who have observations with specific code)

`GET /Patient?_has:Condition:patient:code=http://snomed.info/sct|1234`
(Find patients with specific condition)

### COMPOSITE PARAMETERS

**Multiple values combined:**
`GET /Observation?code-value-quantity=http://loinc.org|8480-6$gt100`
(Blood pressure systolic > 100)

`GET /Observation?component-code-value-quantity=...`
(Component observations)

### HTTP HEADERS

**Request Headers:**

- Authorization: `Bearer [token]`
- Accept: `application/fhir+json (or application/fhir+xml)`
- Content-Type: `application/fhir+json`
- If-Modified-Since: `[date]`
- If-None-Match: `W/"[version]"`
- Prefer: `return=minimal|representation|OperationOutcome`

**Response Headers:**

- Content-Type: application/fhir+json
- ETag: W/"[version]"
- Last-Modified: [date]
- Location: [resource-url] (for creates)

### HTTP STATUS CODES

**Success:**

- `200 OK`: Successful read, search, or update
- `201 Created`: Successful create
- `204 No Content`: Successful delete

**Client Errors:**

- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized for operation
- `404 Not Found`: Resource not found
- `405 Method Not Allowed`: HTTP method not supported
- `409 Conflict`: Version conflict
- `410 Gone`: Resource deleted
- `412 Precondition Failed`: Conditional operation failed
- `422 Unprocessable Entity`: Invalid resource content

**Server Errors:**

- `500 Internal Server Error`: Server error
- `501 Not Implemented`: Operation not supported
- `503 Service Unavailable`: Server temporarily unavailable

## Layout 2

> information layout 2

---

### Base URL

```http
https://launch.smarthealthit.org/v/r4/fhir
```

### Core Operations


| Operation           | Method                | Endpoint                           | Description                      |
| --------------------- | ----------------------- | ------------------------------------ | ---------------------------------- |
| **Read**            | `GET`                 | `/Patient/{id}`                    | Retrieve a resource by ID        |
| **VRead**           | `GET`                 | `/Patient/{id}/_history/{version}` | Retrieve a specific version      |
| **Update**          | `PUT`                 | `/Patient/{id}`                    | Replace an existing resource     |
| **Patch**           | `PATCH`               | `/Patient/{id}`                    | Partial update using JSON Patch  |
| **Delete**          | `DELETE`              | `/Observation/{id}`                | Remove a resource                |
| **Create**          | `POST`                | `/Patient`                         | Create a new resource            |
| **Search (GET)**    | `GET`                 | `/Patient?name=Smith`              | Query resources with parameters  |
| **Search (POST)**   | `POST`                | `/Patient/_search`                 | Complex search via form body     |
| **History**         | `GET`                 | `/Patient/{id}/_history`           | View resource history            |
| **Capabilities**    | `GET`                 | `/metadata`                        | Server capability statement      |
| **Batch**           | `POST`                | `/`                                | Multiple independent operations  |
| **Transaction**     | `POST`                | `/`                                | Atomic bundle operation          |
| **Operations**      | `POST`                | `/Patient/{id}/$everything`        | Named operations                 |
| **Conditional Ops** | `GET/POST/PUT/DELETE` | `/Patient?...`                     | Conditional create/update/delete |

### 🧠 Search Parameters

**Common Filters:**

* `_id`, `_lastUpdated`, `_tag`, `_profile`, `_security`
* `_text`, `_content`, `_list`, `_has`, `_type`

**Result Modifiers:**

* `_sort`, `_count`, `_include`, `_revinclude`
* `_summary`, `_elements`, `_contained`

**Examples:**

```http
GET /Patient?name=Smith&_count=10
GET /Observation?patient=123&category=vital-signs&_sort=-date
GET /Condition?subject=Patient/123&clinical-status=active
```

### Search Modifiers


| Modifier           | Description           |
| -------------------- | ----------------------- |
| `:exact`           | Exact match           |
| `:contains`        | Substring match       |
| `:missing`         | Element presence      |
| `:text`            | Narrative search      |
| `:not`             | Negation              |
| `:above`, `:below` | Hierarchy filters     |
| `:in`, `:not-in`   | ValueSet filters      |
| `:of-type`         | Reference type filter |

**Examples:**

```http
GET /Patient?name:exact=Smith
GET /Observation?code:text=glucose
GET /Patient?active:missing=false
```

### Search Prefixes (Quantities, Dates)


| Prefix | Meaning          |
| -------- | ------------------ |
| `eq`   | Equal            |
| `ne`   | Not equal        |
| `gt`   | Greater than     |
| `lt`   | Less than        |
| `ge`   | Greater or equal |
| `le`   | Less or equal    |
| `sa`   | Starts after     |
| `eb`   | Ends before      |
| `ap`   | Approximately    |

**Examples:**

```http
GET /Observation?date=ge2023-01-01
GET /Observation?value-quantity=gt100
GET /Patient?birthdate=le2000-01-01
```

### Chaining / Reverse Chaining

**Forward Chaining (`.`):**

```http
GET /Observation?subject.name=Smith
GET /Encounter?patient.identifier=12345
```

**Reverse Chaining (`_has`):**

```http
GET /Patient?_has:Observation:patient:code=http://loinc.org|789-8
GET /Patient?_has:Condition:patient:code=http://snomed.info/sct|1234
```

### Composite Parameters

```http
GET /Observation?code-value-quantity=http://loinc.org|8480-6$gt100
GET /Observation?component-code-value-quantity=...
```

### HTTP Headers

**Request:**

* `Authorization: Bearer [token]`
* `Accept: application/fhir+json`
* `Content-Type: application/fhir+json`
* `If-Modified-Since`, `If-None-Match`, `Prefer`

**Response:**

* `Content-Type`, `ETag`, `Last-Modified`, `Location`

### HTTP Status Codes  

| Code             | Meaning          |
| ------------------ | ------------------ |
| `200 OK`         | Success          |
| `201 Created`    | Resource created |
| `204 No Content` | Deleted          |
| `400–422`       | Client errors    |
| `500–503`       | Server errors    |

