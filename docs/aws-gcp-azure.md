# Architectures of AWS, GCP, Azure

Below are descriptions of AWS, GCP, and Azure architectures at a reasonably high level (to avoid vertigo).

**Legend for the diagrams** 

🟦 Global Infrastructure  
🟩 Networking  
🟧 Compute  
🟨 Databases / Storage  
🟪 DevOps  
🟥 Security  
⬜ Observability

***Note:*** Diagrams are conceptual simplifications.

------------------------------------------------------------------------

## AWS Architecture

AWS provides the most mature and expansive ecosystem among the three
major cloud providers, with over 200 services spanning compute, storage,
networking, AI/ML, analytics, and IoT. Its architecture is built around
flexibility, allowing organizations to choose between traditional VMs
(EC2), containers (ECS and EKS), or serverless (Lambda)
depending on workload needs.

A defining feature of AWS is its global infrastructure---multiple
regions, each with multiple availability zones---paired with services
like Route 53 for intelligent DNS routing and CloudFront for
low-latency content delivery. Compared to GCP and Azure, AWS offers the
widest service diversity and a strong track record in enterprise
reliability, though it can also be more complex to navigate due to
sheer scale.

```mermaid
graph TD
    %% GLOBAL INFRASTRUCTURE
    subgraph Global Infrastructure
        J1[AWS Regions]:::global --> J2[Availability Zones]:::global
    end

    %% NETWORKING
    subgraph Networking
        VPC[VPC - Virtual Private Cloud]:::net --> Subnet1[Public Subnet]:::net
        VPC --> Subnet2[Private Subnet]:::net
        Subnet1 --> NACL[Security Groups / NACL]:::net
    end

    %% ENTRY FLOW
    User[Developer/User] -->|HTTPS| Route53[Route 53 - DNS]:::net
    Route53 --> CloudFront[CloudFront - CDN]:::net
    CloudFront --> ELB[Elastic Load Balancer]:::net

    %% COMPUTE
    subgraph Compute
        EC2[EC2 Instances]:::compute
        ECS[ECS/EKS - Containers]:::compute
        Lambda[Lambda Functions]:::compute
    end
    ELB --> EC2
    ELB --> ECS
    ELB --> Lambda

    %% DATABASE / STORAGE
    subgraph Data
        RDS[RDS - Relational DB]:::data
        DynamoDB[DynamoDB - NoSQL DB]:::data
        S3[S3 - Object Storage]:::data
    end
    EC2 --> RDS
    ECS --> DynamoDB
    Lambda --> S3

    %% DEVOPS
    subgraph DevOps / CI-CD
        CodeCommit[CodeCommit - Source Repo]:::devops --> CodeBuild[CodeBuild - Build]:::devops
        CodeBuild --> CodeDeploy[CodeDeploy - Deployment]:::devops
        CodeDeploy --> ELB
    end

    %% SECURITY
    subgraph Security
        IAM[AWS IAM]:::sec
        Secrets[Secrets Manager]:::sec
        GuardDuty[GuardDuty - Threat Detection]:::sec
    end

    %% OBSERVABILITY
    subgraph Observability
        CloudWatch[CloudWatch - Monitoring & Logging]:::obs
        CloudTrail[CloudTrail - Audit Logs]:::obs
    end

    RDS --> CloudWatch
    S3 --> CloudWatch
    DynamoDB --> CloudWatch
    IAM --> GuardDuty
    GuardDuty --> CloudTrail

    %% STYLES
    classDef global fill:#eaf5ff,stroke:#3a87ad;
    classDef net fill:#eaffea,stroke:#4a934a;
    classDef compute fill:#fff0e6,stroke:#d96c00;
    classDef data fill:#fffde6,stroke:#b3b300;
    classDef devops fill:#f5e6ff,stroke:#6b2f99;
    classDef sec fill:#ffe6e6,stroke:#cc0000;
    classDef obs fill:#f2f2f2,stroke:#555;
```

## GCP Architecture

GCP takes a developer-friendly, data-first approach, with a strong
focus on analytics, AI/ML, and global networking. Services like
BigQuery make it a go-to platform for large-scale analytics, while
AI Platform integrates deeply with TensorFlow and Vertex AI for
machine learning workflows. Its Kubernetes-first mindset is evident
with GKE, widely considered one of the best managed Kubernetes
services.

A standout difference is GCP's global load balancing---offering
worldwide traffic management from a single anycast IP, unlike AWS's
region-based approach. This reduces complexity for multi-region apps.
While GCP's service catalog is smaller than AWS and Azure, it is often
seen as simpler and cleaner for greenfield projects, but it may lack
the enterprise depth and hybrid-cloud features of Azure.

