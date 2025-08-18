# A Jakarta Enterprise Application on Azure

This is a compact, helicopter-view look at what's involved in building and deploying an *almost realistic* Java (Jakarta EE / Java EE) enterprise web application on Azure + Azure DevOps:

- architecture and components (what pieces to build and why)
- Azure services to host them (options and tradeoffs)
- a typical CI/CD pipeline (YAML) for Maven/Gradle → container → deploy
- security, storage, DB, messaging, monitoring, infra-as-code notes

In other words, technical mockumentation.

## Overview

**Goal:**
We're building a modern enterprise web application in Java EE (Jakarta EE) and deploying it to Microsoft Azure, with an automated CI/CD pipeline in Azure DevOps.

**Why this matters:**
This approach is used in real production systems — from banks to e-commerce — to deliver reliable, secure, and scalable services.

---

## Key Terms

- **Java EE / Jakarta EE**: Java technologies for building large business applications including security and APIs
- **PaaS (Platform-as-a-Service)**: Cloud service that runs our app without managing servers
- **AKS (Azure Kubernetes Service)**: Managed service to run apps inside Docker containers
- **Lift-and-Shift**: Moving our existing app to the cloud without rewriting it
- **CI/CD (Continuous Integration / Continuous Deployment)**: Automated build, test, and deployment processes triggered by code changes
- **Infrastructure as Code (IaC)**: Managing cloud resources using code files instead of manual portal actions
- **Managed Identity**: Azure identity for apps to securely access resources without passwords
- **Blob Storage**: Cloud storage for files like images and videos
- **Service Bus**: Messaging service for sending messages between app components
- **Key Vault**: Secure storage for passwords, certificates, and keys

## Typical Components of a Java EE App on Azure

A Java EE app on Azure will likely comprise multiple, layered components: 


| Layer / Module           | Purpose                                 | Azure Service Example                   | Example Technologies         |
| -------------------------- | ----------------------------------------- | ----------------------------------------- | ------------------------------ |
| Presentation Layer       | User interface and API endpoints        | Azure App Service / AKS                 | JAX-RS REST, JSF, Servlets   |
| Business Logic Layer     | Implements rules and workflows          | Same as above                           | CDI, EJB                     |
| Persistence Layer        | Reads/writes data from a database       | Azure SQL Database / MySQL / PostgreSQL | JPA (Hibernate, EclipseLink) |
| File/Object Storage      | Stores user uploads, documents          | Azure Blob Storage                      | Azure Storage SDK for Java   |
| Messaging/Event Handling | Asynchronous workflows and integrations | Azure Service Bus, Event Grid           | JMS API                      |
| Caching Layer            | Faster data retrieval                   | Azure Cache for Redis                   | Redis API                    |
| Security & Secrets       | Protects app and data                   | Azure AD, Key Vault                     | OAuth2, Managed Identity     |
| Monitoring               | Observes app health and performance     | Application Insights                    | Azure Monitor SDK            |
| Infrastructure           | Provisioning & configuration            | ARM/Bicep/Terraform                     | IaC tools                    |



The following is a visual representation of the component layers:

<!-- ALT: Layered architecture diagram showing 4 main layers: Presentation Layer at top, Business Logic Layer below it, then Data & Persistence layer containing Persistence Layer connected to Azure SQL/MySQL/PostgreSQL database and Azure Blob Storage for files. Alongside are Messaging & Caching layer with Service Bus/Event Grid and Azure Cache for Redis, plus Security & Monitoring layer with Azure AD/Key Vault and Application Insights. Arrows show data flow from Presentation to Business Logic to Persistence, with Business Logic also connecting to messaging, caching, security and monitoring components. -->  

```mermaid
flowchart TD
    A["Presentation Layer"]
    B["Business Logic Layer"]
    
    subgraph DataLayer ["Data & Persistence"]
        C["Persistence Layer"]
        D["DB: Azure SQL/MySQL/PostgreSQL"]
        E["File/Obj Storage: Azure Blob Storage"]
    end
    
    subgraph MessagingCache ["Messaging & Caching"]
        F["Msg/Event Handling: SvcBus/Event Grid"]
        G["Caching: Azure Cache for Redis"]
    end
    
    subgraph CrossCutting ["Security & Monitoring"]
        H["Security/Secrets: Azure AD, Key Vault"]
        I["Monitoring: Application Insights"]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    B --> F
    B --> G
    B --> H
    B --> I
    
    classDef dataStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#0d47a1
    classDef msgStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c
    classDef crossStyle fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#1b5e20
    
    class DataLayer dataStyle
    class MessagingCache msgStyle
    class CrossCutting crossStyle
```

