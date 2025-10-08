# SMART-on-FHIR and Integration — Visuals

## SMART-on-FHIR EHR Launch Flow

```puml
@startuml
skinparam Padding 2
skinparam ParticipantPadding 5
skinparam BoxPadding 2
skinparam SequenceDividerMargin 0
skinparam MaxMessageSize 100

actor "Clinician" as User
participant "EHR System" as EHR
participant "SMART App" as App
participant "Authorization\nServer" as Auth
participant "FHIR API\nServer" as FHIR

group Launch
  User -> EHR: Opens chart + clicks app
  activate EHR
  EHR -> EHR: Generate launch token
  EHR -> App: GET /launch?iss&launch
  deactivate EHR
  activate App
end group

group Discovery
  App -> FHIR: GET /.well-known/smart-configuration
  activate FHIR
  FHIR -> App: Return endpoints + capabilities
  deactivate FHIR
end group

group Authorization
  App -> App: Generate PKCE + state
  App -> Auth: Redirect to /authorize
  deactivate App
  activate Auth
end group

group Consent
  Auth -> User: Login + consent
  User -> Auth: Credentials + approval
  Auth -> App: Redirect with code + state
  deactivate Auth
  activate App
end group

group Token Exchange
  App -> Auth: POST /token with verifier
  activate Auth
  Auth -> App: Return access_token + patient_id
  deactivate Auth
end group

group FHIR Access
  App -> FHIR: GET /Patient + /Observation
  activate FHIR
  FHIR -> App: Return patient + observations
  deactivate FHIR
  App -> User: Display data
  deactivate App
end group
@enduml
```

## SMART-on-FHIR Standalone Launch Flow

```puml
@startuml SMART Standalone Launch Flow

title SMART-on-FHIR Standalone Launch Flow

actor "User" as User
participant "SMART App" as App
participant "FHIR Server" as FHIR
participant "Authorization\nServer" as Auth

== App Initiation ==
User -> App: Opens app directly\n(not from EHR)
activate App
App -> User: Prompt for FHIR\nserver URL
User -> App: Enters FHIR server URL

== Discovery ==
App -> FHIR: GET /.well-known/smart-configuration
activate FHIR
FHIR -> App: SMART configuration\n(endpoints & capabilities)
deactivate FHIR

== Authorization ==
App -> App: Generate PKCE parameters
App -> Auth: Redirect to /authorize?\n• response_type=code\n• client_id={id}\n• redirect_uri={callback}\n• scope=patient/*.read\n  openid fhirUser\n• state={state}\n• aud={fhir-url}\n• code_challenge={challenge}\n• code_challenge_method=S256\n\nNOTE: No launch parameter!
deactivate App
activate Auth

Auth -> User: Display login
User -> Auth: Authenticate
Auth -> User: **Patient Picker**\n(Select patient context)
User -> Auth: Selects patient
Auth -> Auth: Generate auth code\nwith selected patient
Auth -> App: Redirect with code & state
deactivate Auth
activate App

== Token Exchange ==
App -> Auth: POST /token (exchange code)
activate Auth
Auth -> App: access_token +\npatient context
deactivate Auth

== Access Resources ==
App -> FHIR: FHIR API requests\nwith access_token
activate FHIR
FHIR -> App: FHIR resources
deactivate FHIR
App -> User: Display data
deactivate App

@enduml
```

## SMART-on-FHIR Token Refresh Flow

```puml
@startuml Token Refresh Flow

title SMART-on-FHIR Token Refresh Flow

participant "SMART App" as App
participant "Authorization\nServer" as Auth
participant "FHIR API" as FHIR

== Normal Operation ==
App -> FHIR: API request with access_token
activate FHIR
FHIR -> App: Success (200 OK)
deactivate FHIR

... Time passes, token nears expiration ...

== Token Expired ==
App -> App: Check token expiry\n(expires_in timestamp)
App -> Auth: POST /token\n• grant_type=refresh_token\n• refresh_token={refresh_token}\n• client_id={client_id}\n• scope={original_scopes}
activate Auth
Auth -> Auth: Validate refresh token
Auth -> App: New tokens:\n• access_token\n• expires_in\n• refresh_token (new)\n• patient (same context)
deactivate Auth

App -> App: Update stored tokens
App -> FHIR: API request with\nNEW access_token
activate FHIR
FHIR -> App: Success (200 OK)
deactivate FHIR

@enduml
```

