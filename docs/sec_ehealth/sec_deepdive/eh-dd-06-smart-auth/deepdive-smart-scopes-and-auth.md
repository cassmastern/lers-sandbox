# SMART Scopes and Authorization

## SMART Scope Patterns  
Scope patterns in SMART-on-FHIR define the specific permissions an application can request to access a user's health data, using a predefined structure of `context/resource.actions`. 

### Scope Syntax  

Pattern: `[context]/[resource].[permission]`  

Contexts:  

- `patient/` - Access limited to current patient context  
- `user/` - Access to resources user can access  
- `system/` - Backend system access (no user)  

Permissions:  

- `read` - Read-only access  
- `write` - Create/update access (implies read)  
- `*` - Full access (read/write)  

## Common Scope Examples  


### Patient-specific scopes  

- `patient/Patient.read` - Read current patient demographics  
- `patient/Observation.read` - Read observations for current patient
- `patient/Condition.read` - Read conditions for current patient
- `patient/MedicationRequest.read` - Read medication requests
- `patient/AllergyIntolerance.read` - Read allergies
- `patient/Immunization.read` - Read immunizations
- `patient/Procedure.read` - Read procedures
- `patient/DiagnosticReport.read` - Read diagnostic reports
- `patient/Encounter.read` - Read encounters
- `patient/DocumentReference.read` - Read documents

### User-level scopes (broader access)  

- `user/Patient.read` - Read any patient the user can access  
- `user/Observation.read` - Read observations across patients  
- `user/Practitioner.read` - Read practitioner information  
- `user/Organization.read` - Read organization data  

### Write permissions  

- `patient/Observation.write` - Create/update observations  
- `patient/Condition.write` - Create/update conditions  
- `user/Patient.write` - Create/update patient records  

### Wildcard scopes  

- `patient/*.read` - Read all resources for patient
- `user/*.read` - Read all resources for user
- `patient/*.write` - Full write access for patient

### OpenID Connect scopes  

- `openid` - Required for OIDC authentication  
- `profile` - Access to user profile  
- `email` - Access to user email  
- `fhirUser` - Get FHIR resource URL for user  

### Launch context scopes  

- `launch` - Required for EHR launch
- `launch/patient` - Get patient in context
- `launch/encounter` - Get encounter in context

### Offline access  

- `offline_access` - Request refresh token for long-term access  

## Typical Scope Combinations  

### Basic read-only app  

- `openid fhirUser launch launch/patient`  
- `patient/Patient.read` `patient/Observation.read` `patient/Condition.read`  

### Comprehensive read access  

- `openid fhirUser launch launch/patient offline_access`  
- `patient/*.read`  

### Clinical documentation app  

- `openid fhirUser launch launch/patient launch/encounter`  
- `patient/Patient.read patient/Observation.write patient/Condition.write`  

### Provider-facing dashboard  

- `openid profile fhirUser launch`  
- `user/Patient.read user/Observation.read user/Condition.read user/Encounter.read`  

### Backend service (no user)  

`system/Patient.read system/Observation.read`

## Scope Negotiation  

- App requests scopes during authorization  
- Authorization server may grant subset of requested scopes  
- Granted scopes returned in token response  
- App must check granted scopes before attempting operations  
