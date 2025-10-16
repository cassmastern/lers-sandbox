# FHIR Comprehensive Resource Relationships

## Comprehensive Diagram of FHIR Resource Relationships

### Diagram (version 1)  

```mermaid
graph TD
    Patient[Patient]
    Practitioner[Practitioner]
    PractitionerRole[PractitionerRole]
    Organization[Organization]
    Location[Location]
  
    Encounter[Encounter]
    Condition[Condition]
    Observation[Observation]
    Procedure[Procedure]
  
    MedicationRequest[MedicationRequest]
    Medication[Medication]
    MedicationDispense[MedicationDispense]
    MedicationAdministration[MedicationAdministration]
  
    AllergyIntolerance[AllergyIntolerance]
    Immunization[Immunization]
  
    DiagnosticReport[DiagnosticReport]
    Specimen[Specimen]
  
    CarePlan[CarePlan]
    Goal[Goal]
    ServiceRequest[ServiceRequest]
  
    DocumentReference[DocumentReference]
    Composition[Composition]
  
    Appointment[Appointment]
    Slot[Slot]
    Schedule[Schedule]
  
    Coverage[Coverage]
    Claim[Claim]
    ExplanationOfBenefit[ExplanationOfBenefit]
  
    Patient -->|subject| Encounter
    Patient -->|subject| Condition
    Patient -->|subject| Observation
    Patient -->|subject| Procedure
    Patient -->|subject| MedicationRequest
    Patient -->|patient| AllergyIntolerance
    Patient -->|patient| Immunization
    Patient -->|subject| DiagnosticReport
    Patient -->|subject| CarePlan
    Patient -->|subject| Goal
    Patient -->|subject| DocumentReference
    Patient -->|actor| Appointment
    Patient -->|beneficiary| Coverage
  
    Practitioner -->|practitioner| PractitionerRole
    Organization -->|organization| PractitionerRole
    Location -->|location| PractitionerRole
  
    PractitionerRole -->|participant| Encounter
    PractitionerRole -->|performer| Procedure
    PractitionerRole -->|requester| MedicationRequest
    PractitionerRole -->|performer| Observation
    PractitionerRole -->|asserter| Condition
    PractitionerRole -->|actor| Appointment
  
    Organization -->|managingOrganization| Patient
    Organization -->|serviceProvider| Encounter
  
    Location -->|location| Encounter
  
    Encounter -->|encounter| Condition
    Encounter -->|encounter| Observation
    Encounter -->|encounter| Procedure
    Encounter -->|encounter| MedicationRequest
    Encounter -->|encounter| DiagnosticReport
  
    Condition -->|evidence| Observation
    Condition -->|addresses| CarePlan
  
    MedicationRequest -->|medication| Medication
    MedicationRequest -->|basedOn| CarePlan
    MedicationDispense -->|medication| Medication
    MedicationDispense -->|authorizingPrescription| MedicationRequest
    MedicationAdministration -->|medication| Medication
    MedicationAdministration -->|request| MedicationRequest
  
    DiagnosticReport -->|result| Observation
    DiagnosticReport -->|specimen| Specimen
    DiagnosticReport -->|basedOn| ServiceRequest
  
    Observation -->|specimen| Specimen
    Observation -->|basedOn| ServiceRequest
  
    CarePlan -->|goal| Goal
    CarePlan -->|activity| ServiceRequest
  
    ServiceRequest -->|subject| Patient
    ServiceRequest -->|requester| PractitionerRole
  
    DocumentReference -->|subject| Patient
    DocumentReference -->|context| Encounter
  
    Composition -->|subject| Patient
    Composition -->|encounter| Encounter
    Composition -->|author| PractitionerRole
  
    Appointment -->|slot| Slot
    Slot -->|schedule| Schedule
    Schedule -->|actor| PractitionerRole
    Schedule -->|actor| Location
  
    Claim -->|patient| Patient
    Claim -->|provider| PractitionerRole
    ExplanationOfBenefit -->|patient| Patient
    ExplanationOfBenefit -->|claim| Claim
    Coverage -->|payor| Organization
```

### Diagram (version 2)  

