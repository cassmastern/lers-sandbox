# Network Security and Threat Modeling — STRIDE  

STRIDE is a threat modeling framework developed by Microsoft that helps identify potential security threats in software systems, focusing on categories like Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, and Elevation of privilege.  

## Our Hypothetical Data Center Network, STRIDE-Annotated

```mermaid
flowchart TD
  %% Public Zone — S, R
  subgraph Public_Zone["Public Zone (Spoofing, Repudiation)"]
    A[User]
    B[Browser]
    C[DNS Resolver]
  end

  %% Edge Zone — S, T, I, D
  subgraph Edge_Zone["Network Edge Zone (Spoofing, Tampering, Info Disclosure, Denial of Service)"]
    D[HTTPS Request]
    E[Firewall\nIngress ACLs]
    F[Reverse Proxy - Nginx\nHeader Sanitization]
    G[App Gateway\nTLS Termination]
    LB[Load Balancer L7\nRate Limiting]
    VPN[VPN Gateway\nPrivileged Access]
  end

  %% Private Zone — R, I, E
  subgraph Private_Zone["Private App Zone (Repudiation, Info Disclosure, Elevation of Privilege)"]
    WA[Web App\nRBAC + Input Validation]
    DB[Primary Database\nEncrypted at Rest]
    Cache[Redis Cache\nTTL + ACLs]
    Auth[Auth Service\nOAuth2 + JWT]
    Audit[Audit Logger\nImmutable Store]
    Replicas[Read Replicas\nRead-Only]
    IdP[Identity Provider\nFederated Trust]
    SIEM[SIEM Integration\nSecurity Alerts]
  end

  %% Observability — I, R
  subgraph Observability["Monitoring and Tracing (Info Disclosure, Repudiation)"]
    Metrics[Metrics Exporter]
    Traces[Tracing Agent]
    Prometheus[Prometheus\nAccess Controls]
    Jaeger[Jaeger\nTrace Retention]
  end

  %% CI/CD — T, E
  subgraph CI_CD["CI/CD Pipeline (Tampering, Elevation of Privilege)"]
    Git[Git Repository\nBranch Protections]
    Runner[Build Agent\nSandboxed]
    Registry[Container Registry\nSigned Images]
    Deploy[Deployment Job\nRole Separation]
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

## Stride Breakdown

| Threat                     | Examples in Diagram              | Mitigations                                                   |
| ---------------------------- | ---------------------------------- | --------------------------------------------------------------- |
| **Spoofing**               | Fake user/IP, DNS poisoning      | TLS everywhere, VPN for privileged access, DNSSEC             |
| **Tampering**              | Malicious config/image injection | Signed containers, branch protections, proxy header scrubbing |
| **Repudiation**            | No audit trail for actions       | Immutable audit logs, SIEM integration                        |
| **Information Disclosure** | Leaky metrics, exposed headers   | RBAC, encrypted storage, observability ACLs                   |
| **Denial of Service**      | Traffic floods, cache exhaustion | Rate limiting, load balancing, firewall rules                 |
| **Elevation of Privilege** | CI/CD abuse, misconfigured roles | Role separation, scoped tokens, RBAC enforcement              |
