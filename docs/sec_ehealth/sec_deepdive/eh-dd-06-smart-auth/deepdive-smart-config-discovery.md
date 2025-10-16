# SMART Configuration Discovery

### SMART Configuration Example

```json
{
  "authorization_endpoint": "https://launch.smarthealthit.org/v/r4/auth/authorize",
  "token_endpoint": "https://launch.smarthealthit.org/v/r4/auth/token",
  "token_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "client_secret_post"
  ],
  "registration_endpoint": "https://launch.smarthealthit.org/v/r4/auth/register",
  "scopes_supported": [
    "openid",
    "fhirUser",
    "launch",
    "launch/patient",
    "launch/encounter",
    "offline_access",
    "online_access",
    "patient/*.read",
    "patient/*.write",
    "patient/*.*",
    "user/*.read",
    "user/*.write",
    "user/*.*",
    "patient/Patient.read",
    "patient/Observation.read",
    "patient/Observation.write",
    "patient/Condition.read",
    "patient/Condition.write",
    "patient/MedicationRequest.read",
    "patient/AllergyIntolerance.read",
    "patient/Procedure.read",
    "patient/Encounter.read",
    "patient/Immunization.read",
    "patient/DiagnosticReport.read",
    "patient/DocumentReference.read",
    "patient/CarePlan.read",
    "user/Patient.read",
    "user/Practitioner.read",
    "user/Organization.read"
  ],
  "response_types_supported": [
    "code",
    "code id_token",
    "id_token",
    "refresh_token"
  ],
  "capabilities": [
    "launch-ehr",
    "launch-standalone",
    "client-public",
    "client-confidential-symmetric",
    "context-ehr-patient",
    "context-ehr-encounter",
    "context-standalone-patient",
    "context-standalone-encounter",
    "permission-offline",
    "permission-patient",
    "permission-user",
    "sso-openid-connect"
  ],
  "code_challenge_methods_supported": [
    "S256"
  ],
  "grant_types_supported": [
    "authorization_code",
    "refresh_token"
  ],
  "introspection_endpoint": "https://launch.smarthealthit.org/v/r4/auth/introspect",
  "revocation_endpoint": "https://launch.smarthealthit.org/v/r4/auth/revoke",
  "management_endpoint": "https://launch.smarthealthit.org/v/r4/auth/manage"
}
```
