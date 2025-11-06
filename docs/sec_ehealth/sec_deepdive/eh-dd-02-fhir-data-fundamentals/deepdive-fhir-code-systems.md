# FHIR Terminology Standards

## Why Terminology Matters

Imagine two hospitals describing the same condition. Hospital A records "DM Type II". Hospital B records "NIDDM". A third writes "Adult-onset diabetes". Without standardized terminology, automated systems can't recognize these as the same diagnosis—interoperability breaks down.

FHIR solves this by mandating standard code systems for clinical concepts. When you see SNOMED code `44054006`, you know it means "Type 2 diabetes mellitus"—regardless of which EHR or country the data came from. This semantic interoperability is what makes SMART apps work globally.

## The Big Four: Core Terminology Systems

### 1. LOINC: The Observation Language

**Full name**: Logical Observation Identifiers Names and Codes  
**Maintained by**: Regenstrief Institute  
**System URI**: `http://loinc.org`  
**What it covers**: Laboratory tests, clinical observations, vital signs, imaging reports, surveys

**Why it exists**: Before LOINC, every lab had its own codes. A glucose test might be "GLU" at one lab, "GLUC" at another, "BLOODSUGAR" at a third. LOINC provides universal identifiers so apps can query "give me all glucose results" regardless of local coding.

**Structure**: Each LOINC code has six parts (axes):

1. **Component**: What's measured (e.g., Glucose, Hemoglobin)
2. **Property**: Kind of quantity (Mass, Volume, Time)
3. **Timing**: When measured (Point in time, 24-hour average)
4. **System**: Where measured (Blood, Urine, Serum)
5. **Scale**: Type of result (Quantitative, Ordinal, Nominal)
6. **Method**: How measured (Enzyme assay, Spectrophotometry) — optional

**Example breakdown**:
```
LOINC 2345-7: Glucose [Mass/volume] in Serum or Plasma
- Component: Glucose
- Property: Mass/volume (concentration)
- Timing: Point in time
- System: Serum or Plasma
- Scale: Quantitative
- Method: (any)
```

**Common LOINC codes you'll encounter**:

**Vital Signs**:

- `8310-5`: Body temperature
- `8867-4`: Heart rate
- `9279-1`: Respiratory rate
- `8480-6`: Systolic blood pressure
- `8462-4`: Diastolic blood pressure
- `85354-9`: Blood pressure panel (contains both systolic and diastolic)
- `8302-2`: Body height
- `29463-7`: Body weight
- `39156-5`: Body mass index (BMI)
- `2710-2`: Oxygen saturation in arterial blood

**Common Labs**:

- `2345-7`: Glucose, serum/plasma
- `4548-4`: Hemoglobin A1c (HbA1c)
- `2093-3`: Total cholesterol
- `2085-9`: HDL cholesterol
- `13457-7`: LDL cholesterol
- `2571-8`: Triglycerides
- `6690-2`: White blood cell count
- `789-8`: Red blood cell count
- `718-7`: Hemoglobin
- `4544-3`: Hematocrit
- `777-3`: Platelet count
- `2160-0`: Creatinine, serum
- `3094-0`: BUN (blood urea nitrogen)
- `1742-6`: ALT (alanine aminotransferase)
- `1920-8`: AST (aspartate aminotransferase)
- `2823-3`: Potassium, serum
- `2951-2`: Sodium, serum

**Social History**:

- `72166-2`: Tobacco smoking status
- `11366-2`: History of tobacco use
- `74013-4`: Alcoholic drinks per day

**Clinical Surveys**:

- `44249-1`: PHQ-9 (depression screening) total score
- `72107-6`: GAD-7 (anxiety) total score
- `38208-5`: Pain severity (0-10 scale)

**In practice**:

```json
{
  "resourceType": "Observation",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "2345-7",
      "display": "Glucose [Mass/volume] in Serum or Plasma"
    }],
    "text": "Glucose"
  },
  "valueQuantity": {
    "value": 95,
    "unit": "mg/dL"
  }
}
```

**Searching for observations by LOINC**:
```http
GET /Observation?code=http://loinc.org|2345-7
```

!!! note "Important"
    LOINC codes can be very specific. Multiple codes might represent "glucose":
    
    - `2345-7`: Glucose in serum/plasma
    - `2339-0`: Glucose in blood
    - `1558-6`: Glucose in urine
    - `15074-8`: Glucose after glucose challenge
    
    Always check the full LOINC name to ensure you're querying the right test.
    
---

### 2. SNOMED CT: The Clinical Terminology

**Full name**: Systematized Nomenclature of Medicine Clinical Terms  
**Maintained by**: SNOMED International  
**System URI**: `http://snomed.info/sct`  
**What it covers**: Diseases, procedures, body structures, organisms, substances, findings—basically everything clinical