---

## Hosting Options on Azure

Azure provides several hosting options, depending on the type and nature of the service or application. The following is a visual representation:

<!-- ALT: Simple decision flowchart showing Developer/BA choosing between 4 Azure hosting options: Azure App Service for simple deployment, Azure Kubernetes Service AKS for complex apps, Azure Spring Apps for Spring projects, and Virtual Machines for legacy lift-and-shift. -->  

```mermaid
graph LR
  User["Developer/BA"] --> Choice{"Choose Hosting"}
  Choice --> AppService["Azure App Service"]
  Choice --> AKS["Azure Kubernetes Service (AKS)"]
  Choice --> Spring["Azure Spring Apps"]
  Choice --> VMs["Virtual Machines (VMs)"]
```


| Option                         | What It Is                                    | Best For                         | Trade-offs                   |
| -------------------------------- | ----------------------------------------------- | ---------------------------------- | ------------------------------ |
| Azure App Service              | Managed web app hosting (Tomcat, JBoss, etc.) | Simple deployment, minimal ops   | Less control over OS/runtime |
| Azure Kubernetes Service (AKS) | Full container orchestration                  | Microservices, complex apps      | More setup/maintenance       |
| Azure Spring Apps              | Managed Spring Boot hosting                   | Spring-heavy projects            | Limited if not using Spring  |
| VMs                            | Full control server hosting                   | Lift-and-shift of legacy Java EE | Highest maintenance          |

---


## High-Level Architecture

The following is a visual, high-level representation of architecture: 

<!-- ALT: High-level system architecture showing user browser connecting via HTTPS to Azure Front Door WAF for security and routing, which connects to App Service or AKS Ingress, then to Java EE App containing business and API layers. The Java EE App connects to 6 Azure services: SQL/MySQL/PostgreSQL database, Blob Storage for files, Cache for Redis, Service Bus/Event Grid for messaging, Key Vault for secrets, and Application Insights for monitoring. Data flows from browser through security layer to app, then branches to all backend services. -->  
```mermaid
flowchart LR
  subgraph Client
    Browser["User Browser / Mobile App"]
  end

  subgraph Azure_Cloud
    FrontDoor["Azure Front Door / WAF (Security & Routing)"]
    API["App Service / AKS Ingress"]
    App["Java EE App (Business + API Layers)"]
    DB["Azure SQL / MySQL / PostgreSQL"]
    Blob["Azure Blob Storage"]
    Cache["Azure Cache for Redis"]
    Msg["Azure Service Bus / Event Grid"]
    KV["Azure Key Vault"]
    Insights["Application Insights"]
  end

  Browser -->|HTTPS| FrontDoor
  FrontDoor --> API
  API --> App
  App --> DB
  App --> Blob
  App --> Cache
  App --> Msg
  App --> KV
  App --> Insights
```

---

## CI/CD Pipeline Flow


<!-- ALT: CI/CD pipeline flowchart showing 5 phases: Development (Code, Commit & Push), Continuous Integration (Build/Test/Scan, Create Artifact, Push to ACR), Staging & Testing (Deploy to Staging, User Acceptance Testing, Approval), Continuous Deployment (Deploy to Production, Monitoring & Feedback). Process flows linearly from development through testing to production deployment with feedback loop. -->  
```mermaid
graph TD
    A["Developer Pushes Code"]
    B["Azure DevOps Pipeline"]
  
    subgraph BuildTest ["Build & Test"]
        C1["Build"]
        C2["Test"]
    end
  
    subgraph QualitySec ["Quality & Security"]
        D1["Static Code Analysis"]
        D2["Security Scan"]
    end
  
    subgraph PackageReg ["Package & Registry"]
        E["Package Artifacts"]
        F1["Build Docker Image"]
        F2["Push Image to ACR"]
    end
  
    subgraph StagingEnv ["Staging Environment"]
        G["Deploy to Staging"]
        H["Run Acceptance Tests"]
    end
  
    subgraph ProdDeploy ["Production Deployment"]
        I["Manual Approval Gate"]
        J["Deploy to Production"]
        K["Monitor via Application Insights"]
    end

    A --> B
    B --> C1
    C1 --> C2
    C2 --> D1
    D1 --> D2
    D2 --> E
    E --> F1
    F1 --> F2
    F2 --> G
    G --> H
    H --> I
    I --> J
    J --> K
  
    classDef buildStyle fill:#fff3cd,stroke:#f0ad4e,stroke-width:2px,color:#856404
    classDef qualityStyle fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#155724
    classDef packageStyle fill:#cce5ff,stroke:#007bff,stroke-width:2px,color:#004085
    classDef stagingStyle fill:#f8d7da,stroke:#dc3545,stroke-width:2px,color:#721c24
    classDef prodStyle fill:#e2e3e5,stroke:#6c757d,stroke-width:2px,color:#383d41
  
    class BuildTest buildStyle
    class QualitySec qualityStyle
    class PackageReg packageStyle
    class StagingEnv stagingStyle
    class ProdDeploy prodStyle
```

