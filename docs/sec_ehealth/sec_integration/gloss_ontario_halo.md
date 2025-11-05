# Ontario eHealth & HALO Integration Glossary

This glossary is tailored for Ontario HALO integration projects and should be used alongside official eHealth Ontario documentation and implementation guides.

## Core Systems & Platforms

### HALO (Health Assets Longitudinal Overview)
Ontario's centralized provincial health information system that aggregates patient health data from various sources across the province. HALO provides healthcare providers with a comprehensive view of patient information including medications, lab results, diagnostic imaging, hospital visits, and other clinical data.

### eHealth Ontario
The provincial agency responsible for managing Ontario's digital health infrastructure and systems, including HALO, the Provincial Client Registry, and various other health information exchange platforms.

### DHR (Digital Health Record)
Ontario's initiative to create comprehensive digital health records accessible across the healthcare system. HALO is a key component of this broader digital health strategy.

### ConnectingOntario
The province's clinical information integration platform that enables the secure sharing of patient information across healthcare organizations, often working in conjunction with HALO.

## Health Information Standards

### HL7 (Health Level Seven)
An international organization and set of standards for exchanging, integrating, sharing, and retrieving electronic health information. The "Level Seven" refers to the seventh layer of the OSI model (application layer).

**Key HL7 Versions:**
- **HL7 v2.x**: Legacy messaging standard still widely used for ADT (Admit/Discharge/Transfer), lab results, orders
- **HL7 v3**: More structured, XML-based standard with limited adoption
- **HL7 CDA (Clinical Document Architecture)**: Standard for clinical document exchange

### FHIR (Fast Healthcare Interoperability Resources)
HL7's modern API-based standard for exchanging healthcare information electronically. FHIR combines the best features of previous HL7 standards while leveraging modern web technologies (RESTful APIs, JSON, XML).

**Key FHIR Concepts:**
- **Resources**: Basic units of data (e.g., Patient, Observation, Medication)
- **RESTful API**: Uses standard HTTP methods (GET, POST, PUT, DELETE)
- **Profiles**: Customizations of base resources for specific use cases
- **Extensions**: Mechanism to add data elements not in the base specification

**FHIR Versions:**
- **DSTU2** (Draft Standard for Trial Use 2)
- **STU3** (Standard for Trial Use 3)
- **R4** (Release 4) - Current stable version
- **R5** (Release 5) - Latest version

### SMART-on-FHIR
A set of open specifications that enable secure, standards-based integration of apps with EHR systems using FHIR APIs. SMART stands for "Substitutable Medical Applications, Reusable Technologies."