```mermaid
graph TD
    subgraph GlobalInfra["Global Infrastructure"]
        GR1[GCP Regions]:::global --> GR2[Zones]:::global
    end
    
    subgraph NetworkLayer["Networking"]
        VPC[VPC Network]:::net --> Subnet1[Subnets]:::net
        Subnet1 --> Firewall[Firewall Rules]:::net
    end
    
    User[Developer/User] --> CloudDNS[Cloud DNS]:::net
    CloudDNS --> CloudCDN[Cloud CDN]:::net
    CloudCDN --> LoadBalancer[Cloud Load Balancing]:::net
    
    subgraph ComputeLayer["Compute"]
        Compute[Compute Engine VMs]:::compute
        GKE[GKE Kubernetes]:::compute
        CloudRun[Cloud Run Serverless]:::compute
    end
    
    LoadBalancer --> Compute
    LoadBalancer --> GKE
    LoadBalancer --> CloudRun
    
    subgraph DataLayer["Data"]
        CloudSQL[Cloud SQL]:::data
        Firestore[Firestore NoSQL]:::data
        Bigtable[Bigtable]:::data
        BigQuery[BigQuery]:::data
    end
    
    Compute --> CloudSQL
    GKE --> Firestore
    CloudRun --> Bigtable
    GKE --> BigQuery
    
    subgraph DevOpsLayer["DevOps CICD"]
        SourceRepo[Cloud Source Repositories]:::devops --> CloudBuild[Cloud Build]:::devops
        CloudBuild --> Deploy[Continuous Deploy]:::devops
        Deploy --> LoadBalancer
    end
    
    subgraph SecurityLayer["Security"]
        IAM[GCP IAM]:::sec
        KMS[Cloud KMS]:::sec
        SCC[Security Command Center]:::sec
    end
    
    subgraph ObservabilityLayer["Observability"]
        Monitoring[Cloud Monitoring]:::obs
        Logging[Cloud Logging]:::obs
    end
    
    CloudSQL --> Monitoring
    Firestore --> Monitoring
    Bigtable --> Monitoring
    IAM --> SCC
    SCC --> Logging
    
    classDef global fill:#eaf5ff,stroke:#3a87ad
    classDef net fill:#eaffea,stroke:#4a934a
    classDef compute fill:#fff0e6,stroke:#d96c00
    classDef data fill:#fffde6,stroke:#b3b300
    classDef devops fill:#f5e6ff,stroke:#6b2f99
    classDef sec fill:#ffe6e6,stroke:#cc0000
    classDef obs fill:#f2f2f2,stroke:#555
```

## Azure Architecture

Azure stands out for its deep Microsoft ecosystem integration,
making it a natural choice for organizations already invested in
Windows Server, Active Directory, and Microsoft 365. Its
architecture supports hybrid-cloud setups exceptionally well through
Azure Arc and ExpressRoute, enabling seamless connectivity
between on-premises and cloud environments. For compute, it offers
flexibility between VMs, App Service for PaaS, and AKS for
container orchestration.

Compared to AWS and GCP, Azure often leads in compliance
certifications, enterprise contracts, and hybrid scenarios.
However, its service naming conventions can be confusing, and it
sometimes lags AWS in early adoption of new service categories. For
enterprises looking for tight integration with Microsoft tools and
hybrid capabilities, Azure is often the top pick.

```mermaid
graph TD
    %% GLOBAL INFRASTRUCTURE
    subgraph Global Infrastructure
        AR1[Azure Regions]:::global --> AR2[Availability Zones]:::global
    end

    %% NETWORKING
    subgraph Networking
        VNet[Virtual Network]:::net --> Subnet1[Public Subnet]:::net
        VNet --> Subnet2[Private Subnet]:::net
        Subnet1 --> NSG[Network Security Group]:::net
    end

    %% ENTRY FLOW
    User[Developer/User] --> AzureDNS[Azure DNS]:::net
    AzureDNS --> FrontDoor[Azure Front Door / CDN]:::net
    FrontDoor --> ALB[Azure Load Balancer]:::net
    FrontDoor --> AppGW[Application Gateway]:::net

    %% COMPUTE
    subgraph Compute
        VMs[Azure Virtual Machines]:::compute
        AppService[Azure App Service]:::compute
        AKS[Azure Kubernetes Service]:::compute
    end
    ALB --> VMs
    AppGW --> AppService
    AppGW --> AKS

    %% DATABASE / STORAGE
    subgraph Data
        AzureSQL[Azure SQL DB]:::data
        CosmosDB[Cosmos DB]:::data
        Blob[Blob Storage]:::data
    end
    VMs --> AzureSQL
    AppService --> CosmosDB
    AKS --> Blob

    %% DEVOPS
    subgraph DevOps / CI-CD
        Repos[Azure Repos]:::devops --> Pipelines[Azure Pipelines - Build]:::devops
        Pipelines --> Release[Release Management]:::devops
        Release --> AppGW
    end

    %% SECURITY
    subgraph Security
        AAD[Azure Active Directory]:::sec
        KeyVault[Azure Key Vault]:::sec
        Defender[Microsoft Defender for Cloud]:::sec
    end

    %% OBSERVABILITY
    subgraph Observability
        Monitor[Azure Monitor]:::obs
        LogAnalytics[Log Analytics Workspace]:::obs
        SecurityCenter[Security Center]:::obs
    end

    AzureSQL --> Monitor
    CosmosDB --> Monitor
    Blob --> Monitor
    AAD --> Defender
    Defender --> SecurityCenter

    %% STYLES
    classDef global fill:#eaf5ff,stroke:#3a87ad;
    classDef net fill:#eaffea,stroke:#4a934a;
    classDef compute fill:#fff0e6,stroke:#d96c00;
    classDef data fill:#fffde6,stroke:#b3b300;
    classDef devops fill:#f5e6ff,stroke:#6b2f99;
    classDef sec fill:#ffe6e6,stroke:#cc0000;
    classDef obs fill:#f2f2f2,stroke:#555;
```


