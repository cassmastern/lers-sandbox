# Complete FHIR Resource Example

## Putting It All Together

You've learned about data types, terminology systems, and cardinality rules. Now let's examine a real-world, production-quality Observation resource that demonstrates all these concepts in action.

This isn't a minimal example—it's what you'd actually see from a mature EHR system. We'll dissect each section to show why it's structured this way.

---

## The Scenario

**Patient**: Amy Shaw, a 37-year-old woman with Type 2 diabetes  
**Visit**: Follow-up appointment at Main Street Clinic  
**Lab test**: Hemoglobin A1c (HbA1c), a key diabetes monitoring test  
**Result**: 7.2% (slightly above target range)  
**Clinical significance**: Indicates suboptimal blood sugar control over past 3 months

---

## The Complete Resource

```json
{
  "resourceType": "Observation",
  "id": "hba1c-20241101",
  
  "meta": {
    "versionId": "2",
    "lastUpdated": "2024-11-01T16:45:00.123Z",
    "source": "#lab-system-456",
    "profile": [
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-lab"
    ],
    "tag": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
        "code": "HTEST",
        "display": "test health data"
      }
    ]
  },
  
  "identifier": [
    {
      "use": "official",
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "PLAC",
          "display": "Placer Identifier"
        }]
      },
      "system": "http://hospital.example.org/lab-orders",
      "value": "LAB-ORD-789456",
      "assigner": {
        "display": "Example Hospital Laboratory"
      }
    },
    {
      "use": "official",
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "FILL",
          "display": "Filler Identifier"
        }]
      },
      "system": "http://hospital.example.org/lab-results",
      "value": "LAB-RES-987654",
      "assigner": {
        "display": "Example Hospital Laboratory"
      }
    }
  ],
  
  "basedOn": [
    {
      "reference": "ServiceRequest/lab-order-456",
      "display": "HbA1c lab order from Nov 1 visit"
    }
  ],
  
  "status": "final",
  
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "laboratory",
          "display": "Laboratory"
        },
        {
          "system": "http://hl7.org/fhir/us/core/CodeSystem/us-core-category",
          "code": "laboratory",
          "display": "Laboratory"
        }
      ],
      "text": "Laboratory"
    }
  ],
  
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "4548-4",
        "display": "Hemoglobin A1c/Hemoglobin.total in Blood"
      },
      {
        "system": "http://loinc.org",
        "code": "17856-6",
        "display": "Hemoglobin A1c/Hemoglobin.total in Blood by HPLC"
      }
    ],
    "text": "Hemoglobin A1c"
  },
  
  "subject": {
    "reference": "Patient/smart-1288992",
    "display": "Amy V. Shaw"
  },
  
  "encounter": {
    "reference": "Encounter/smart-enc-456",
    "display": "Office visit, Nov 1, 2024"
  },
  
  "effectiveDateTime": "2024-11-01T09:15:00-05:00",
  
  "issued": "2024-11-01T16:30:00Z",
  
  "performer": [
    {
      "reference": "Organization/example-lab",
      "display": "Example Hospital Laboratory"
    },
    {
      "reference": "Practitioner/lab-tech-123",
      "display": "Sarah Chen, MLT"
    }
  ],
  
  "valueQuantity": {
    "value": 7.2,
    "unit": "%",
    "system": "http://unitsofmeasure.org",
    "code": "%"
  },
  
  "interpretation": [
    {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
        "code": "H",
        "display": "High"
      }],
      "text": "Above target range for diabetic patient"
    }
  ],
  
  "note": [
    {
      "authorReference": {
        "reference": "Practitioner/smart-pract-789",
        "display": "Dr. Sarah Johnson"
      },
      "time": "2024-11-01T17:00:00Z",
      "text": "HbA1c elevated at 7.2%. Discussed medication adjustment with patient. Will increase metformin to 1000mg BID and recheck in 3 months."
    }
  ],
  
  "bodySite": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "87612001",
      "display": "Blood"
    }]
  },
  
  "method": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "702659008",
      "display": "Measurement of hemoglobin A1c by high performance liquid chromatography"
    }],
    "text": "HPLC"
  },
  
  "specimen": {
    "reference": "Specimen/blood-sample-456",
    "display": "Venous blood, collected Nov 1, 2024 09:15 AM"
  },
  
  "referenceRange": [
    {
      "low": {
        "value": 4.0,
        "unit": "%",
        "system": "http://unitsofmeasure.org",
        "code": "%"
      },
      "high": {
        "value": 5.6,
        "unit": "%",
        "system": "http://unitsofmeasure.org",
        "code": "%"
      },
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/referencerange-meaning",
          "code": "normal",
          "display": "Normal Range"
        }],
        "text": "Normal (non-diabetic)"
      },
      "text": "Normal range for non-diabetic adults"
    },
    {
      "high": {
        "value": 7.0,
        "unit": "%",
        "system": "http://unitsofmeasure.org",
        "code": "%"
      },
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/referencerange-meaning",
          "code": "treatment",
          "display": "Treatment Target Range"
        }],
        "text": "Diabetic target"
      },
      "appliesTo": [{
        "coding": [{
          "system": "http://snomed.info/sct",
          "code": "44054006",
          "display": "Diabetes mellitus type 2"
        }],
        "text": "Applies to patients with Type 2 Diabetes"
      }],
      "text": "ADA target for most diabetic adults: <7.0%"
    }
  ]
}
```