**Key Components:**
- **OAuth 2.0**: Authorization framework for secure access
- **FHIR API**: Data access layer
- **Launch Contexts**: EHR launch, standalone launch, backend services
- **Scopes**: Define what data an app can access (e.g., patient/*.read, user/Observation.read)

### CDS Hooks (Clinical Decision Support Hooks)
A standard for integrating clinical decision support tools into EHR workflows at the point of care, often used alongside SMART-on-FHIR.

## Data Exchange & Messaging

### ADT (Admit, Discharge, Transfer)
Standard HL7 messages that communicate patient registration, admission, discharge, and transfer events between systems.

### MLLP (Minimal Lower Layer Protocol)
The standard protocol for transmitting HL7 v2.x messages over TCP/IP networks.

### RESTful API (Representational State Transfer)
Architectural style for designing networked applications, used extensively in FHIR. Uses standard HTTP methods and is stateless.

### JSON (JavaScript Object Notation)
Lightweight data interchange format commonly used in FHIR implementations alongside XML.

### XML (eXtensible Markup Language)
Markup language used in HL7 v3, CDA documents, and some FHIR implementations.

## Identifiers & Registration

### PCR (Provincial Client Registry)
Ontario's master patient index that maintains demographic information and assigns unique provincial identifiers to patients.

### HCN (Health Card Number)
Ontario's health insurance number used to identify patients. Format: 10 digits followed by 2 letter version code.

### MRN (Medical Record Number)
Local patient identifier assigned by individual healthcare organizations.

### OID (Object Identifier)
Globally unique identifier used in health IT to identify organizations, systems, and coding systems (e.g., 2.16.840.1.113883.3.239 for Ontario).

### IHI (Individual Health Identifier)
Unique patient identifier used across healthcare systems (term varies by jurisdiction).

## Clinical Terminologies & Coding

### SNOMED CT (Systematized Nomenclature of Medicine Clinical Terms)
Comprehensive clinical terminology covering diseases, findings, procedures, organisms, and more. Used extensively in Canadian healthcare.

### LOINC (Logical Observation Identifiers Names and Codes)
Standard for identifying laboratory and clinical observations. Essential for lab result interoperability.

### ICD-10-CA (International Classification of Diseases, 10th Revision, Canadian Enhancement)
Standard for coding diagnoses in Canada, maintained by CIHI.

### CCI (Canadian Classification of Health Interventions)
Canadian standard for classifying health interventions, maintained by CIHI.

### RxNorm
Standardized nomenclature for clinical drugs, widely used in medication orders and prescriptions.

### DIN (Drug Identification Number)
Health Canada's 8-digit identifier assigned to prescription and over-the-counter medications.

## Security & Privacy

### PHIPA (Personal Health Information Protection Act)
Ontario's privacy legislation governing the collection, use, and disclosure of personal health information.

### OAuth 2.0
Industry-standard authorization protocol used in SMART-on-FHIR for delegating access without sharing credentials.

### SAML (Security Assertion Markup Language)
XML-based standard for exchanging authentication and authorization data, often used in healthcare SSO.

### PKI (Public Key Infrastructure)
Encryption framework using digital certificates for secure communications in healthcare networks.

### Audit Trail
Record of all access to and modifications of patient health information, required for compliance and security.

### Consent Management
System for recording and enforcing patient consent preferences for information sharing.

## Integration Patterns & Architecture

### HIE (Health Information Exchange)
System enabling the sharing of health information across organizational boundaries while maintaining data security and privacy.

### Interface Engine
Middleware that facilitates communication between disparate healthcare systems, often handling HL7 v2.x message routing and transformation.

### EMPI (Enterprise Master Patient Index)
System that maintains unique patient identifiers across multiple systems within an organization or region.

### ETL (Extract, Transform, Load)
Process for moving data from source systems into data warehouses or integration platforms.

### API Gateway
Component that manages API requests, handling authentication, rate limiting, and routing for backend services.

### Microservices
Architectural pattern where applications are built as collections of small, independent services.

## Clinical Data Types

### CCR (Continuity of Care Record)
Summary of patient health information covering diagnoses, medications, allergies, and care plan. Predecessor to CCD.

### CCD (Continuity of Care Document)
HL7 CDA-based standard for patient summary documents, evolved from CCR.

### eReferral
Electronic referral from primary care to specialists, often including clinical context and supporting documents.

### DI/PACS (Diagnostic Imaging / Picture Archiving and Communication System)
Systems for storing and transmitting medical images (X-rays, CT, MRI, etc.).

### LIS (Laboratory Information System)
System managing laboratory workflows and results.

### CPOE (Computerized Provider Order Entry)
Electronic system for entering medical orders, replacing paper-based ordering.

## Ontario-Specific Components

### ONE ID
Ontario's provincial authentication service for healthcare providers accessing digital health systems.

### HRM (Hospital Report Manager)
Ontario's system for distributing hospital discharge summaries and other reports to community providers.

### OLIS (Ontario Laboratories Information System)
Provincial repository containing laboratory test results from hospitals and community labs across Ontario.

### DIS (Diagnostic Imaging Services)
Ontario's provincial diagnostic imaging repository providing access to radiology reports and images.

### Digital Health Drug Repository
Provincial system containing medication dispensing records from Ontario pharmacies.

### DHDR (Digital Health Drug Repository)
Alternative acronym for the medication dispensing repository.

### CHRIS (Client Health and Related Information System)
System used by public health units in Ontario for managing communicable disease information.

## Implementation Concepts

### Use Case
Specific scenario describing how a system will be used, essential for defining integration requirements.

### User Story
Agile development technique describing features from end-user perspective (format: "As a [role], I want [feature] so that [benefit]").

### Interoperability
Ability of different systems to exchange and use information seamlessly.

### Data Mapping
Process of matching fields between different data models or systems during integration.

### Conformance/Capability Statement
FHIR resource describing what operations and resources a server supports.

### Implementation Guide
Detailed specification for implementing standards in specific contexts (e.g., Ontario FHIR Implementation Guide).

### Profile
Constrained version of a FHIR resource specifying which elements are required, forbidden, or have specific bindings for a use case.

### Validation
Process of ensuring data conforms to specified standards and business rules.

### Transformation
Converting data from one format to another (e.g., HL7 v2 to FHIR).

## Testing & Quality Assurance

### Unit Testing
Testing individual components in isolation.

### Integration Testing
Testing interactions between integrated components or systems.

### UAT (User Acceptance Testing)
Testing by end users to validate system meets business requirements.

### Touchstone
HL7's official FHIR testing platform for validating conformance.

### Synthetic Data
Artificially generated test data that mimics real patient data without privacy concerns.

### Test Harness
Framework for automated testing of integrations and interfaces.

## Performance & Operations

### Throughput
Volume of transactions or messages a system can process in a given time period.

### Latency
Time delay between request and response in system communications.

### SLA (Service Level Agreement)
Contract specifying expected performance, availability, and support levels.

### High Availability (HA)
System design ensuring minimal downtime through redundancy and failover capabilities.

### Scalability
System's ability to handle growing amounts of work or increased demand.

### Monitoring
Continuous observation of system performance, availability, and security.

## Governance & Standards Bodies

### CIHI (Canadian Institute for Health Information)
National organization responsible for Canadian health data standards and reporting.

### Infoway (Canada Health Infoway)
Federal organization accelerating adoption of digital health solutions across Canada.

### HL7 International
Global organization developing healthcare IT interoperability standards.

### HL7 Canada
Canadian affiliate of HL7 International, developing Canadian-specific implementation guides.

### FHIR Foundation
Organization promoting and supporting FHIR adoption globally.

### OntarioMD
Organization supporting primary care physicians' adoption of EMRs and digital health tools in Ontario.

## Project Management & Methodology

### Agile
Iterative development methodology emphasizing flexibility and collaboration.

### Scrum
Agile framework using sprints, daily standups, and defined roles (Product Owner, Scrum Master, Team).

### Sprint
Time-boxed iteration (typically 2-4 weeks) in Agile development.

### Epic
Large body of work broken down into smaller user stories.

### Backlog
Prioritized list of features and requirements waiting to be implemented.

### MVP (Minimum Viable Product)
Version with minimum features needed to validate concept and gather feedback.

## Additional Technical Terms

### Middleware
Software connecting different applications or systems to enable data exchange.

### Web Service
Software system supporting interoperable machine-to-machine interaction over a network.

### SOAP (Simple Object Access Protocol)
Messaging protocol for exchanging structured information in web services (older alternative to REST).

### Endpoint
URL or URI where an API or service can be accessed.

### Payload
Actual data content in a message or transaction, excluding headers and metadata.

### Schema
Structure defining how data is organized, including data types and relationships.

### Namespace
Context for identifiers to prevent naming conflicts (common in XML/HL7).

### Message Queue
System for asynchronous message passing between applications, ensuring reliable delivery.

---

## Quick Reference: Common FHIR Resources for HALO Integration

- **Patient**: Demographics and identifiers
- **Observation**: Lab results, vital signs, clinical observations
- **MedicationRequest**: Prescription orders
- **MedicationStatement**: Patient's medication history
- **Condition**: Diagnoses and health concerns
- **Encounter**: Hospital visits, appointments
- **AllergyIntolerance**: Patient allergies and adverse reactions
- **Procedure**: Procedures performed on patient
- **DiagnosticReport**: Lab reports, imaging reports
- **DocumentReference**: Clinical documents, discharge summaries
- **Immunization**: Vaccination records
- **Organization**: Healthcare facilities and providers
- **Practitioner**: Healthcare provider information
- **Location**: Physical locations within facilities

---


