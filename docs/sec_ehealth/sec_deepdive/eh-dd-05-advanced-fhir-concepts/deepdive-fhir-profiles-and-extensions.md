# FHIR Profiles and Extensions

## FHIR Profiles 

A Profile is a set of constraints on a base FHIR resource that:  
- Restricts cardinality (e.g., required elements)  
- Constrains data types  
- Specifies value sets for coded elements  
- Adds extensions  
- Provides additional documentation  

### Common Profile Types

**US Core Profiles (US realm)**  
- http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient  
- http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-lab  
- http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition  
- http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest  

**International Patient Summary (IPS)**  
- http://hl7.org/fhir/uv/ips/StructureDefinition/Patient-uv-ips  
- http://hl7.org/fhir/uv/ips/StructureDefinition/Observation-results-uv-ips  

**SMART App Launch Profiles**  
- http://hl7.org/fhir/smart-app-launch/StructureDefinition/patient-access-brands  


### Declaring Profile Conformance  

In resource meta element:  

```json
{
  "resourceType": "Patient",
  "meta": {
    "profile": [
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"
    ]
  },
  ...
}
```

### Searching by Profile  

```http
GET /Patient?_profile=http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient
```

## FHIR Extensions  

Extensions add additional data elements not in base FHIR specification.  

### Extension Structure

```json
{
  "extension": [
    {
      "url": "http://example.org/fhir/StructureDefinition/patient-ethnicity",
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v3-Ethnicity",
            "code": "2135-2",
            "display": "Hispanic or Latino"
          }
        ]
      }
    }
  ]
}
```

### Types of Extensions  

#### Simple Extensions (primitive value)  

```json
{
  "url": "http://example.org/favorite-color",
  "valueString": "blue"
}
```

#### Complex Extensions (nested)

```json
{
  "url": "http://example.org/complex-data",
  "extension": [
    {
      "url": "component1",
      "valueString": "value1"
    },
    {
      "url": "component2",
      "valueInteger": 42
    }
  ]
}
```

#### Modifier Extensions (change meaning)  

```json
{
  "modifierExtension": [
    {
      "url": "http://example.org/not-performed",
      "valueBoolean": true
    }
  ]
}
```

#### Common US Core Extensions

**Race**:  

```json
{
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
  ]
}
```

**Ethnicity**:  

```json
{
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
  ]
}
```

**Birth Sex**:  

```json
{
  "extension": [
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex",
      "valueCode": "F"
    }
  ]
}
```


## MUST Support  

Elements marked as "Must Support" in profiles mean:  
- Systems must be able to store and retrieve the element  
- If data is available, it should be populated  
- Receiving systems must process the element meaningfully  

Example US Core Patient Must Support Elements:  
- identifier (at least one)  
- name (at least one)  
- gender  
- race extension  
- ethnicity extension  

## Slicing  

Slicing divides arrays into constrained subsets.  

Example - Observation with multiple components:

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
      "valueQuantity": { "value": 120 }
    },
    {
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8462-4"
        }]
      },
      "valueQuantity": { "value": 80 }
    }
  ]
}
```

Profile can define:  
- "systolic" slice: component where code = 8480-6  
- "diastolic" slice: component where code = 8462-4  


## Capability Statement  

Servers declare their capabilities via `CapabilityStatement`:  

```http
GET /metadata

Response includes:
- Supported resources
- Supported operations (read, search, create, update, delete)
- Supported search parameters
- Supported profiles
- Security requirements
- Format support (JSON, XML)
```


Example snippet:  

```json
{
  "resourceType": "CapabilityStatement",
  "status": "active",
  "date": "2024-01-01",
  "kind": "instance",
  "fhirVersion": "4.0.1",
  "format": ["json", "xml"],
  "rest": [
    {
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
        }]
      },
      "resource": [
        {
          "type": "Patient",
          "profile": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
          "interaction": [
            { "code": "read" },
            { "code": "search-type" }
          ],
          "searchParam": [
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "birthdate",
              "type": "date"
            }
          ]
        }
      ]
    }
  ]
}
```