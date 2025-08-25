# Refactoring

## Sequence

### 1st Iteration
```mermaid
%%{init: {
  "theme": "default",
  "themeVariables": {
    "actorTextColor": "#444",
    "actorBorder": "#888",
    "sequenceArrowStroke": "#888",
    "sequenceArrowFill": "#888",
    "textColor": "#222"
  },
  "accessibility": {
    "title": "User Login Flow",
    "description": "Sequence diagram showing user login interaction between client and server"
  }
}}%%
sequenceDiagram
  participant Client
  participant Server
  Client->>Server: Send login request
  Server-->>Client: Return auth token
```
### 2nd Iteration

```mermaid
%%{init: {
  "theme": "default",
  "themeVariables": {
    "actorTextColor": "#cccccc",
    "actorBorder": "#999999",
    "sequenceArrowStroke": "#cccccc",
    "sequenceArrowFill": "#cccccc",
    "textColor": "#eeeeee"
  },
  "accessibility": {
    "title": "User Login Flow",
    "description": "Sequence diagram showing user login interaction between client and server"
  }
}}%%
sequenceDiagram
  participant Client
  participant Server
  Client->>Server: Send login request
  Server-->>Client: Return auth token
```

### 3rd Iteration

```mermaid
%%{init: {
  "theme": "default",
  "themeVariables": {
    "actorTextColor": "#333333",        // Stronger label contrast
    "actorBorder": "#666666",           // Mid-tone border
    "sequenceArrowStroke": "#666666",   // Line color
    "sequenceArrowFill": "#666666",     // Arrowhead fill
    "textColor": "#222222"              // Message label contrast
  },
  "accessibility": {
    "title": "User Login Flow",
    "description": "Sequence diagram showing user login interaction between client and server"
  }
}}%%
sequenceDiagram
  participant Client
  participant Server
  Client->>Server: Send login request
  Server-->>Client: Return auth token
```

### 4th Iteration
```mermaid
%%{init: {
  "theme": "default",
  "themeVariables": {
    "actorTextColor": "#222222",        // Strong label contrast
    "actorBorder": "#888888",           // Mid-tone border
    "sequenceArrowStroke": "#dddddd",   // Bright line color
    "sequenceArrowFill": "#dddddd",     // Bright arrowhead fill
    "textColor": "#eeeeee"              // Message label contrast
  },
  "accessibility": {
    "title": "User Login Flow",
    "description": "Sequence diagram showing user login interaction between client and server"
  }
}}%%
sequenceDiagram
  participant Client
  participant Server
  Client->>Server: Send login request
  Server-->>Client: Return auth token
```

### 5th Iteration
```mermaid
%%{init: {
  "theme": "dark",
  "themeVariables": {
    "actorTextColor": "#eeeeee",
    "actorBorder": "#aaaaaa",
    "sequenceArrowStroke": "#eeeeee",
    "sequenceArrowFill": "#eeeeee",
    "textColor": "#ffffff"
  },
  "accessibility": {
    "title": "User Login Flow",
    "description": "Sequence diagram showing user login interaction between client and server"
  }
}}%%
sequenceDiagram
  participant Client
  participant Server
  Client->>Server: Send login request
  Server-->>Client: Return auth token
```
### Iteration 6

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "actorTextColor": "#333333",
    "actorBorder": "#999999",
    "sequenceArrowStroke": "#666666",
    "sequenceArrowFill": "#666666",
    "textColor": "#444444",
    "background": "transparent"
  },
  "accessibility": {
    "title": "User Login Flow",
    "description": "Sequence diagram showing user login interaction between client and server"
  }
}}%%
sequenceDiagram
  participant Client
  participant Server
  Client->>Server: Send login request
  Server-->>Client: Return auth token
```

### Iteration 7
sequence diagrams as flowcharts

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#888888",
    "lineColor": "#888888",
    "textColor": "#222222",
    "background": "transparent"
  },
  "accessibility": {
    "title": "User Login Flow",
    "description": "Flowchart showing login interaction between client and server"
  }
}}%%
graph TD
  A[Client] -->|Send login request| B[Server]
  B -->|Return auth token| A
```






## Flowchart

```mermaid
%%{init: {
  "theme": "default",
  "themeVariables": {
    "primaryColor": "#888",
    "lineColor": "#888",
    "textColor": "#222"
  },
  "accessibility": {
    "title": "Deployment Pipeline",
    "description": "Flowchart showing CI/CD steps from commit to production"
  }
}}%%
graph TD
  A[Commit] --> B[Build]
  B --> C[Test]
  C --> D[Deploy]
```
