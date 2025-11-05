# Overview of SMART-on-FHIR

SMART (Substitutable Medical Applications, Reusable Technologies) on FHIR is an open standard that enables third-party applications to integrate with Electronic Health Record (EHR) systems using the HL7 FHIR (Fast Healthcare Interoperability Resources) specification.

# Overview of SMART-on-FHIR

## What Problem Does SMART-on-FHIR Solve?

Imagine you're a clinician using an Electronic Health Record (EHR) system. You need a specialized tool—maybe a risk calculator, a genomics visualizer, or a patient engagement app. Traditionally, this meant waiting months (or years) for your EHR vendor to build and integrate it. Even then, the app would be locked to that specific vendor's ecosystem.

SMART-on-FHIR changes this fundamentally. It's an open standard that lets third-party applications integrate with *any* EHR system that supports it, without custom integration work for each vendor. Think of it as the "app store model" for healthcare: developers build once, deploy everywhere.

## The Two Pillars: FHIR + SMART

SMART-on-FHIR stands on two complementary standards:

### FHIR: The Language of Healthcare Data

**FHIR** (Fast Healthcare Interoperability Resources) is HL7's modern data standard. Unlike its predecessors (HL7 v2, v3, CDA), FHIR is:
- **RESTful**: Uses familiar HTTP verbs (GET, POST, PUT, DELETE) and JSON/XML
- **Resource-based**: Data is structured as discrete, composable "resources" (Patient, Observation, Medication, etc.)
- **Web-native**: Built for modern web technologies, not legacy messaging systems

FHIR solves the "what" problem: *What does healthcare data look like, and how do I exchange it?*

### SMART: The Security and Authorization Layer

**SMART** (Substitutable Medical Applications, Reusable Technologies) adds security and context to FHIR. It defines:
- **OAuth 2.0-based authorization**: How apps obtain permission to access patient data
- **Launch contexts**: How apps know *which* patient or encounter they're working with
- **Scopes**: Granular permissions (e.g., "read patient demographics" vs. "write prescriptions")

SMART solves the "how" and "who" problems: *How does an app authenticate? Who has access to what?*

## Real-World Example: A Cardiac Risk Calculator

Let's make this concrete. A cardiologist wants to use a third-party app that calculates 10-year cardiovascular risk. Here's what happens:

1. **Launch**: The clinician clicks a button in their EHR. The EHR redirects to the risk calculator app with a SMART launch URL.
2. **Authorization**: The app uses OAuth 2.0 to request access to the patient's observations and conditions. The EHR prompts: "Allow CardioRisk to read vitals and lab results?"
3. **Data Access**: Once authorized, the app uses FHIR APIs to fetch:
   - Blood pressure readings (`Observation` resources with LOINC code `85354-9`)
   - Cholesterol levels (`Observation` with LOINC `2093-3`)
   - Smoking status (`Observation` with LOINC `72166-2`)
   - Diabetes diagnosis (`Condition` with SNOMED code `44054006`)
4. **Calculation**: The app computes the risk score using this real, current data—no manual entry needed.
5. **Integration**: The result can optionally be written back to the EHR as a new `Observation` resource.

**Key insight**: The app works identically whether the EHR is Epic, Cerner, Allscripts, or any FHIR-compliant system. No custom code per vendor.

## Why This Matters

### For Developers
- **Write once, run anywhere**: Build apps that work across EHR vendors
- **Modern tooling**: Use standard web technologies (JavaScript, React, REST APIs)
- **Faster innovation**: Deploy without waiting for vendor approval cycles

### For Clinicians
- **Best-of-breed tools**: Choose specialized apps without vendor lock-in
- **Seamless workflow**: Apps launch within the EHR context, no context switching
- **Real-time data**: No copy-pasting vitals or lab results

### For Healthcare Organizations
- **Interoperability**: Move data between systems reliably
- **Reduced vendor dependence**: Negotiate better contracts when you're not locked in
- **Faster digital transformation**: Adopt new capabilities without rip-and-replace

## The SMART App Landscape

Today, thousands of SMART apps exist across domains:
- **Clinical decision support**: Risk calculators, drug interaction checkers
- **Population health**: Registries, quality measure tracking
- **Patient engagement**: Portals, remote monitoring dashboards
- **Research**: Cohort identification, data collection tools
- **Billing and operations**: Prior authorization, claims management

Examples include:
- **CDS Hooks**: Real-time clinical decision support alerts
- **Substitutable apps**: Apps patients can swap (e.g., choosing between diabetes management apps)
- **Bulk data tools**: Population-level analytics over millions of records

## What You'll Learn in This Deep Dive

This section will take you from concepts to code. By the end, you'll understand:

1. **FHIR fundamentals**: Resources, data types, terminology systems
2. **Resource relationships**: How Patients, Observations, and Conditions connect
3. **FHIR REST APIs**: Searching, filtering, and manipulating data
4. **SMART authorization**: OAuth flows, scopes, and launch contexts
5. **Hands-on practice**: Building and testing a real SMART app against a public sandbox

We'll use concrete examples throughout, referencing actual FHIR resources from the [SMART Health IT sandbox](https://launch.smarthealthit.org). You'll see how everything ties together—not just theory, but working code you can run and modify.

## Prerequisites

To get the most from this deep dive, you should have:
- Basic understanding of REST APIs and JSON
- Familiarity with OAuth 2.0 concepts (authorization codes, access tokens)
- Comfort reading JavaScript or Python code (examples will use both)

No prior healthcare IT experience required—we'll explain the clinical concepts as we go.

## Next Steps

Ready to dive in? Let's start with the architecture that makes all this possible.