## PKCE Flow

The following diagram shows the PKCE (Proof Key for Code Exchange) flow.

```puml
@startuml PKCE Flow Detail

title PKCE (Proof Key for Code Exchange) Flow

participant "App (Client)" as App
participant "Authorization\nServer" as Auth

== Before Authorization ==
App -> App: 1. Generate random string\ncode_verifier (128 chars)\n\nExample: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"

App -> App: 2. Create code_challenge\nSHA256(code_verifier)\nthen Base64URL encode\n\ncode_challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

App -> Auth: 3. Authorization request with:\n• code_challenge\n• code_challenge_method=S256
activate Auth
Auth -> Auth: Store code_challenge\nwith auth code
Auth -> App: Returns authorization code
deactivate Auth

== Token Exchange ==
App -> Auth: 4. Token request with:\n• authorization code\n• code_verifier (original)
activate Auth
Auth -> Auth: 5. Compute challenge from verifier:\nSHA256(received_verifier)
Auth -> Auth: 6. Compare with stored challenge
alt Challenges Match
    Auth -> App: ✓ Issue access token
else Challenges Don't Match
    Auth -> App: ✗ Error: invalid_grant
end
deactivate Auth

note right of Auth
**Why PKCE?**
Protects against authorization
code interception attacks.
Even if code is stolen, attacker
cannot exchange it without
the original code_verifier.
end note

@enduml
```

## SMART Scope Hierarchy and Contexts

```puml
@startuml Scope Authorization Hierarchy
skinparam packageStyle rectangle
title SMART Scope Hierarchy and Contexts

left to right direction

package "Context Scopes" {
  [launch/patient] as LP
  [launch/encounter] as LE
  [launch] as L
  note right of L
    Request patient context
    from EHR launch
  end note
}

package "Patient-Specific Scopes" {
  left to right direction
  [patient/*.read] as PR
  [patient/*.write] as PW
  [patient/Observation.read] as POR
  note right of POR
    Access only current
    patient's data
  end note
  
  PR -[hidden]down-> PW
  PW -[hidden]down-> POR
  [patient/Condition.read] as PCR
  [patient/MedicationRequest.read] as PMR
  PCR -[hidden]down-> PMR
}

package "User Scopes" {
  left to right direction
  [user/*.read] as UR
  [user/*.write] as UW
  [user/Practitioner.read] as UPR
  note right of UPR
    Access all data the
    authenticated user
    can access
  end note
  UR -[hidden]down-> UW
  UW -[hidden]down-> UPR
}

package "System Scopes" {
  [system/*.read] as SR
  [system/*.write] as SW
  note right of SW
    Backend services only
    No user context
  end note
  SR -[hidden]down-> SW
}

package "Special Scopes" {
  left to right direction
  [openid] as OID
  [fhirUser] as FU
  note right of FU
    OpenID Connect
    authentication
  end note
  OID -[hidden]down-> FU
  
  [offline_access] as OA
  [online_access] as ONA
  note right of ONA
    Get refresh token
    for offline access
  end note
  OA -[hidden]down-> ONA
}

@enduml
```

## SMART-on-FHIR Error Handling Patterns

