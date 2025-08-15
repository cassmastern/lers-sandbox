# A Hypothetical Data Centre Network

Below is a sample data centre network topology. Hopefully enough representative of the 2025 technology landscape to analyze and learn, especially from a security perspective.

## Why It Matters

Understanding the layout of a data centre network is essential to identifying potential vulnerabilities and planning effective defenses. This architecture serves as the baseline for threat modeling exercises using STRIDE and MITRE ATT&CK frameworks.

## Network Topology Overview

This diagram outlines a simplified data centre network architecture, segmented into public-facing cloud services, internal developer resources, and observability components. It serves as the foundation for subsequent threat modeling exercises.

```mermaid
flowchart TD
  %% Public Zone
  subgraph Public_Zone["Public Zone"]
    A[User]
    B[Browser]
    C[DNS Resolver]
  end

  %% Edge Zone
  subgraph Edge_Zone["Network Edge Zone"]
    D[HTTPS Request]
    E[Firewall<br/>Ingress ACLs]
    F[Reverse Proxy - Nginx<br/>Header Sanitization]
    G[App Gateway<br/>TLS Termination]
    LB[Load Balancer L7<br/>Rate Limiting]
    VPN[VPN Gateway<br/>Privileged Access]
  end

  %% Private Zone
  subgraph Private_Zone["Private App Zone"]
    WA[Web App<br/>RBAC + Input Validation]
    DB[Primary Database<br/>Encrypted at Rest]
    Cache[Redis Cache<br/>TTL + ACLs]
    Auth[Auth Service<br/>OAuth2 + JWT]
    Audit[Audit Logger<br/>Immutable Store]
    Replicas[Read Replicas<br/>Read-Only]
    IdP[Identity Provider<br/>Federated Trust]
    SIEM[SIEM Integration<br/>Security Alerts]
  end

  %% Observability
  subgraph Observability["Monitoring and Tracing"]
    Metrics[Metrics Exporter]
    Traces[Tracing Agent]
    Prometheus[Prometheus<br/>Access Controls]
    Jaeger[Jaeger<br/>Trace Retention]
  end

  %% CI/CD
  subgraph CI_CD["CI/CD Pipeline"]
    Git[Git Repository<br/>Branch Protections]
    Runner[Build Agent<br/>Sandboxed]
    Registry[Container Registry<br/>Signed Images]
    Deploy[Deployment Job<br/>Role Separation]
  end

  %% Traffic Flow
  A -->|North-South| B --> C --> D --> E --> F --> G --> LB --> WA
  VPN -->|Privileged Tunnel| WA
  WA -->|East-West| DB --> Replicas
  WA -->|East-West| Cache
  WA -->|East-West| Auth --> IdP
  WA -->|East-West| Audit --> SIEM
  WA -->|Telemetry| Metrics --> Prometheus
  WA -->|Telemetry| Traces --> Jaeger

  %% CI/CD Integration
  Git --> Runner --> Registry --> Deploy --> WA
```
### Key Traffic Paths

- User requests flow through CDN and Web App to backend services
- CI/CD runner interacts with internal repositories, secrets, and databases
- Monitoring and logging components collect telemetry across zones


## Public Zone

- **User** interacts via a Browser, initiating requests.
- **DNS Resolver** translates domain names to IP addresses.
- Traffic enters the system via **HTTPS Request**, marking the boundary of public access.

## Network Edge Zone

- **Firewall** filters incoming traffic based on rules.
- **Reverse Proxy (Nginx)** handles SSL termination and routing.
- **App Gateway** applies additional routing logic and security policies.
- **Load Balancer (L7)** distributes traffic across app instances.
- **VPN Gateway** allows secure remote access for internal users or services.

## Private App Zone

- **Web App** is the core application layer, serving dynamic content. It connects to:
  - **Primary Database** and Read Replicas for data storage and scaling.
  - **Redis Cache** for performance optimization.
  - **Auth Service** for identity verification, which delegates to an Identity Provider.
  - **Audit Logger** for compliance and traceability, forwarding logs to a SIEM system.

## Observability (Monitoring & Tracing)

- **Metrics Exporter** and Tracing Agent collect telemetry.
- Data flows to **Prometheus** (metrics) and **Jaeger** (traces) for monitoring and debugging.

## CI/CD Pipeline

- **Git Repo** stores source code.
- **Build Agent** compiles and tests the code.
- **Container Registry** stores built images.
- **Deployment Job** pushes updates to the **Web App**, completing the automation loop.

## Access Control Highlights

- **Public Zone**: No authentication; DNS and browser-level interactions.
- **Edge Zone**: First line of defense; includes firewall, proxy, and gateway logic.
- **Private Zone**: All services require authentication and authorization.
- **VPN Gateway**: Bypasses public ingress for privileged users (e.g. ops or staging testers).

## Traffic Types

- **North-South**: External user traffic entering the system.
- **East-West**: Internal service-to-service communication.
- **Telemetry**: Observability traffic for metrics and tracing.

## Environment Overlays

CI/CD pipeline supports branch-based staging, with promotion to production gated by deployment jobs.
This could be extended with environment-specific secrets, feature flags, or blue/green deployments if needed.
