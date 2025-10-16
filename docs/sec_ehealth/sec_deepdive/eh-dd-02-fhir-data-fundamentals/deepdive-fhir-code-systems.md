# Common FHIR Code Systems

## FHIR Terminology Standards

**LOINC (Logical Observation Identifiers Names and Codes)**  
System: [http://loinc.org](http://loinc.org)  
Used for: Laboratory tests, clinical observations, vital signs  
Examples:  
- 8302-2: Body height  
- 29463-7: Body weight  
- 85354-9: Blood pressure panel  
- 8867-4: Heart rate  
- 8310-5: Body temperature  

**SNOMED CT (Systematized Nomenclature of Medicine Clinical Terms)**  
System: [http://snomed.info/sct](http://snomed.info/sct)  
Used for: Clinical findings, procedures, body structures, organisms  
Examples:  
- 38341003: Hypertension  
- 73211009: Diabetes mellitus  
- 413839001: Chronic lung disease  
- 195967001: Asthma  

**RxNorm**  
System: [http://www.nlm.nih.gov/research/umls/rxnorm](http://www.nlm.nih.gov/research/umls/rxnorm)  
Used for: Medications and drug names  
Examples:  
- 308136: Lisinopril  
- 197361: Metformin  
- 1156972: Atorvastatin 20 MG Oral Tablet  

**ICD-10-CM (International Classification of Diseases, 10th Revision)**  
System: http://hl7.org/fhir/sid/icd-10-cm  
Used for: Diagnoses and procedures (billing/administrative)  
Examples:  
- I10: Essential (primary) hypertension  
- E11.9: Type 2 diabetes mellitus without complications  
- J45.909: Unspecified asthma, uncomplicated  

**CPT (Current Procedural Terminology)**  
System: http://www.ama-assn.org/go/cpt  
Used for: Procedures, services (billing)  
Examples:  
- 99213: Office visit, established patient  
- 80053: Comprehensive metabolic panel  

**CVX (Vaccine Administered)**  
System: [http://hl7.org/fhir/sid/cvx](http://hl7.org/fhir/sid/cvx)  
Used for: Immunization vaccines  
Examples:  
- 08: Hepatitis B vaccine  
- 21: Varicella vaccine  
- 141: Influenza vaccine  

**UCUM (Unified Code for Units of Measure)**  
System: [http://unitsofmeasure.org](http://unitsofmeasure.org)  
Used for: Units in quantities  
Examples:  
- kg: kilogram  
- cm: centimeter  
- mg/dL: milligrams per deciliter  
- mmHg: millimeter of mercury  
- %: percent  

**NDC (National Drug Code)**  
System: [http://hl7.org/fhir/sid/ndc](http://hl7.org/fhir/sid/ndc)  
Used for: Drug product identification (US)  
Example:  
- 00093-0058: Specific drug package  

**HL7 V3 Code Systems**
System: [http://terminology.hl7.org/CodeSystem/](http://terminology.hl7.org/CodeSystem/)  
Used for: FHIR-specific administrative codes  
Examples:  
- observation-category: vital-signs, laboratory, survey  
- condition-clinical: active, inactive, resolved  
- medication-request-intent: proposal, plan, order  
- encounter-status: planned, arrived, in-progress  

**FHIR Value Sets**
Curated collections of codes from various systems  
Examples:  
- observation-status: registered, preliminary, final  
- administrative-gender: male, female, other, unknown  
- marital-status: married, single, divorced, widowed  
