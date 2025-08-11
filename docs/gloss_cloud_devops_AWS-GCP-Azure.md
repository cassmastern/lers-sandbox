# Cross-Platform Cloud & DevOps Glossary (AWS, GCP, Azure)

> A compact, side-by-side glossary of key cloud components and technologies across **AWS**, **Google Cloud Platform (GCP)**, and **Microsoft Azure**. Emphasis on DevOps-related services and equivalents. Where a component is absent, that is noted. 

---

## How Content is Organized

- This page lists common categories (Compute, Storage, Networking, IAM, DevOps/CI·CD, Containers, Serverless, Databases, Monitoring & Logging, Infrastructure as Code, Security & Secrets, Messaging & Eventing, CDN & Edge, Machine Learning, Cost & Governance).
- Each category lists the main service(s) of **AWS | GCP | Azure**, with descriptions and notable differences.

[could end up being useful as a reference or translation table when moving architectures or writing runbooks]

---

## Compute

### Virtual Machines / Instances

- **AWS:** *EC2 (Elastic Compute Cloud)* — general-purpose VMs, many instance types (spot, reserved, on-demand).
- **GCP:** *Compute Engine* — similar VM offering; strong live-migration capabilities.
- **Azure:** *Virtual Machines* — comparable VM service with deep Windows integration.

### Autoscaling / Instance Groups

- **AWS:** *Auto Scaling Groups (ASG)* — autoscale EC2 fleets (can integrate with EC2 Spot, mixed instances).
- **GCP:** *Managed Instance Groups (MIGs)* — autoscaled instance groups with regional support.
- **Azure:** *Virtual Machine Scale Sets (VMSS)* — autoscaling for VM fleets.

### Bare metal / dedicated hosts

- **AWS:** *EC2 Dedicated Hosts / Bare Metal instances*.
- **GCP:** *Bare Metal Solution* (for some workloads).
- **Azure:** *Azure Dedicated Host*.

---

## Containers & Orchestration

### Managed Kubernetes

- **AWS:** *EKS (Elastic Kubernetes Service)* — managed control plane; many integrations with AWS services.
- **GCP:** *GKE (Google Kubernetes Engine)* — often viewed as the most mature managed Kubernetes experience.
- **Azure:** *AKS (Azure Kubernetes Service)* — native Azure AD integration.

### Container Services (non-K8s)

- **AWS:** *ECS (Elastic Container Service)* & *Fargate* (serverless containers). ECS is AWS-specific; Fargate runs containers serverlessly on both ECS and EKS.
- **GCP:** *Cloud Run* — serverless containers (Knative-based); *GKE Autopilot* for managed node control.
- **Azure:** *Azure Container Instances (ACI)* — serverless single-container instances; Azure also offers container apps (Azure Container Apps) for serverless containers.

### Container Registry

- **AWS:** *ECR (Elastic Container Registry)*.
- **GCP:** *Artifact Registry* (formerly Container Registry + Artifact Registry consolidation).
- **Azure:** *Azure Container Registry (ACR)*.

---

## Serverless

### Functions (FaaS)

- **AWS:** *Lambda* — event-driven functions with broad triggers and custom runtimes.
- **GCP:** *Cloud Functions* — event-driven; integrates tightly with Firebase and Pub/Sub.
- **Azure:** *Azure Functions* — strong tooling for .NET/Windows stacks; Durable Functions for workflows.

### Serverless containers / app platforms

- **AWS:** *AWS App Runner* (PaaS for containers), *Lambda* (for small workloads).
- **GCP:** *Cloud Run* — first-class serverless containers.
- **Azure:** *Azure Container Apps* / *App Service*.

---

## Storage & Files

### Object Storage

- **AWS:** *S3 (Simple Storage Service)* — durable object storage; ecosystem of lifecycle, events, and storage classes.
- **GCP:** *Cloud Storage* — similar object semantics (multi-region, nearline, coldline).
- **Azure:** *Azure Blob Storage* — object storage with tiers (Hot/Cool/Archive).

### Block Storage

- **AWS:** *EBS (Elastic Block Store)* — persistent block devices for EC2.
- **GCP:** *Persistent Disks* — block storage for Compute Engine.
- **Azure:** *Managed Disks* — block storage for Azure VMs.

## Files / Shared File Systems

- **AWS:** *EFS (Elastic File System)* — NFS for Linux; *FSx* for Windows (Lustre, FSx for Windows File Server).
- **GCP:** *Filestore* — managed NFS for GCE/GKE.
- **Azure:** *Azure Files* — SMB/NFS share with managed storage; *Azure NetApp Files* for high-performance needs.

---

## Networking

### Virtual Networks

- **AWS:** *VPC (Virtual Private Cloud)* — subnets, route tables, security groups, NACLs.
- **GCP:** *VPC Network* — global VPC, subnets are regional.
- **Azure:** *Virtual Network (VNet)* — similar concept; supports peering.