```puml
@startuml Error Handling Flow

title SMART-on-FHIR Error Handling Patterns

participant "App" as App
participant "Auth Server" as Auth
participant "FHIR Server" as FHIR

== Authorization Errors ==
App -> Auth: Authorization request
Auth -> App: Error redirect:\n?error=access_denied\n&error_description=User denied

App -> App: Handle error:\n• Log error\n• Show user message\n• Redirect to home

== Token Exchange Errors ==
App -> Auth: POST /token with invalid code
Auth -> App: 400 Bad Request\n{\n  "error": "invalid_grant",\n  "error_description": "Code expired"\n}

App -> App: Handle error:\n• Clear session\n• Restart auth flow

== Expired Token ==
App -> FHIR: API request with expired token
FHIR -> App: 401 Unauthorized\nWWW-Authenticate: Bearer\n  error="invalid_token"

alt Has Refresh Token
    App -> Auth: Refresh token request
    Auth -> App: New access token
    App -> FHIR: Retry with new token
    FHIR -> App: Success
else No Refresh Token
    App -> App: Redirect to re-authorize
end

== Insufficient Scope ==
App -> FHIR: Write request
FHIR -> App: 403 Forbidden\n{\n  "resourceType": "OperationOutcome",\n  "issue": [{\n    "severity": "error",\n    "code": "forbidden",\n    "diagnostics": "Insufficient scope"\n  }]\n}

App -> App: Handle error:\n• Show appropriate message\n• Request additional scopes\n  if needed

== Rate Limiting ==
App -> FHIR: Multiple rapid requests
FHIR -> App: 429 Too Many Requests\nRetry-After: 60

App -> App: Implement backoff:\n• Wait specified time\n• Retry request\n• Consider request batching

== FHIR Validation Errors ==
App -> FHIR: POST invalid resource
FHIR -> App: 400 Bad Request\n{\n  "resourceType": "OperationOutcome",\n  "issue": [{\n    "severity": "error",\n    "code": "invalid",\n    "diagnostics": "Missing required field"\n  }]\n}

App -> App: Parse OperationOutcome:\n• Extract diagnostics\n• Fix validation issues\n• Retry if appropriate

@enduml
```

## SMART-on-FHIR Architecture

### 1. SMART-on-FHIR Architecture, System Context

```puml
@startuml SMART Architecture - System Context

title SMART-on-FHIR - System Context

left to right direction

package "Client Applications" {
  [Web App]
  [Mobile App]
  [Backend Service]
}

package "SMART Client SDK" {
  [Authorization\nHandler]
  [Token\nManager]
  [FHIR\nClient]
}

package "EHR System" {
  component "Authorization\nServer" as Auth
  component "FHIR API\nServer" as API
  database "Clinical\nDatabase" as DB
  component "App\nRegistry" as Reg
}

cloud "Discovery" as Disc

[Web App] --> [Authorization\nHandler]
[Mobile App] --> [Authorization\nHandler]
[Backend Service] --> [Authorization\nHandler]

[Authorization\nHandler] --> Disc: 1. Discover endpoints
[Authorization\nHandler] --> Auth: 2. Authenticate
[Token\nManager] <-- Auth: 3. Issue tokens
[FHIR\nClient] --> API: 4. FHIR requests
API --> DB: Query data
Auth --> Reg: Validate client

note right of [SMART Client SDK]
  **SMART Client Library**
  • Handles OAuth 2.0 + SMART
  • Manages token lifecycle
  • Provides FHIR client
  • Handles launch contexts
end note

note right of Auth
  **SMART Authorization**
  • OAuth 2.0 + PKCE
  • Launch contexts
  • Scope-based access
  • User consent
end note

@enduml
```

### 2. SMART-on-FHIR Architecture, Authorization Server Components