**Why it exists**: Medicine needs a controlled vocabulary that's both human-readable and computationally processable. SNOMED provides hierarchical relationships (e.g., "Type 2 diabetes" IS-A "Diabetes mellitus") so apps can reason about concepts.

**Key feature: Hierarchies**  

SNOMED codes form a graph. Example:

```
Disorder (64572001)
 └─ Disease (64572001)
     └─ Endocrine disorder (362969004)
         └─ Diabetes mellitus (73211009)
             ├─ Type 1 diabetes (46635009)
             └─ Type 2 diabetes (44054006)
                 └─ Type 2 diabetes with renal complications (421895002)
```

This lets you search for "any diabetes" by querying the parent concept.

**Common SNOMED codes**:

**Diagnoses**:

- `44054006`: Type 2 diabetes mellitus
- `46635009`: Type 1 diabetes mellitus
- `38341003`: Hypertension
- `49436004`: Atrial fibrillation
- `22298006`: Myocardial infarction (heart attack)
- `195967001`: Asthma
- `13645005`: Chronic obstructive pulmonary disease (COPD)
- `40733004`: Infectious disease
- `74732009`: Mental disorder

**Procedures**:

- `80146002`: Appendectomy
- `232717009`: Coronary artery bypass graft
- `71388002`: Cesarean section
- `387713003`: Surgical procedure
- `225334002`: Rehabilitation therapy

**Body Structures**:

- `80891009`: Heart structure
- `39607008`: Lung structure
- `113257007`: Entire cardiovascular system

**Substances**:

- `387517004`: Metformin (substance)
- `7947003`: Aspirin (substance)

**Clinical Findings**:

- `386661006`: Fever
- `49727002`: Cough
- `271807003`: Skin rash

**In practice** (Condition resource):

```json
{
  "resourceType": "Condition",
  "code": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "44054006",
      "display": "Type 2 diabetes mellitus"
    }],
    "text": "Type 2 Diabetes"
  }
}
```

**Querying with hierarchy** (not all servers support):

```http
GET /Condition?code:below=http://snomed.info/sct|73211009
// Find any type of diabetes
```

!!! note "Important"
    SNOMED has multiple codes for similar concepts. "Acute bronchitis" has different codes for:
    
    - Acute bronchitis (10509002)
    - Acute bronchitis due to virus (195724003)
    - Acute bronchitis due to bacteria (195723009)
    
    Check documentation to understand which level of specificity your app needs.
    
---

### 3. RxNorm: The Medication Code System

**Full name**: RxNorm  
**Maintained by**: U.S. National Library of Medicine  
**System URI**: `http://www.nlm.nih.gov/research/umls/rxnorm`  
**What it covers**: Medications—ingredients, strengths, dose forms, brand names

**Why it exists**: Medications are complex. "Metformin" could mean:

- The ingredient
- 500mg tablets
- 1000mg extended-release tablets
- Combination with sitagliptin (brand name Janumet)

RxNorm provides distinct codes for each level of specificity.

**RxNorm Hierarchy** (Term Types):

- **IN** (Ingredient): Generic name (e.g., Metformin)
- **PIN** (Precise Ingredient): Specific salt form (Metformin hydrochloride)
- **SCDC** (Semantic Clinical Drug Component): Ingredient + strength (Metformin 500mg)
- **SCD** (Semantic Clinical Drug): Ingredient + strength + dose form (Metformin 500mg Oral Tablet)
- **SBD** (Semantic Branded Drug): Brand name version (Glucophage 500mg Oral Tablet)
- **BPCK** (Branded Pack): Specific packaging (Glucophage 500mg 30-count box)

**Common RxNorm codes**:

**Diabetes Medications**:

- `6809`: Metformin (ingredient)
- `860975`: Metformin hydrochloride 500 MG Oral Tablet (SCD)
- `861007`: Metformin hydrochloride 1000 MG Oral Tablet
- `106892`: Glucophage 500 MG Oral Tablet (branded)

**Cardiovascular**:

- `1191`: Aspirin (ingredient)
- `318272`: Aspirin 81 MG Oral Tablet (baby aspirin)
- `197361`: Atorvastatin 20 MG Oral Tablet (Lipitor generic)
- `617311`: Lisinopril 10 MG Oral Tablet

**Antibiotics**:

- `723`: Amoxicillin (ingredient)
- `308182`: Amoxicillin 500 MG Oral Capsule
- `308191`: Amoxicillin 250 MG / Clavulanate 125 MG Oral Tablet (Augmentin generic)

**Pain Management**:

- `161`: Acetaminophen (ingredient)
- `313782`: Acetaminophen 325 MG Oral Tablet
- `7052`: Hydrocodone (ingredient)
- `857001`: Hydrocodone 5 MG / Acetaminophen 325 MG Oral Tablet (Norco/Vicodin generic)