---

## Security Checklist


| Concern           | What to Ask / Check                                        |
| ------------------- | ------------------------------------------------------------ |
| Authentication    | Is Azure Active Directory used for login?                  |
| Authorization     | Are user roles & permissions clearly defined?              |
| Secret Management | Are passwords/API keys in Key Vault, not in code?          |
| Data in Transit   | Is HTTPS enforced?                                         |
| Data at Rest      | Are databases and blobs encrypted?                         |
| Access Control    | Are Managed Identities used instead of stored credentials? |

---

## Typical Development-to-Deployment Steps

Here is the typical CI/CD flow used in most enterprise software shops today. While nothing in this pipeline is specific to Jakarta EE, it represents the standard approach for delivering reliably and at scale.

<!-- ALT: Detailed CI/CD pipeline showing step-by-step process from Developer Pushes Code through Azure DevOps Pipeline to 4 main stages: Build & Test (Build, Test), Quality & Security (Static Code Analysis, Security Scan), Package & Registry (Package Artifacts, Build Docker Image, Push to ACR), Staging Environment (Deploy to Staging, Run Acceptance Tests), ending with Production Deployment (Manual Approval Gate, Deploy to Production, Monitor via Application Insights). Each stage flows sequentially with colored groupings for different phases. -->  
```mermaid
graph TD
    subgraph Development ["Development Phase"]
        A["Code"]
        B["Commit & Push"]
    end
    
    subgraph CI ["Continuous Integration"]
        C["CI Pipeline:<br/>Build, Test, Scan"]
        D["Create Artifact:<br/>WAR/JAR"]
        E["Push Image to ACR"]
    end
    
    subgraph Staging ["Staging & Testing"]
        F["Deploy to Staging"]
        G["User Acceptance<br/>Testing"]
        H["Approval"]
    end
    
    subgraph CD ["Continuous Deployment"]
        I["Deploy to<br/>Production"]
        J["Monitoring &<br/>Feedback"]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    
    classDef devStyle fill:#fff3cd,stroke:#f0ad4e,stroke-width:2px,color:#856404
    classDef ciStyle fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#155724
    classDef stagingStyle fill:#f8d7da,stroke:#dc3545,stroke-width:2px,color:#721c24
    classDef cdStyle fill:#cce5ff,stroke:#007bff,stroke-width:2px,color:#004085
    
    class Development devStyle
    class CI ciStyle
    class Staging stagingStyle
    class CD cdStyle
```

---

## Storage & Event Handling Patterns


| Need                         | Service            | Example                             |
| ------------------------------ | -------------------- | ------------------------------------- |
| Store large files            | Azure Blob Storage | User profile pictures               |
| Notify multiple systems      | Azure Event Grid   | New file upload triggers processing |
| Process queued work          | Azure Service Bus  | Payment processing queue            |
| Handle high-volume telemetry | Event Hubs         | IoT device streams                  |

---

## Pitfalls to Avoid

- Skipping staging — Always test in a staging environment first.
- Storing secrets in code — Always use Key Vault + Managed Identity.
- Overengineering too soon — Start with PaaS (App Service) unless we truly need AKS.
- Ignoring monitoring — Without Application Insights, issues are harder to detect.

---
2025.08.11