```puml
@startuml FHIR_Resource_Relationships
' Diagram: FHIR Resource Relationship Map

hide circle
skinparam linetype ortho
skinparam entity {
  BackgroundColor White
  BorderColor Black
  FontSize 11
}

' Core Actors
entity Patient
entity Practitioner
entity PractitionerRole
entity Organization
entity Location

' Clinical Events
entity Encounter
entity Condition
entity Observation
entity Procedure

' Medications
entity MedicationRequest
entity Medication
entity MedicationDispense
entity MedicationAdministration

' Immunization & Allergies
entity AllergyIntolerance
entity Immunization

' Diagnostics
entity DiagnosticReport
entity Specimen

' Care Planning
entity CarePlan
entity Goal
entity ServiceRequest

' Documentation
entity DocumentReference
entity Composition

' Scheduling
entity Appointment
entity Slot
entity Schedule

' Financials
entity Coverage
entity Claim
entity ExplanationOfBenefit

' Relationships (directional, editorially tagged)
Patient --> Encounter : subject
Patient --> Condition : subject
Patient --> Observation : subject
Patient --> Procedure : subject
Patient --> MedicationRequest : subject
Patient --> AllergyIntolerance : patient
Patient --> Immunization : patient
Patient --> DiagnosticReport : subject
Patient --> CarePlan : subject
Patient --> Goal : subject
Patient --> DocumentReference : subject
Patient --> Appointment : actor
Patient --> Coverage : beneficiary

Practitioner --> PractitionerRole : practitioner
Organization --> PractitionerRole : organization
Location --> PractitionerRole : location

PractitionerRole --> Encounter : participant
PractitionerRole --> Procedure : performer
PractitionerRole --> MedicationRequest : requester
PractitionerRole --> Observation : performer
PractitionerRole --> Condition : asserter
PractitionerRole --> Appointment : actor

Organization --> Patient : managingOrganization
Organization --> Encounter : serviceProvider

Location --> Encounter : location

Encounter --> Condition : encounter
Encounter --> Observation : encounter
Encounter --> Procedure : encounter
Encounter --> MedicationRequest : encounter
Encounter --> DiagnosticReport : encounter

Condition --> Observation : evidence
Condition --> CarePlan : addresses

MedicationRequest --> Medication : medication
MedicationRequest --> CarePlan : basedOn
MedicationDispense --> Medication : medication
MedicationDispense --> MedicationRequest : authorizingPrescription
MedicationAdministration --> Medication : medication
MedicationAdministration --> MedicationRequest : request

DiagnosticReport --> Observation : result
DiagnosticReport --> Specimen : specimen
DiagnosticReport --> ServiceRequest : basedOn

Observation --> Specimen : specimen
Observation --> ServiceRequest : basedOn

CarePlan --> Goal : goal
CarePlan --> ServiceRequest : activity

ServiceRequest --> Patient : subject
ServiceRequest --> PractitionerRole : requester

DocumentReference --> Patient : subject
DocumentReference --> Encounter : context

Composition --> Patient : subject
Composition --> Encounter : encounter
Composition --> PractitionerRole : author

Appointment --> Slot : slot
Slot --> Schedule : schedule
Schedule --> PractitionerRole : actor
Schedule --> Location : actor

Claim --> Patient : patient
Claim --> PractitionerRole : provider
ExplanationOfBenefit --> Patient : patient
ExplanationOfBenefit --> Claim : claim
Coverage --> Organization : payor

@enduml
```

#### Resource Cardinality Scaffold  

> See also [FHIR Resource Cardinality](../eh-dd-02-fhir-data-fundamentals/deepdive-fhir-cardinality.md) for a focused cardinality diagram for three core resources: `Patient`, `Observation`, and `Condition`.

```puml
@startuml FHIR_Cardinality_Map
' Diagram: FHIR Resource Cardinality Overview

hide circle
skinparam linetype ortho
skinparam entity {
  BackgroundColor White
  BorderColor Black
  FontSize 11
}

entity Patient {
  * managingOrganization : Organization [0..1]
  * generalPractitioner : Practitioner | PractitionerRole [0..*]
  * link : Patient [0..*]
}

entity Encounter {
  * subject : Patient [1..1]
  * participant : PractitionerRole | Practitioner [0..*]
  * location : Location [0..*]
  * serviceProvider : Organization [0..1]
}

entity Condition {
  * subject : Patient [1..1]
  * encounter : Encounter [0..1]
  * asserter : PractitionerRole | Patient [0..1]
  * evidence : Observation [0..*]
}

entity Observation {
  * subject : Patient [0..1]
  * performer : PractitionerRole | Practitioner [0..*]
  * encounter : Encounter [0..1]
  * specimen : Specimen [0..1]
  * basedOn : ServiceRequest [0..*]
}

entity Procedure {
  * subject : Patient [1..1]
  * performer : PractitionerRole [0..*]
  * encounter : Encounter [0..1]
}

entity MedicationRequest {
  * subject : Patient [1..1]
  * requester : PractitionerRole [0..1]
  * medication : Medication [1..1]
  * encounter : Encounter [0..1]
  * basedOn : CarePlan [0..*]
}

entity DiagnosticReport {
  * subject : Patient [0..1]
  * result : Observation [0..*]
  * specimen : Specimen [0..*]
  * basedOn : ServiceRequest [0..*]
  * encounter : Encounter [0..1]
}

entity CarePlan {
  * subject : Patient [1..1]
  * goal : Goal [0..*]
  * activity : ServiceRequest [0..*]
  * addresses : Condition [0..*]
}

entity ServiceRequest {
  * subject : Patient [1..1]
  * requester : PractitionerRole [0..1]
}

entity DocumentReference {
  * subject : Patient [0..1]
  * context : Encounter [0..1]
}

entity Composition {
  * subject : Patient [0..1]
  * encounter : Encounter [0..1]
  * author : PractitionerRole [1..1]
}

entity Appointment {
  * actor : Patient | PractitionerRole [0..*]
  * slot : Slot [0..*]
}

entity Slot {
  * schedule : Schedule [1..1]
}

entity Schedule {
  * actor : PractitionerRole | Location [1..*]
}

entity Claim {
  * patient : Patient [1..1]
  * provider : PractitionerRole [1..1]
}

entity ExplanationOfBenefit {
  * patient : Patient [1..1]
  * claim : Claim [0..1]
}

entity Coverage {
  * beneficiary : Patient [1..1]
  * payor : Organization [1..*]
}

@enduml
```