# Architectures of AWS, GCP, Azure

Architectural descriptions of AWS, GCP, and Azure are presented here at a level crafted for my own reference and growing understanding — detailed enough to be meaningful, yet concise enough to avoid cloud-induced vertigo.

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

The following is a simplified representation of the AWS architecture:  

<!-- ALT: AWS architecture diagram showing global infrastructure with regions and availability zones at top. User connects via Route 53 DNS and CloudFront CDN to Elastic Load Balancer, which distributes traffic to compute services: EC2 instances, ECS/EKS containers, and Lambda functions. These connect to data layer containing RDS relational database, DynamoDB NoSQL database, and S3 object storage. DevOps pipeline flows from CodeCommit source repository through CodeBuild and CodeDeploy back to load balancer. Security layer includes AWS IAM, Secrets Manager, and GuardDuty threat detection. Observability provided by CloudWatch monitoring and CloudTrail audit logs. -->  

```mermaid
graph TD
    %% GLOBAL INFRASTRUCTURE
    subgraph GlobalInfra["Global Infrastructure"]
        J1[AWS Regions]:::global
        J2[Availability Zones]:::global
        J1 --> J2
    end

    %% USER ENTRY
    User[Developer/User] -->|HTTPS| Route53[Route 53 - DNS]:::net
    Route53 --> CloudFront[CloudFront - CDN]:::net
    CloudFront --> ELB[Elastic Load Balancer]:::net

    %% NETWORKING
    subgraph Networking
        VPC[VPC - Virtual Private Cloud]:::net
        Subnet1[Public Subnet]:::net
        Subnet2[Private Subnet]:::net
        NACL[Security Groups / NACL]:::net
        VPC --> Subnet1
        VPC --> Subnet2
        Subnet1 --> NACL
    end

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
    subgraph DevOps
        CodeCommit[CodeCommit - Source Repo]:::devops
        CodeBuild[CodeBuild - Build]:::devops
        CodeDeploy[CodeDeploy - Deployment]:::devops
        CodeCommit --> CodeBuild
        CodeBuild --> CodeDeploy
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

    %% CONNECTIONS TO MONITORING
    RDS --> CloudWatch
    S3 --> CloudWatch
    DynamoDB --> CloudWatch
    IAM --> GuardDuty
    GuardDuty --> CloudTrail

    %% STYLES
    classDef global fill:#eaf5ff,stroke:#3a87ad
    classDef net fill:#eaffea,stroke:#4a934a
    classDef compute fill:#fff0e6,stroke:#d96c00
    classDef data fill:#fffde6,stroke:#b3b300
    classDef devops fill:#f5e6ff,stroke:#6b2f99
    classDef sec fill:#ffe6e6,stroke:#cc0000
    classDef obs fill:#f2f2f2,stroke:#555
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

<!-- ALT: GCP architecture diagram showing global infrastructure with regions and zones. User connects through Cloud DNS and Cloud CDN to Cloud Load Balancing, which routes to compute layer: Compute Engine VMs, GKE Kubernetes clusters, and Cloud Run serverless containers. Data layer contains Cloud SQL, Firestore NoSQL, Bigtable, and BigQuery analytics. DevOps flows from Cloud Source Repositories through Cloud Build to continuous deployment back to load balancer. Security managed by GCP IAM, Cloud KMS, and Security Command Centre. Observability through Cloud Monitoring and Cloud Logging. -->  

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
        SCC[Security Command Centre]:::sec
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


<!-- ALT: Azure architecture diagram with global regions and availability zones. User connects via Azure DNS and Front Door CDN to Azure Load Balancer and Application Gateway, routing to compute services: Virtual Machines, App Service PaaS, and Azure Kubernetes Service. Data layer includes Azure SQL Database, Cosmos DB NoSQL, and Blob Storage. DevOps pipeline flows from Azure Repos through Azure Pipelines build system to Release Management. Security provided by Azure Active Directory, Key Vault, and Microsoft Defender for Cloud. Observability through Azure Monitor, Log Analytics Workspace, and Security Centre. -->  

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
        SecurityCentre[Security Centre]:::obs
    end

    AzureSQL --> Monitor
    CosmosDB --> Monitor
    Blob --> Monitor
    AAD --> Defender
    Defender --> SecurityCentre

    %% STYLES
    classDef global fill:#eaf5ff,stroke:#3a87ad;
    classDef net fill:#eaffea,stroke:#4a934a;
    classDef compute fill:#fff0e6,stroke:#d96c00;
    classDef data fill:#fffde6,stroke:#b3b300;
    classDef devops fill:#f5e6ff,stroke:#6b2f99;
    classDef sec fill:#ffe6e6,stroke:#cc0000;
    classDef obs fill:#f2f2f2,stroke:#555;
```