### Load Balancers / Traffic Management

- **AWS:** *ELB family — ALB (Layer 7), NLB (Layer 4), CLB (classic, legacy)*; *Route 53* for DNS & routing policies.
- **GCP:** *Cloud Load Balancing (HTTP(S), TCP/SSL, Internal LB)*; *Cloud DNS*.
- **Azure:** *Azure Load Balancer (L4), Application Gateway (L7), Front Door (global L7 / CDN + WAF)*; *Azure DNS*.

### API Gateway

- **AWS:** *Amazon API Gateway* (REST/WebSocket) and *HTTP API* (lighter-weight).
- **GCP:** *API Gateway* and *Endpoint* (ESPv2/OpenAPI via Cloud Endpoints).
- **Azure:** *Azure API Management (APIM)*.

### Service Mesh (managed)

- **AWS:** no single managed first-party service, but AWS App Mesh exists as a managed control-plane compatible with Envoy.
- **GCP:** no first-class managed service mesh product; Anthos Service Mesh is available (based on Istio) for Anthos users.
- **Azure:** *Azure Service Fabric* (different paradigm) and can run Istio/Linkerd on AKS; no ubiquitous managed Istio across all customers.

---

## Identity & Access Management (IAM)

- **Identity & Access**
  - **AWS:** *IAM (Identity and Access Management)* for users/roles/policies; *AWS Organizations* for multi-account management; *Cognito* for app identity.
  - **GCP:** *Cloud IAM* (resource-centric roles) and *Cloud Identity / Identity Platform* for user auth; *Organizations / Folders* for resource hierarchy.
  - **Azure:** *Azure Active Directory (Azure AD)* — identity platform for users, apps, and service principals; *Azure RBAC* for resource permissions.

---

## DevOps / CI · CD

(Emphasis: build, test, deploy, artifact storage, release orchestration)

### CI/CD Platforms / Pipelines

- **AWS:** *AWS CodePipeline* (orchestration), *CodeBuild* (build), *CodeDeploy* (deployment), *CodeCommit* (git). These are AWS-native but many teams use third-party CI (GitHub Actions, Jenkins, GitLab CI, CircleCI).
- **GCP:** *Cloud Build* (build & simple pipelines); *Cloud Deploy* (continuous delivery) is newer; many integrate with Cloud Source Repositories or GitHub.
- **Azure:** *Azure DevOps Pipelines* — full feature CI/CD, with Boards, Repos, Artifacts; also *GitHub Actions* (Microsoft owns GitHub) is widely used.

### Artifact Repositories / Package Management

- **AWS:** *CodeArtifact* for npm/Maven/PyPI packages; *ECR* for container images.
- **GCP:** *Artifact Registry* — packages & container images.
- **Azure:** *Azure Artifacts* (part of Azure DevOps) and *ACR* for containers.

### Build/Runner Infrastructure

- **AWS:** CodeBuild or self-hosted runners on EC2/EKS; *Batch* for heavy workloads.
- **GCP:** Cloud Build pools or self-hosted runners.
- **Azure:** Hosted agents in Azure DevOps, self-hosted agents, or GitHub-hosted runners.

### Release & Feature Management

- **AWS:** no first-party feature flag service (third-party options common). AWS AppConfig is for feature/config rollout.
- **GCP:** no widely used managed feature flagging product; third-party tools used.
- **Azure:** *Azure App Configuration* for feature toggles; also third-party solutions.

### Blue/Green & Canary Support

All three clouds support blue/green and canary deployments via their LB + deployment services, or through Kubernetes operators and traffic-shifting tools.

- **AWS CodeDeploy** has built-in blue/green hooks;
- **GCP Cloud Deploy** supports progressive delivery;
- **Azure DevOps** can orchestrate staged deployments.

### Secret Management (for DevOps)

- **AWS:** *Secrets Manager* (rotating secrets), *Systems Manager Parameter Store* (less feature-rich but free tier).
- **GCP:** *Secret Manager* — integrated with IAM and audit logging.
- **Azure:** *Azure Key Vault* — keys, secrets, certificates; integrates with Managed Identities.

### Infrastructure Automation (DevOps-focused)

  - See Infrastructure as Code section below (CloudFormation / Deployment Manager / ARM / Bicep / Terraform).

---

## Infrastructure as Code (IaC)

### Native / Cloud Template Tools

  - **AWS:** *CloudFormation* — declarative templates (YAML/JSON), supports change sets, drift detection.
  - **GCP:** *Deployment Manager* (less popular); *Cloud Deployment Manager* has limited adoption compared to Terraform.
  - **Azure:** *ARM Templates* (JSON) and *Bicep* (domain-specific language, recommended over raw ARM).