**In practice** (MedicationRequest):

```json
{
  "resourceType": "MedicationRequest",
  "medicationCodeableConcept": {
    "coding": [{
      "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
      "code": "860975",
      "display": "metformin hydrochloride 500 MG Oral Tablet"
    }],
    "text": "Metformin 500mg tablets"
  }
}
```

**Drug interaction checking**: Use RxNorm codes to query drug-drug interaction databases (e.g., "Does aspirin interact with warfarin?").

!!! note "Important"
    RxNorm doesn't include compounded medications, supplements, or devices. For those, use NDC (National Drug Code) or local codes.
    
---

### 4. ICD-10-CM: The Billing Code System

**Full name**: International Classification of Diseases, 10th Revision, Clinical Modification  
**Maintained by**: WHO (ICD-10), CDC (CM modification for US)  
**System URI**: `http://hl7.org/fhir/sid/icd-10-cm` (US)  
**What it covers**: Diagnoses for billing and mortality statistics

**Why it exists**: Healthcare billing requires standardized diagnosis codes. In the US, ICD-10-CM is legally required on insurance claims.

**Key difference from SNOMED**: ICD-10 is designed for billing and statistics, not clinical documentation. Codes are less granular and optimized for reimbursement rules.

**Structure**: Alphanumeric codes with up to 7 characters:

- First character: Letter (category)
- Characters 2-3: Numbers (subcategory)
- Character 4+: Decimal point + specificity

**Examples**:

- `E11`: Type 2 diabetes mellitus (base)
- `E11.9`: Type 2 diabetes without complications
- `E11.65`: Type 2 diabetes with hyperglycemia
- `E11.3211`: Type 2 diabetes with mild nonproliferative diabetic retinopathy without macular edema, right eye

**Common ICD-10-CM codes**:

**Diabetes**:

- `E11.9`: Type 2 diabetes without complications
- `E10.9`: Type 1 diabetes without complications
- `E11.65`: Type 2 diabetes with hyperglycemia
- `E11.22`: Type 2 diabetes with chronic kidney disease

**Cardiovascular**:

- `I10`: Essential (primary) hypertension
- `I21.9`: Acute myocardial infarction, unspecified
- `I48.91`: Atrial fibrillation, unspecified
- `I25.10`: Atherosclerotic heart disease without angina

**Respiratory**:

- `J45.909`: Asthma, unspecified, uncomplicated
- `J44.1`: COPD with acute exacerbation
- `J18.9`: Pneumonia, unspecified

**Symptoms (often used in ER)**:

- `R50.9`: Fever, unspecified
- `R05`: Cough
- `R07.9`: Chest pain, unspecified
- `R10.9`: Abdominal pain, unspecified

**Z-codes (Factors influencing health status)**:

- `Z23`: Encounter for immunization
- `Z00.00`: Encounter for general adult medical examination
- `Z79.4`: Long-term (current) use of insulin

**In practice** (Condition with both SNOMED and ICD-10):

```json
{
  "resourceType": "Condition",
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "44054006",
        "display": "Type 2 diabetes mellitus"
      },
      {
        "system": "http://hl7.org/fhir/sid/icd-10-cm",
        "code": "E11.9",
        "display": "Type 2 diabetes mellitus without complications"
      }
    ],
    "text": "Type 2 Diabetes"
  }
}
```

**Why both?**: SNOMED for clinical accuracy, ICD-10 for billing. Apps should display SNOMED (more readable), but billing systems require ICD-10.

!!! note "Important"
    ICD-10 codes expire annually—codes valid in 2024 might be invalid in 2025. Always check the code's validity date.
    
---

## Other Important Code Systems

### UCUM: Units of Measure

**System URI**: `http://unitsofmeasure.org`  
**What it covers**: Units for quantities (mg, mL, mmHg, °F)
**Common units**:

- Mass: `mg`, `g`, `kg`, `[lb_av]` (pounds)
- Volume: `mL`, `L`, `[foz_us]` (fluid ounces)
- Length: `cm`, `m`, `[in_i]` (inches)
- Temperature: `Cel` (Celsius), `[degF]` (Fahrenheit)
- Pressure: `mm[Hg]` (millimeters of mercury)
- Time: `s` (seconds), `min`, `h`, `d`, `wk`, `mo`, `a` (year)

**In Quantity**:

```json
{
  "valueQuantity": {
    "value": 98.6,
    "unit": "°F",
    "system": "http://unitsofmeasure.org",
    "code": "[degF]"
  }
}
```

---

### NDC: National Drug Code
**System URI**: `http://hl7.org/fhir/sid/ndc`  
**What it covers**: Specific drug products with manufacturer, packaging

**Format**: 10 or 11 digits in segments:

- Labeler (manufacturer): 4-5 digits
- Product: 3-4 digits
- Package: 1-2 digits