```puml
@startuml SMART Architecture - Authorization Server

title SMART Authorization Server - Internal Components

left to right direction

package "Authorization Server" {
  component "OAuth 2.0\nEngine" as OAuth
  component "User\nAuthentication" as UserAuth
  component "Consent\nManagement" as Consent
  component "Token\nIssuer" as TokenIssuer
  
  OAuth -[hidden]down-> UserAuth
  UserAuth -[hidden]down-> Consent
  Consent -[hidden]down-> TokenIssuer
}

package "Supporting Services" {
  database "App Registry" as Registry {
    [Client Credentials]
    [Redirect URIs]
    [Allowed Scopes]
  }
  
  database "User Directory" as UserDir {
    [User Accounts]
    [Roles]
    [Permissions]
  }
  
  database "Session Store" as Sessions {
    [Active Sessions]
    [Consent Records]
    [Issued Tokens]
  }
}

[SMART Client] --> OAuth: Authorization request
OAuth --> Registry: Validate client_id
OAuth --> UserAuth: Authenticate user
UserAuth --> UserDir: Verify credentials
UserAuth --> Consent: Show consent screen
Consent --> Sessions: Record consent
Consent --> TokenIssuer: Generate tokens
TokenIssuer --> Sessions: Store token metadata
TokenIssuer --> [SMART Client]: Return tokens

note right of OAuth
  **OAuth 2.0 + SMART**
  • Authorization Code flow
  • PKCE enforcement
  • Launch token validation
  • State parameter check
end note

note right of Consent
  **Consent Management**
  • Display requested scopes
  • Remember user preferences
  • Support scope downgrade
  • Audit consent decisions
end note

@enduml
```


### 3. SMART-on-FHIR Architecture, FHIR API Server Components

```puml
@startuml SMART Architecture - FHIR API Server

title FHIR API Server - Internal Components

left to right direction

package "FHIR API Server" {
  component "FHIR REST\nAPI" as REST
  component "Token\nValidator" as Validator
  component "Scope\nEnforcer" as Scopes
  component "Resource Access\nControl" as RAC
  
  REST -[hidden]down-> Validator
  Validator -[hidden]down-> Scopes
  Scopes -[hidden]down-> RAC
}

package "Data Layer" {
  database "Clinical Database" as DB {
    [Patient Records]
    [Observations]
    [Medications]
    [Encounters]
  }
  
  component "Query\nEngine" as Query
  component "FHIR\nSerializer" as Serializer
}

[SMART Client] --> REST: GET /Patient/123
REST --> Validator: Validate Bearer token
Validator --> Scopes: Check scopes
Scopes --> RAC: Check resource access
RAC --> Query: Build filtered query
Query --> DB: Execute query
DB --> Serializer: Raw data
Serializer --> REST: FHIR JSON/XML
REST --> [SMART Client]: FHIR resource

note right of Validator
  **Token Validation**
  • Verify signature (JWT)
  • Check expiration
  • Validate audience
  • Confirm not revoked
end note

note right of Scopes
  **Scope Enforcement**
  • patient/*.read → current patient
  • user/*.read → user's patients
  • Resource-level filtering
  • Field-level redaction
end note

note right of RAC
  **Access Control**
  • Patient context enforcement
  • User role validation
  • Compartment-based access
  • Audit logging
end note

@enduml
```

### 4. SMART-on-FHIR Architecture, Smart API Request Flow
 
```puml
@startuml SMART Architecture - Request Flow

title SMART API Request Flow

participant "SMART Client" as Client
participant "FHIR REST API" as API
participant "Token Validator" as Validator
participant "Scope Enforcer" as Scopes
participant "Access Control" as AC
participant "Clinical Database" as DB

Client -> API: GET /Observation?patient=123\nAuthorization: Bearer {token}
activate API

API -> Validator: Validate token
activate Validator
Validator -> Validator: Check JWT signature\nVerify expiration\nValidate audience
Validator --> API: Token valid + claims
deactivate Validator

API -> Scopes: Check scopes
activate Scopes
Scopes -> Scopes: Extract scopes from token\npatient/Observation.read
Scopes --> API: Scope allows access
deactivate Scopes

API -> AC: Check resource access
activate AC
AC -> AC: Verify patient context\npatient ID in token = 123
AC --> API: Access permitted
deactivate AC

API -> DB: SELECT observations\nWHERE patient_id = 123
activate DB
DB --> API: Raw observation data
deactivate DB

API -> API: Serialize to FHIR Bundle
API --> Client: FHIR Bundle (JSON)
deactivate API

note right of Validator
  Rejects if:
  • Invalid signature
  • Expired token
  • Wrong audience
  • Revoked token
end note

note right of Scopes
  Checks:
  • Required scope present
  • Resource type allowed
  • Read/write permission
end note

@enduml
```