## Cross-cloud / De-facto standard

  - **Terraform (HashiCorp)** — widely used across all three clouds; stateful, declarative; large provider ecosystem.

### Config Management

  - **AWS:** supports Puppet, Chef, Ansible; *AWS Systems Manager (SSM)* includes State Manager and Run Command for remote execution.
  - **GCP:** supports the same tools; *OS Config* provides patching and config management.
  - **Azure:** supports Ansible, Chef, Puppet; *Azure Automation* for runbooks and update management.

---

## Databases (Managed)

### Relational / RDBMS

  - **AWS:** *RDS* (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora). *Aurora* is Amazon's cloud-native, compatible DB with better performance.
  - **GCP:** *Cloud SQL* (MySQL, PostgreSQL, SQL Server). *Spanner* for globally-distributed relational DB (unique differentiator).
  - **Azure:** *Azure SQL Database* (managed SQL Server-compatible), *Azure Database for PostgreSQL/MySQL/MariaDB*.

### NoSQL / Key-Value

  - **AWS:** *DynamoDB* — key-value / document DB with single-digit millisecond latency and global tables.
  - **GCP:** *Firestore / Datastore* — document DB; *Bigtable* for wide-column workloads.
  - **Azure:** *Cosmos DB* — multi-model (key-value, document, graph) with global distribution.

### Data Warehousing

  - **AWS:** *Redshift* — columnar data warehouse.
  - **GCP:** *BigQuery* — serverless, highly scalable analytics engine (query-first model).
  - **Azure:** *Azure Synapse Analytics* (formerly SQL Data Warehouse).

---

## Monitoring, Logging & Observability

### Logging / Log Management

  - **AWS:** *CloudWatch Logs*; *CloudWatch* for metrics and alarms; *X-Ray* for distributed tracing.
  - **GCP:** *Cloud Logging* (formerly Stackdriver Logging); *Cloud Monitoring* for metrics; *Cloud Trace* for distributed tracing.
  - **Azure:** *Azure Monitor* (Logs via Log Analytics), *Application Insights* for app monitoring and traces.

### APM / Tracing / Metrics

  - All providers offer first-party APM/tracing. Third-party options (Datadog, New Relic) are common in multi-cloud setups.

### Managed Prometheus / Metrics

  - **AWS:** *Managed Service for Prometheus* + *Managed Grafana*.
  - **GCP:** *Managed Service for Prometheus* (via Ops) and *Cloud Monitoring* supports Prometheus scraping.
  - **Azure:** *Azure Monitor for Containers* and *Azure Managed Grafana*.

---

## Security & Compliance

### WAF / DDoS Protection

  - **AWS:** *AWS WAF*, *Shield* (Standard included, Advanced paid) for DDoS protection; *Inspector* for vulnerability assessment.
  - **GCP:** *Cloud Armor* (WAF + DDoS protection); *Security Command Center* for posture.
  - **Azure:** *Azure WAF* (part of Application Gateway and Front Door); *Azure DDoS Protection*; *Azure Security Center* (now part of Microsoft Defender for Cloud).

### Key Management

  - **AWS:** *KMS (Key Management Service)* — manage encryption keys; integrates with CloudHSM.
  - **GCP:** *Cloud KMS*.
  - **Azure:** *Key Vault* + *Managed HSM*.

### Policy & Posture Management

  - **AWS:** *AWS Config*, *Security Hub*, *IAM Access Analyzer*.
  - **GCP:** *Security Command Center*, *Organization Policy Service*.
  - **Azure:** *Azure Policy*, *Microsoft Defender for Cloud*.

---

## Messaging, Streaming & Eventing

### Pub/Sub / Messaging

  - **AWS:** *SNS (Simple Notification Service)* for pub/sub and fan-out; *SQS* for queuing.
  - **GCP:** *Pub/Sub* — global messaging/streaming service.
  - **Azure:** *Service Bus* (advanced messaging) and *Event Grid* for event routing; *Queues* for simple queuing.

### Streaming / Event Hub

  - **AWS:** *Kinesis* (Data Streams, Data Firehose) for streaming ingestion.
  - **GCP:** *Dataflow* + *Pub/Sub* for streaming pipelines; *Datastream* for CDC.
  - **Azure:** *Event Hubs* for big data streaming; *Azure Stream Analytics* for real-time processing.

---

## CDN & Edge

### Content Delivery

  - **AWS:** *CloudFront* — global CDN, integrates with S3, Lambda@Edge.
  - **GCP:** *Cloud CDN* — integrates with Cloud Storage and Load Balancing; *Edge CDN* partnerships exist.
  - **Azure:** *Azure CDN* and *Azure Front Door* (global, L7, WAF-capable).

