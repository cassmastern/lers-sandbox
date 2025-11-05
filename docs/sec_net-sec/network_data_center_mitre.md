# Network Security and Threat Modeling — MITRE ATT&CK

## Why It Matters

MITRE ATT&CK is a globally recognized framework that catalogs real-world adversary behaviors. Mapping ATT&CK techniques to our architecture helps anticipate attacker tactics and improve detection, response, and resilience.

## ATT&CK-Based Threat Modeling

This section applies MITRE ATT&CK techniques to our hypothetical data centre network, highlighting how adversaries might target specific components and how defenders can respond.

### ATT&CK-Annotated Network Diagram

The diagram below maps ATT&CK techniques to each component, helping visualize potential adversary behaviors and attack paths.  

```mermaid
graph TB
    accTitle: MITRE ATT&CK annotated network diagram
    accDescr: MITRE ATT&CK annotated network diagram showing user device connecting to Azure Cloud containing CDN with T1584.006 technique, Web App with T1190 exploit technique, network layer with firewall T1040 network sniffing and VPN gateway T1133 external remote services, CI/CD and monitoring components with T1059 command scripting, T1005 data collection, and T1082 system discovery techniques. Internal systems show dev workstation T1078 valid accounts, Git repo T1505.003 repository implant, secrets vault T1555 credential access, and database T1071.001 application layer protocol techniques.
    User[User Device]
    
    subgraph "Azure Cloud"
        CDN[CDN<br>T1584.006<br> Compromise CDN<br> Infrastructure]
        WA[Web App<br>T1190<br> Exploit Public-Facing App]
        
        subgraph "Network Layer"
            FW[Firewall<br>T1040<br> Network Sniffing]
            VPN[VPN Gateway<br>T1133<br> External Remote Services]
        end
        
        subgraph "CI/CD & Monitoring"
            CI[CI/CD Runner<br>T1059<br> Command and Scripting<br> Interpreter]
            Logs[Log Aggregator<br>T1005<br> Data from Local System]
            Monitor[Monitoring<br>T1082<br> System Information<br> Discovery]
        end
    end
    
    subgraph "Internal Systems"
        Dev[Dev Workstation<br>T1078<br> Valid Accounts]
        Repo[Git Repo<br>T1505.003<br> Implant Internal<br> Repository]
        Secrets[Secrets Vault<br>T1555<br> Credentials from<br> Password Stores]
        DB[Database<br>T1071.001<br> Application Layer<br> Protocol - Web]
    end

    %% Main flow connections
    User --> CDN
    CDN --> WA
    WA --> FW
    FW --> VPN
    
    %% CI/CD connections
    VPN --> CI
    CI --> Logs
    CI --> Monitor
    CI --> Repo
    CI --> Secrets
    CI --> DB
    
    %% Dev connections
    Dev --> VPN
    Dev --> Repo
```

### Technique Highlights

This table summarizes key ATT&CK techniques associated with major components in the network, along with brief descriptions of how each technique might be used.

| Component             | ATT&CK Technique                           | Description                                        |
| ----------------------- | -------------------------------------------- | ---------------------------------------------------- |
| Web App               | T1190 – Exploit Public-Facing App         | Entry point for attackers via vulnerable endpoints |
| VPN Gateway           | T1133 – External Remote Services          | Target for credential stuffing or VPN exploits     |
| CI/CD Runner          | T1059 – Command and Scripting Interpreter | Abuse of build scripts or injected commands        |
| Secrets Vault         | T1555 – Credentials from Password Stores  | Target for secret exfiltration                     |
| Git Repo              | T1505.003 – Implant Internal Repository   | Malicious code or backdoors in source control      |
| CDN                   | T1584.006 – Compromise CDN Infrastructure | Supply chain risk via third-party CDN              |
| Firewall              | T1040 – Network Sniffing                  | Potential for traffic inspection or bypass         |
| Monitoring Service    | T1082 – System Information Discovery      | Reconnaissance via telemetry                       |
| Log Aggregator        | T1005 – Data from Local System            | Target for log tampering or data theft             |
| Developer Workstation | T1078 – Valid Accounts                    | Abuse of developer credentials                     |


### Zone-Based Threat Mapping

The following tables break down ATT&CK tactics and techniques by architectural zone, offering targeted defenses for each component.

#### Public & Edge Zones


| Component     | ATT&CK Tactics            | Techniques                                      | Defenses                                 |
| --------------- | --------------------------- | ------------------------------------------------- | ------------------------------------------ |
| DNS Resolver  | Initial Access            | DNS Spoofing (T1565.001)                        | DNSSEC, trusted resolvers                |
| Reverse Proxy | Defense Evasion           | Proxy Configuration Tampering (T1556.007)       | Header sanitization, config immutability |
| App Gateway   | Initial Access, Execution | Exploit Public-Facing App (T1190)               | WAF rules, TLS termination               |
| VPN Gateway   | Lateral Movement          | Valid Accounts (T1078), Remote Services (T1021) | MFA, IP allowlists, session logging      |

#### Private App Zone


| Component         | ATT&CK Tactics                  | Techniques                                                                    | Defenses                                           |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Web App           | Execution, Privilege Escalation | Command-Line Interface (T1059), Exploitation for Privilege Escalation (T1068) | RBAC, input validation, container isolation        |
| Auth Service      | Credential Access               | Brute Force (T1110), Credential Dumping (T1003)                               | Rate limiting, JWT expiration, audit logging       |
| Database          | Collection, Exfiltration        | Data from Information Repositories (T1213), Automated Exfiltration (T1020)    | Encryption at rest, query logging, role separation |
| Audit Logger      | Impact                          | Inhibit System Recovery (T1490)                                               | Immutable logs, off-host storage                   |
| Identity Provider | Initial Access                  | External Remote Services (T1133), Valid Accounts (T1078)                      | SAML/OIDC hardening, federation trust boundaries   |

### Observability & CI/CD

| Component          | ATT&CK Tactics         | Techniques                                         | Defenses                          |
| -------------------- | ------------------------ | ---------------------------------------------------- | ----------------------------------- |
| Metrics Exporter   | Information Disclosure | Automated Collection (T1119)                       | ACLs, metric filtering            |
| CI/CD Runner       | Execution, Persistence | Compiled HTML File (T1223), Scheduled Task (T1053) | Sandbox builds, ephemeral runners |
| Container Registry | Defense Evasion        | Signed Binary Proxy Execution (T1218)              | Image signing, access controls    |
| Deployment Job     | Privilege Escalation   | Abuse Elevation Control Mechanism (T1548)          | Role separation, audit trails     |

## Defensive Enhancements

To strengthen defenses, consider the following enhancements aligned with ATT&CK-informed detection and response strategies.

* **SIEM Enrichment**: Map logs to ATT&CK techniques for faster triage.
* **Threat Detection Rules**: Use Sigma or MITRE D3FEND to write detection logic.
* **Red Team Scenarios**: Simulate TTPs like T1078 (Valid Accounts) or T1190 (Exploit Public-Facing App).
* **Purple Teaming**: Validate defenses by emulating known adversary behavior (e.g. APT29, FIN7).

---

2025.08.14
