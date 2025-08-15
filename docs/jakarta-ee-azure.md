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



The following is a visual representation of the layered architecture:
  

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

Azure provides several hosting options, depending on the type and nature of the service or application.

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
