# Mermaid Diagrams

## flowchart TB

```mermaid
flowchart TB
    accTitle: IBM SanFrancisco Layered Architecture
    accDescr: Diagram showing IBM SanFrancisco's layered architecture. Arrows connect layers from top to bottom: User Interface → Business Logic → Foundation Services → JVM → Operating System. SanFrancisco encompasses the Business Logic and Foundation layers, positioned between application code and the JVM.
    
    UI[User Interface Layer] --> BL[Business Logic Layer]
    BL --> FS[Foundation Services Layer]
    FS --> JVM[Java Virtual Machine]
    JVM --> OS[Operating System]
    subgraph IBM_SanFrancisco["IBM SanFrancisco"]
        BL
        FS
    end
```

## Sequence

```mermaid
sequenceDiagram
accTitle: Sequence diagram showing client-server commumnication.
accDescr: Sequence diagram showing client-server commumnication: Client sends a login request to server, and server returns an authorization token.
  participant Client
  participant Server
  Client->>Server: Send login request
  Server-->>Client: Return auth token
```

## graph TD  

```mermaid
graph TD
    trigger["GitHub Actions Trigger"]
    checkout["Checkout Repository"]
    buildx["Setup Docker Buildx"]
    dockerBuild["Build Docker Image"]
    verifyMermaid["Verify mermaid.min.js Presence"]
    mkdocsBuild["Build MkDocs Site in Docker"]
    verifyOutput["Verify Build Output"]
    essentialCheck{"Essential Files Present?"}
    success["Workflow Succeeds"]
    fail["Workflow Fails with Diagnostics"]
    
    trigger --> checkout
    checkout --> buildx
    buildx --> dockerBuild
    dockerBuild --> verifyMermaid
    verifyMermaid --> mkdocsBuild
    mkdocsBuild --> verifyOutput
    verifyOutput --> essentialCheck
    essentialCheck -->|Yes| success
    essentialCheck -->|No| fail
```