### Edge Compute

  - **AWS:** *Lambda@Edge*, *CloudFront Functions*, *Wavelength* (carrier edge), *IoT Greengrass* for devices.
  - **GCP:** *Cloud Functions (limited)* and partner edge offerings; *Anthos on edge* available for specific cases.
  - **Azure:** *Azure IoT Edge*, *Front Door* + CDN; *Azure Edge Zones*.

---

## Machine Learning & Analytics

### Managed ML Platforms

  - **AWS:** *SageMaker* — end-to-end ML platform (training, deployment, feature store, model registry).
  - **GCP:** *Vertex AI* — integrated platform for training, tuning, and deployment; strong AutoML lineage.
  - **Azure:** *Azure Machine Learning* — model training and lifecycle management.

### Big Data / ETL

  - **AWS:** *Glue* (ETL), *EMR* (managed Hadoop/Spark).
  - **GCP:** *Dataflow* (stream & batch), *Dataproc* (managed Spark/Hadoop).
  - **Azure:** *Data Factory* (ETL), *Synapse* (analytics + orchestration).

---

## Governance, Billing & Cost Management

### Billing & Cost Tools

  - **AWS:** *AWS Cost Explorer*, *Budgets*, *Trusted Advisor* for recommendations.
  - **GCP:** *Cloud Billing* reports and *Cost Management* tools.
  - **Azure:** *Cost Management + Billing* (integrated with Azure Portal).

### Multi-account / Multi-project governance

  - **AWS:** *Organizations*, SCPs (Service Control Policies).
  - **GCP:** *Organizations, Folders, Projects* with IAM policies.
  - **Azure:** *Management Groups* and *Subscriptions*.

---

## Migration & Hybrid Tools

- **Lift & Shift / Migration**

  - **AWS:** *Application Migration Service (MGN)*, *Database Migration Service (DMS)*.
  - **GCP:** *Migrate for Compute Engine*, *Database Migration Service*.
  - **Azure:** *Azure Migrate*, *Database Migration Service*.

### Hybrid / Multi-cloud management

  - **AWS:** *Outposts* (on-premises AWS hardware), *AWS Local Zones / Wavelength*.
  - **GCP:** *Anthos* — consistent K8s & services across on-prem and other clouds.
  - **Azure:** *Azure Arc* — manage on-prem & multi-cloud resources via Azure control plane; *Azure Stack* (on-prem hardware).

---

## Comparative Notes & Observations (DevOps-focused)

- **CI/CD & DevOps tool parity:** All three clouds offer pipeline/orchestration, build, and deployment services. Azure DevOps and GitHub Actions are particularly feature-rich for pipelines; GCP's Cloud Build and Cloud Deploy are improving quickly; AWS Code* tools are feature-complete but often seen as more tightly coupled to AWS.
- **IaC reality:** Terraform is the de-facto standard in multi-cloud organizations. Native templates (CloudFormation, ARM/Bicep, Deployment Manager) are used for deep cloud-specific automation or where an organisation prefers a single-cloud native solution.
- **Secret & identity management:** Each cloud has secrets and key management; Azure AD is the dominant identity provider for enterprise Windows shops while AWS IAM remains resource-centric and flexible for service roles.
- **Managed Kubernetes:** GKE is often praised for reliability and upstream alignment; EKS is the AWS choice with strong integrations; AKS simplifies Azure authentication and Developer Experience for Microsoft stacks.
- **Where features are missing:**

  - **Feature flags:** No first-party feature flagging solution is universally available — clouds provide config rollout tools (AppConfig, App Configuration) but teams often use third-party feature-flag services (LaunchDarkly, Flagsmith).
  - **Managed full-service service mesh:** While all clouds support service mesh tooling, a universal, fully-managed Istio-like control plane is not equally available as a single turnkey service to all customers. Anthos (GCP) and App Mesh (AWS) offer pieces but require setup/management.

---

## Quick Reference: Common DevOps Equivalents

- **CI/CD:** CodePipeline (AWS) ⇄ Cloud Build / Cloud Deploy (GCP) ⇄ Azure DevOps Pipelines / GitHub Actions (Azure)
- **Container registry:** ECR ⇄ Artifact Registry ⇄ ACR
- **Managed K8s:** EKS ⇄ GKE ⇄ AKS
- **Secrets:** Secrets Manager / SSM Parameter Store ⇄ Secret Manager ⇄ Key Vault
- **IaC native:** CloudFormation ⇄ Deployment Manager ⇄ ARM/Bicep
- **Object storage:** S3 ⇄ Cloud Storage ⇄ Blob Storage

---

## Appendix — Suggested repo layout for DevOps docs

```
/docs/
  /architecture/
  /runbooks/
  /ci-cd/
  /kubernetes/
  /iac/
  /monitoring/
  /security/
  glossary.md   <-- this file
```

---

[expandable]
