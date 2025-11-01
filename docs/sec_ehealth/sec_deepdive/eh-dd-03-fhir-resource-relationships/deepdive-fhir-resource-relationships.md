## Core FHIR Resource Relationships

> \<lead-in::resource-relationships> TBD

```mermaid
graph TD
    Patient[Patient]
    Practitioner[Practitioner]
    Organization[Organization]
    Encounter[Encounter]
    Condition[Condition]
    Observation[Observation]
    MedicationRequest[MedicationRequest]
    Procedure[Procedure]
    AllergyIntolerance[AllergyIntolerance]
    DiagnosticReport[DiagnosticReport]
    Immunization[Immunization]
    CarePlan[CarePlan]
  
    Patient -->|subject| Condition
    Patient -->|subject| Observation
    Patient -->|subject| MedicationRequest
    Patient -->|subject| Procedure
    Patient -->|patient| AllergyIntolerance
    Patient -->|subject| Encounter
    Patient -->|subject| DiagnosticReport
    Patient -->|patient| Immunization
    Patient -->|subject| CarePlan
  
    Practitioner -->|performer| Procedure
    Practitioner -->|requester| MedicationRequest
    Practitioner -->|participant| Encounter
  
    Organization -->|managingOrganization| Patient
    Organization -->|serviceProvider| Encounter
  
    Encounter -->|encounter| Condition
    Encounter -->|encounter| Observation
    Encounter -->|encounter| Procedure
  
    Condition -->|evidence| Observation
    DiagnosticReport -->|result| Observation
```

## Resource Relationships by Domain

### Actors

```dot
digraph actors {
  rankdir=LR;
  Patient;
  Practitioner;
  PractitionerRole;
  Organization;
  Location;

  Practitioner -> PractitionerRole [label="practitioner"];
  Organization -> PractitionerRole [label="organization"];
  Location -> PractitionerRole [label="location"];
  Organization -> Patient [label="managingOrganization"];
}
```

### Clinical

```dot
digraph clinical {
  rankdir=LR;
  Encounter;
  Condition;
  Observation;
  Procedure;
  DiagnosticReport;
  Specimen;

  Encounter -> Condition [label="encounter"];
  Encounter -> Observation [label="encounter"];
  Encounter -> Procedure [label="encounter"];
  Encounter -> DiagnosticReport [label="encounter"];
  DiagnosticReport -> Observation [label="result"];
  DiagnosticReport -> Specimen [label="specimen"];
  Condition -> Observation [label="evidence"];
}
```

!!! note "Diagram Overview" 
    This graph shows how Encounter anchors multiple clinical resources. It’s the temporal spine of most patient interactions.

### Medication

```dot
digraph medication {
  rankdir=LR;
  MedicationRequest;
  Medication;
  MedicationDispense;
  MedicationAdministration;
  AllergyIntolerance;
  Immunization;

  MedicationRequest -> Medication [label="medication"];
  MedicationDispense -> Medication [label="medication"];
  MedicationAdministration -> Medication [label="medication"];
  MedicationDispense -> MedicationRequest [label="authorizingPrescription"];
  MedicationAdministration -> MedicationRequest [label="request"];
}
```

### Care Planning

```dot
digraph careplan {
  rankdir=LR;
  CarePlan;
  Goal;
  ServiceRequest;

  CarePlan -> Goal [label="goal"];
  CarePlan -> ServiceRequest [label="activity"];
  ServiceRequest -> CarePlan [label="basedOn"];
}
```

### Documentation

```dot
digraph documentation {
  rankdir=LR;
  DocumentReference;
  Composition;

  DocumentReference -> Encounter [label="context"];
  Composition -> Encounter [label="encounter"];
}
```

### Scheduling

```dot
digraph scheduling {
  rankdir=LR;
  Appointment;
  Slot;
  Schedule;

  Appointment -> Slot [label="slot"];
  Slot -> Schedule [label="schedule"];
  Schedule -> PractitionerRole [label="actor"];
  Schedule -> Location [label="actor"];
}
```

### Financial

```dot
digraph financial {
  rankdir=LR;
  Coverage;
  Claim;
  ExplanationOfBenefit;

  Claim -> Patient [label="patient"];
  Claim -> PractitionerRole [label="provider"];
  ExplanationOfBenefit -> Claim [label="claim"];
  Coverage -> Organization [label="payor"];
}
```