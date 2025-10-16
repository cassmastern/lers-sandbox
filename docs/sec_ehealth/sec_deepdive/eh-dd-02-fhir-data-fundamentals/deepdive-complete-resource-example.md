# Complete Example Resource

## Complete FHIR Resource Example

```json
{
  "resourceType": "Patient",
  "id": "example-patient-001",
  "meta": {
    "versionId": "3",
    "lastUpdated": "2024-10-15T10:30:00Z",
    "profile": [
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"
    ],
    "tag": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
        "code": "HTEST",
        "display": "test health data"
      }
    ]
  },
  "text": {
    "status": "generated",
    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">John Smith, Male, DOB: 1987-02-20</div>"
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
          "url": "text",
          "valueString": "White"
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
      "valueCode": "M"
    }
  ],
  "identifier": [
    {
      "use": "usual",
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "MR",
            "display": "Medical Record Number"
          }
        ]
      },
      "system": "http://hospital.smarthealthit.org",
      "value": "MRN123456",
      "period": {
        "start": "2020-01-01"
      },
      "assigner": {
        "display": "Smart Health IT Hospital"
      }
    },
    {
      "use": "official",
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "SS",
            "display": "Social Security Number"
          }
        ]
      },
      "system": "http://hl7.org/fhir/sid/us-ssn",
      "value": "123-45-6789"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "family": "Smith",
      "given": [
        "John",
        "Robert"
      ],
      "prefix": [
        "Mr."
      ],
      "period": {
        "start": "1987-02-20"
      }
    },
    {
      "use": "nickname",
      "given": [
        "Johnny"
      ]
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "+1-555-123-4567",
      "use": "home",
      "rank": 1
    },
    {
      "system": "phone",
      "value": "+1-555-987-6543",
      "use": "mobile",
      "rank": 2
    },
    {
      "system": "email",
      "value": "john.smith@example.com",
      "use": "home"
    }
  ],
  "gender": "male",
  "birthDate": "1987-02-20",
  "deceasedBoolean": false,
  "address": [
    {
      "use": "home",
      "type": "both",
      "line": [
        "123 Main Street",
        "Apartment 4B"
      ],
      "city": "Boston",
      "state": "MA",
      "postalCode": "02101",
      "country": "USA",
      "period": {
        "start": "2020-01-01"
      }
    }
  ],
  "maritalStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
        "code": "M",
        "display": "Married"
      }
    ]
  },
  "multipleBirthBoolean": false,
  "contact": [
    {
      "relationship": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
              "code": "C",
              "display": "Emergency Contact"
            }
          ]
        },
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
              "code": "WIFE",
              "display": "Wife"
            }
          ]
        }
      ],
      "name": {
        "use": "official",
        "family": "Smith",
        "given": [
          "Jane"
        ]
      },
      "telecom": [
        {
          "system": "phone",
          "value": "+1-555-234-5678",
          "use": "mobile"
        }
      ],
      "address": {
        "use": "home",
        "line": [
          "123 Main Street",
          "Apartment 4B"
        ],
        "city": "Boston",
        "state": "MA",
        "postalCode": "02101",
        "country": "USA"
      }
    }
  ],
  "communication": [
    {
      "language": {
        "coding": [
          {
            "system": "urn:ietf:bcp:47",
            "code": "en-US",
            "display": "English (United States)"
          }
        ]
      },
      "preferred": true
    },
    {
      "language": {
        "coding": [
          {
            "system": "urn:ietf:bcp:47",
            "code": "es",
            "display": "Spanish"
          }
        ]
      },
      "preferred": false
    }
  ],
  "generalPractitioner": [
    {
      "reference": "Practitioner/example-practitioner-001",
      "display": "Dr. Sarah Johnson"
    }
  ],
  "managingOrganization": {
    "reference": "Organization/example-org-001",
    "display": "Smart Health IT Hospital"
  },
  "link": [
    {
      "other": {
        "reference": "Patient/example-patient-002"
      },
      "type": "seealso"
    }
  ]
}
```