### 5. SMART-on-FHIR Architecture, SMART Discovery Process

```puml
@startuml SMART Architecture - Discovery

title SMART Discovery Process

participant "SMART Client" as Client
participant "FHIR Server" as FHIR

== Discovery ==

Client -> FHIR: GET /.well-known/smart-configuration
activate FHIR
FHIR --> Client: Returns:\n• authorization_endpoint\n• token_endpoint\n• capabilities\n• scopes_supported\n• code_challenge_methods
deactivate FHIR

Client -> FHIR: GET /metadata
activate FHIR
FHIR --> Client: FHIR CapabilityStatement:\n• Supported resources\n• Search parameters\n• Operations\n• Security (SMART-on-FHIR)
deactivate FHIR

Client -> Client: Configure endpoints\nand capabilities

note right of Client
  **Discovery provides:**
  • OAuth endpoint URLs
  • Supported SMART features
  • Available scopes
  • FHIR capabilities
  • Launch flow support
end note

note right of FHIR
  **smart-configuration includes:**
  {
    "authorization_endpoint": "...",
    "token_endpoint": "...",
    "capabilities": [
      "launch-ehr",
      "launch-standalone",
      "client-public",
      "sso-openid-connect"
    ]
  }
end note

@enduml
```

---

## HALO SMART Integration Architecture

### 1. HALO SMART Integration, High-Level Architecture (Context)

```puml
@startuml HALO Integration - System Context

title HALO Integration - System Context

left to right direction

actor "Clinician" as User

package "Your Application" {
  component "Frontend\nApplication" as FE
  component "Backend\nServices" as BE
  component "HALO Integration\nLayer" as IL
}

package "HALO System" {
  component "HALO\nAuthorization" as Auth
  component "HALO\nFHIR API" as API
  database "HALO\nDatabase" as DB
}

cloud "Observability" as Obs

User --> FE: Uses application
FE --> BE: API calls
BE --> IL: Request HALO data
IL --> Auth: Authentication
IL --> API: FHIR requests
API --> DB: Query data
IL --> Obs: Logs & metrics
API --> Obs: Audit trail

note right of IL
  **Integration Layer**
  • Token management
  • Retry & error handling
  • Rate limit compliance
  • FHIR client wrapper
end note

@enduml
```

### 2. HALO SMART Integration, Authentication Flow

```puml
@startuml HALO Integration - Auth Flow

title HALO SMART Authentication Flow

actor "Clinician" as User
participant "Frontend UI" as FE
participant "SMART Launch\nHandler" as Launch
participant "Backend\nAuth Middleware" as Auth
participant "Token\nStorage" as Storage
participant "HALO OAuth\nServer" as HALO

User -> FE: Click launch in HALO
FE -> Launch: Initialize with launch token
Launch -> HALO: Authorization request\n(with launch token & PKCE)
HALO -> User: Login & consent
User -> HALO: Approve
HALO -> Launch: Return auth code
Launch -> Auth: Forward auth code
Auth -> HALO: Exchange code for tokens\n(with code_verifier)
HALO -> Auth: Access token + refresh token\n+ patient context
Auth -> Storage: Store tokens securely\n(encrypted, with expiry)
Auth -> FE: Session established
FE -> User: Display patient dashboard

note right of Storage
  **Token Storage**
  • Encrypted at rest
  • 1-hour access token
  • Long-lived refresh token
  • Patient/encounter context
end note

@enduml
```

### 3. HALO SMART Integration, Data Access Flow