---

## Detailed Breakdown

### 1. Resource Identity and Metadata

```json
"resourceType": "Observation",
"id": "hba1c-20241101",
```

- **`resourceType`**: Always required. Identifies this as an Observation.
- **`id`**: Server-assigned logical ID. Used in URLs: `/Observation/hba1c-20241101`.

```json
"meta": {
  "versionId": "2",
  "lastUpdated": "2024-11-01T16:45:00.123Z",
  "source": "#lab-system-456",
  "profile": [
    "http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-lab"
  ]
}
```

- **`versionId`**: This is version 2 (was updated after initial creation). Used for optimistic locking.
- **`lastUpdated`**: Timestamp with millisecond precision. Tracks when resource last changed.
- **`source`**: Identifies originating system (lab interface engine).
- **`profile`**: Declares conformance to US Core Lab Observation profile (stricter rules than base FHIR).

**Why version tracking matters**: If two users edit simultaneously, the server rejects the second update if `versionId` doesn't match current version.

---

### 2. Business Identifiers

```json
"identifier": [
  {
    "use": "official",
    "type": {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
        "code": "PLAC",
        "display": "Placer Identifier"
      }]
    },
    "system": "http://hospital.example.org/lab-orders",
    "value": "LAB-ORD-789456",
    "assigner": {
      "display": "Example Hospital Laboratory"
    }
  },
  {
    "type": {
      "coding": [{
        "code": "FILL",
        "display": "Filler Identifier"
      }]
    },
    "system": "http://hospital.example.org/lab-results",
    "value": "LAB-RES-987654"
  }
]
```

**Two identifiers present**:
1. **PLAC (Placer ID)**: The order number from the ordering system (EHR).
2. **FILL (Filler ID)**: The result number from the performing system (lab).

**Why both?**: Enables bidirectional tracking:
- EHR can find result: "Show me result for order LAB-ORD-789456"
- Lab can cross-reference: "This result LAB-RES-987654 fulfills order LAB-ORD-789456"

**Use case**: If the result interface fails mid-transmission, the receiving system can detect duplicates using FILL identifier.

---

### 3. Order Context

```json
"basedOn": [
  {
    "reference": "ServiceRequest/lab-order-456",
    "display": "HbA1c lab order from Nov 1 visit"
  }
]
```

- **`basedOn`**: Links result back to the original order (ServiceRequest resource).
- **Why it matters**: 
  - Clinicians can see who ordered the test and why
  - Billing systems link results to orders for claim submission
  - Quality measures track order-to-result turnaround time

---

### 4. Status and Category

```json
"status": "final",

"category": [
  {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
        "code": "laboratory",
        "display": "Laboratory"
      }
    ],
    "text": "Laboratory"
  }
]
```

- **`status: "final"`**: Result is verified and actionable. Alternatives: `preliminary` (pending confirmation), `amended` (corrected after final).
- **`category`**: Classifies observation type. Labs are filtered separately from vitals in most UIs.

**Multiple categories possible**: A result could be both `laboratory` and `vital-signs` (e.g., point-of-care glucose).

---

### 5. What Was Measured (The Code)

```json
"code": {
  "coding": [
    {
      "system": "http://loinc.org",
      "code": "4548-4",
      "display": "Hemoglobin A1c/Hemoglobin.total in Blood"
    },
    {
      "system": "http://loinc.org",
      "code": "17856-6",
      "display": "Hemoglobin A1c/Hemoglobin.total in Blood by HPLC"
    }
  ],
  "text": "Hemoglobin A1c"
}
```