**Example**: `0378-1805-10` = Metformin 500mg, 100-count bottle from Mylan

**When to use**: Pharmacy systems prefer NDC over RxNorm. RxNorm is better for clinical decision support.

---

### CVX: Vaccine Codes
**System URI**: `http://hl7.org/fhir/sid/cvx`  
**What it covers**: Vaccines administered

**Common codes**:

- `08`: Hepatitis B vaccine
- `03`: MMR (measles, mumps, rubella)
- `20`: DTaP (diphtheria, tetanus, pertussis)
- `21`: Varicella (chickenpox)
- `141`: Influenza, seasonal
- `207`: COVID-19 (mRNA, Moderna)
- `208`: COVID-19 (mRNA, Pfizer)

**In Immunization**:

```json
{
  "resourceType": "Immunization",
  "vaccineCode": {
    "coding": [{
      "system": "http://hl7.org/fhir/sid/cvx",
      "code": "141",
      "display": "Influenza, seasonal"
    }]
  }
}
```

---

### CPT: Procedure Codes

**System URI**: `http://www.ama-assn.org/go/cpt`  
**What it covers**: Procedures and services for billing (US only)
**Maintained by**: American Medical Association (requires license)
**Common codes**:

- `99213`: Office visit, level 3 (established patient)
- `99215`: Office visit, level 5 (complex)
- `80053`: Comprehensive metabolic panel (lab)
- `93000`: Electrocardiogram (EKG)
- `45378`: Colonoscopy

!!! note "Important"
    CPT codes are copyrighted. Using them in production apps may require licensing fees.
    
    !!! note "Main Topic"
        This is the main content.
    
---

## ValueSets: Curated Code Lists

A **ValueSet** is a collection of codes for a specific purpose. For example, "diabetes medications" might include 50 RxNorm codes.

**Example ValueSet** (simplified):

```json
{
  "resourceType": "ValueSet",
  "url": "http://example.org/ValueSet/diabetes-meds",
  "name": "DiabetesMedications",
  "status": "active",
  "compose": {
    "include": [{
      "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
      "concept": [
        {"code": "6809", "display": "Metformin"},
        {"code": "253182", "display": "Glipizide"},
        {"code": "274783", "display": "Sitagliptin"}
      ]
    }]
  }
}
```

**Expanding a ValueSet**:

```http
GET /ValueSet/diabetes-meds/$expand
```

Returns all 50 codes for easy validation.

**Binding strength**:

- **Required**: Must use a code from this ValueSet
- **Extensible**: Prefer this ValueSet, but can use others if needed
- **Preferred**: Suggested, but not enforced
- **Example**: Just a hint

---

## Searching by Codes: The Patterns

### Exact code match

```http
GET /Observation?code=http://loinc.org|2345-7
```

### Any code in ValueSet

```http
GET /Observation?code:in=http://example.org/ValueSet/diabetes-labs
```

### Code from system (any code)

```http
GET /Observation?code:of-type=http://loinc.org
```

### Text search in code display

```http
GET /Observation?code:text=glucose
```

### Hierarchy search (SNOMED)

```http
GET /Condition?code:below=http://snomed.info/sct|73211009
// Any diabetes subtype
```

---

## Code System Gotchas

### Multiple codes are normal

It's common (and good) to include both SNOMED and ICD-10, or both generic and brand RxNorm codes. Apps should handle multiple codings gracefully.

### Display text varies

Different servers might have slightly different display strings for the same code. Use the `code` for logic, `display` for UI hints, but don't rely on exact display matching.

### Codes change over time

- ICD-10 updates annually
- SNOMED releases twice yearly
- RxNorm updates weekly

Apps should refresh terminology periodically or use a terminology service.

### Not all servers support all systems

Check the server's CapabilityStatement to see which code systems it supports. Some servers only support local codes.

---

## Terminology Services: The $validate-code Operation

FHIR servers can validate codes:

```http
POST /ValueSet/$validate-code
Content-Type: application/fhir+json

{
  "resourceType": "Parameters",
  "parameter": [
    {
      "name": "url",
      "valueUri": "http://example.org/ValueSet/diabetes-meds"
    },
    {
      "name": "code",
      "valueCode": "6809"
    },
    {
      "name": "system",
      "valueUri": "http://www.nlm.nih.gov/research/umls/rxnorm"
    }
  ]
}
```

Response:

```json
{
  "resourceType": "Parameters",
  "parameter": [{
    "name": "result",
    "valueBoolean": true
  }]
}
```

**When to use**: Validating user input (e.g., "Is this a valid LOINC code?") or checking if a code belongs to a specific ValueSet.

---

## Next Steps

Understanding how FHIR uses standard terminologies should naturally get us to explore how *cardinality rules* govern which fields are required vs. optional.