```puml
@startuml HALO Integration - Data Flow

title HALO FHIR Data Access Flow

participant "Patient\nDashboard" as UI
participant "Business\nLogic" as BL
participant "HALO SMART\nClient" as Client
participant "Token\nManager" as TM
participant "Token\nStorage" as Storage
participant "HALO FHIR\nAPI" as API
database "HALO\nDatabase" as DB

UI -> BL: Request patient data
BL -> Client: Get Patient + Observations
Client -> TM: Get valid access token

alt Token valid
  TM -> Storage: Retrieve token
else Token expired
  TM -> Storage: Get refresh token
  TM -> API: Refresh access token
  API -> TM: New access token
  TM -> Storage: Update stored token
end

Client -> API: GET /Patient/{id}\nAuthorization: Bearer {token}
API -> API: Validate token & scopes
API -> DB: Query patient data
DB -> API: Patient record
API -> Client: FHIR Patient resource

Client -> API: GET /Observation?patient={id}
API -> DB: Query observations
DB -> API: Observation records
API -> Client: FHIR Bundle

Client -> BL: Parsed FHIR resources
BL -> UI: Formatted data

note right of Client
  **SMART Client Features**
  • Automatic token refresh
  • Request batching
  • Response caching
  • Error normalization
end note

@enduml
```

## Security Best Practices

```puml
@startuml Security Best Practices

title SMART-on-FHIR Security Best Practices

package "Client Security" {
    usecase "Use PKCE" as UC1
    usecase "Validate State" as UC2
    usecase "Secure Token Storage" as UC3
    usecase "HTTPS Only" as UC4
    usecase "Minimize Scope" as UC5
    usecase "Token Rotation" as UC6
    
    note right of UC1
        Required for public clients
        Prevents code interception
    end note
    
    note right of UC3
        • Never in URLs
        • Use httpOnly cookies or
          secure storage
        • Encrypt at rest
    end note
}

package "Server Security" {
    usecase "Validate Redirect URI" as SV1
    usecase "Rate Limiting" as SV2
    usecase "Token Expiration" as SV3
    usecase "Audit Logging" as SV4
    usecase "Scope Enforcement" as SV5
}

package "Network Security" {
    usecase "TLS 1.2+" as NS1
    usecase "Certificate Pinning" as NS2
    usecase "Input Validation" as NS3
}

actor "Developer" as Dev

Dev --> UC1
Dev --> UC2
Dev --> UC3
Dev --> UC4
Dev --> UC5
Dev --> UC6

UC1 ..> SV1: Verified by
UC2 ..> SV1: Prevents CSRF
UC3 ..> SV3: Short-lived tokens
UC4 ..> NS1: Transport security
UC5 ..> SV5: Least privilege
UC6 ..> SV3: Refresh tokens

@enduml
```

## SMART-on-FHIR Data Flow

```puml
@startuml Data Flow Diagram

title SMART-on-FHIR Data Flow

(User Action) as UA
(Launch App) as LA
(Authenticate) as AUTH
(Consent) as CONSENT
(Token) as TOKEN
(FHIR Request) as FR
(Data Display) as DD

database "EHR Database" as DB
database "Token Store" as TS

UA --> LA: 1. Click launch
LA --> AUTH: 2. Redirect to auth
AUTH --> CONSENT: 3. Show consent
CONSENT --> TOKEN: 4. Generate token
TOKEN --> TS: 5. Store token
TOKEN --> FR: 6. Use token
FR --> DB: 7. Query data
DB --> FR: 8. Return FHIR resources
FR --> DD: 9. Transform data
DD --> UA: 10. Display to user

note right of TOKEN
  Contains:
  • Access token (JWT)
  • Refresh token
  • Expiry time
  • Scope grants
  • Patient context
end note

note right of FR
  With Headers:
  • Authorization: Bearer {token}
  • Accept: application/fhir+json
  • Prefer: return=representation
end note

@enduml
```