**Two LOINC codes included**:
1. **`4548-4`**: Generic HbA1c code (any method).
2. **`17856-6`**: Method-specific code (HPLC assay).

**Why both?**: 
- Apps searching for "any HbA1c" use `4548-4`.
- Research studies requiring specific methodology use `17856-6`.

**Best practice**: Include both generic and specific codes when available.

---

### 6. Patient and Encounter Context

```json
"subject": {
  "reference": "Patient/smart-1288992",
  "display": "Amy V. Shaw"
},

"encounter": {
  "reference": "Encounter/smart-enc-456",
  "display": "Office visit, Nov 1, 2024"
}
```

- **`subject`**: Required in US Core. Identifies the patient.
- **`encounter`**: Links result to specific visit. Critical for:
  - Chart review (show results from this visit)
  - Billing (associate lab fees with encounter)
  - Clinical decision support (new HbA1c during encounter triggers alerts)

---

### 7. Timing Information

```json
"effectiveDateTime": "2024-11-01T09:15:00-05:00",
"issued": "2024-11-01T16:30:00Z",
```

**Two timestamps**:
- **`effectiveDateTime`**: When blood was drawn (9:15 AM Eastern Time).
- **`issued`**: When result became available (4:30 PM UTC = 12:30 PM Eastern).

**Why the delay?**: Lab processing takes time. HbA1c requires specialized equipment.

**Timezone handling**:
- `effectiveDateTime` has local timezone offset (`-05:00` = Eastern Standard Time).
- `issued` is in UTC (`Z`).
- Apps should display both in user's local time.

---

### 8. Who Performed the Test

```json
"performer": [
  {
    "reference": "Organization/example-lab",
    "display": "Example Hospital Laboratory"
  },
  {
    "reference": "Practitioner/lab-tech-123",
    "display": "Sarah Chen, MLT"
  }
]
```

**Array with two performers**:
1. **Organization**: The lab department (for institutional accountability).
2. **Practitioner**: The specific technician (for quality tracking).

**Use cases**:
- Lab director reviews technician's accuracy rates
- Accreditation audits track which staff performed which tests
- Liability investigations identify responsible parties

---

### 9. The Result Value

```json
"valueQuantity": {
  "value": 7.2,
  "unit": "%",
  "system": "http://unitsofmeasure.org",
  "code": "%"
}
```

- **Quantity type**: Numeric result with unit.
- **UCUM code**: `%` (percentage). Always include `system` URL for semantic interoperability.

**Interpretation logic**:
```javascript
if (obs.valueQuantity.value > 7.0) {
  alert("HbA1c above target for diabetic patient");
}
```

---

### 10. Clinical Interpretation

```json
"interpretation": [
  {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
      "code": "H",
      "display": "High"
    }],
    "text": "Above target range for diabetic patient"
  }
]
```

- **Standard code `H`**: Machine-readable "high" flag.
- **Custom text**: Human-readable context specific to this patient.

**Use case**: Apps display a red "High" indicator based on the `H` code, but show the custom text on hover/click.

---

### 11. Clinical Notes

```json
"note": [
  {
    "authorReference": {
      "reference": "Practitioner/smart-pract-789",
      "display": "Dr. Sarah Johnson"
    },
    "time": "2024-11-01T17:00:00Z",
    "text": "HbA1c elevated at 7.2%. Discussed medication adjustment with patient. Will increase metformin to 1000mg BID and recheck in 3 months."
  }
]
```

- **Structured annotation**: Who wrote what, when.
- **Clinical context**: Documents physician's response to result.

**Best practice**: Include `authorReference` and `time` so audit trails are complete.

---

### 12. Body Site and Method

```json
"bodySite": {
  "coding": [{
    "system": "http://snomed.info/sct",
    "code": "87612001",
    "display": "Blood"
  }]
},

"method": {
  "coding": [{
    "system": "http://snomed.info/sct",
    "code": "702659008",
    "display": "Measurement of hemoglobin A1c by high performance liquid chromatography"
  }],
  "text": "HPLC"
}
```

- **`bodySite`**: Where sample came from (blood, not tissue or urine).
- **`method`**: How test was performed (HPLC = gold standard).

**Clinical relevance**: Different methods (HPLC vs. immunoassay) can yield slightly different results. Documenting method enables comparison across labs.

---

### 13. Specimen Tracking

```json
"specimen": {
  "reference": "Specimen/blood-sample-456",
  "display": "Venous blood, collected Nov 1, 2024 09:15 AM"
}
```

**Links to Specimen resource** containing:
- Collection time (matches `effectiveDateTime`)
- Collection method (venipuncture)
- Container type (lavender-top tube)
- Handling notes (kept at room temperature)

**Use case**: If result is questioned, lab can trace back to specific specimen, collection conditions, and handling.

---

### 14. Reference Ranges (The Key Part!)

```json
"referenceRange": [
  {
    "low": {"value": 4.0, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%"},
    "high": {"value": 5.6, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%"},
    "type": {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/referencerange-meaning",
        "code": "normal",
        "display": "Normal Range"
      }],
      "text": "Normal (non-diabetic)"
    },
    "text": "Normal range for non-diabetic adults"
  },
  {
    "high": {"value": 7.0, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%"},
    "type": {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/referencerange-meaning",
        "code": "treatment",
        "display": "Treatment Target Range"
      }],
      "text": "Diabetic target"
    },
    "appliesTo": [{
      "coding": [{
        "system": "http://snomed.info/sct",
        "code": "44054006",
        "display": "Diabetes mellitus type 2"
      }],
      "text": "Applies to patients with Type 2 Diabetes"
    }],
    "text": "ADA target for most diabetic adults: <7.0%"
  }
]
```

**Two reference ranges**:

**Range 1: Normal (non-diabetic)**
- 4.0–5.6%
- Type: `normal` (physiologic range for healthy people)

**Range 2: Treatment target (diabetic)**
- <7.0%
- Type: `treatment` (therapeutic goal)
- **`appliesTo`**: Only applies to patients with diabetes (SNOMED code `44054006`)

**Why two ranges?**: 
- Amy's value (7.2%) is normal for a healthy person (within 4.0–5.6% is false—it's actually above).
- But for a diabetic patient, 7.2% indicates suboptimal control (target <7.0%).

**Clinical decision support logic**:
```javascript
function interpretHbA1c(obs, patient) {
  const value = obs.valueQuantity.value;
  const hasDiabetes = patient.conditions.some(c => 
    c.code.coding.some(code => code.code === "44054006")
  );
  
  if (hasDiabetes) {
    const diabeticTarget = obs.referenceRange.find(r => 
      r.type.coding.some(t => t.code === "treatment")
    );
    if (value > diabeticTarget.high.value) {
      return {
        alert: true,
        message: "HbA1c above target. Consider medication adjustment."
      };
    }
  } else {
    const normalRange = obs.referenceRange.find(r => 
      r.type.coding.some(t => t.code === "normal")
    );
    if (value > normalRange.high.value) {
      return {
        alert: true,
        message: "HbA1c elevated. Screen for diabetes."
      };
    }
  }
  
  return {alert: false, message: "Within target range."};
}
```

---

## Key Takeaways

### 1. Redundancy is Intentional
- Multiple LOINC codes (generic + specific)
- Multiple identifiers (placer + filler)
- Multiple reference ranges (normal + treatment)

This redundancy enables diverse use cases without requiring every consumer to understand every nuance.

### 2. Context is King
- Who ordered? (`basedOn`)
- Who performed? (`performer`)
- When was sample taken vs. result available? (`effectiveDateTime` vs. `issued`)
- Why was it done? (referenced Encounter links to visit reason)

Without context, a result is just a number.

### 3. Profiles Add Rigor
Base FHIR allows HbA1c Observations with no `subject` or `status`. US Core Profile makes these required. Always check which profile you're conforming to.

### 4. Semantic Interoperability is the Goal
Using standard codes (LOINC, SNOMED, UCUM) means apps in Boston and London can both recognize "HbA1c 7.2%" as the same clinical concept, even if they've never seen each other's data before.

---

## Next Steps

This completes the FHIR Data Fundamentals section. We covered:

- ✅ Data types (primitives, complex types, polymorphism)
- ✅ Terminology systems (LOINC, SNOMED, RxNorm, ICD-10)
- ✅ Cardinality rules (required vs. optional, single vs. array)
- ✅ Complete resource structure (real-world example with all pieces)

Next, we'll look at how resources connect to each other through *references* and *bundles*.