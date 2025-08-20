# Taxi  
Some diagrams here.

Below is a representation of an `Order`’s lifecycle as managed by SanFrancisco's object framework:  

<!-- ALT:> Test diagram for testing accessibility metadata injection -->

<!-- DESC: Test diagram for testing accessibility metadata injection by js/alt-inject.js or js/alt-inject-closest.js. Courtesy of ProGenAI Hambot. -->  

```mermaid
%% Accessibility metadata
%% accTitle: User Flow Diagram
%% accDescr: This diagram shows the login process, including credential validation and session creation. It is intended to help sightless users understand the sequence of operations.

flowchart TD
    A[Login Page] --> B[Enter Credentials]
    B --> C{Valid?}
    C -->|Yes| D[Create Session]
    C -->|No| E[Show Error]
```

Another diagram.

<!-- ALT: This diagram shows a simple state transition from idle to active -->

<!-- DESC: The diagram represents a basic lifecycle with two states: idle and active. -->

```mermaid
%%{init: {"theme": "default", "accessibility": {"enabled": false}} }%%
stateDiagram-v2
    [*] --> Idle
    Idle --> Active
```

## Admonitions  
Some admonitions here.

Nested admonitions:  

!!! note "Outer Note"

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

    !!! note "Inner Note"

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
        nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
        massa, nec semper lorem quam in massa.

## IBM SanFrancisco Diagrams - Converted to Sunset Theme

### Architecture Overview
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "signalColor": "#ff6600", "signalTextColor": "#cc4400", "loopTextColor": "#cc4400", "actorBkg": "#ffe6cc", "actorBorder": "#ff6600", "actorTextColor": "#cc4400", "noteBkgColor": "#fff0e6", "noteTextColor": "#cc4400", "noteBorderColor": "#ff6600", "labelBoxBkgColor": "#fff7f0", "labelBoxBorderColor": "#ff6600", "activationBkgColor": "#ffebdb", "activationBorderColor": "#ff6600"}}}%%
flowchart TB
    UI[User Interface Layer] --> BL[Business Logic Layer]
    BL --> FS[Foundation Services Layer]
    FS --> JVM[Java Virtual Machine]
    JVM --> OS[Operating System]

    subgraph IBM SanFrancisco
        BL
        FS
    end
```

### Foundation Services Class Diagram
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "signalColor": "#ff6600", "signalTextColor": "#cc4400", "loopTextColor": "#cc4400", "actorBkg": "#ffe6cc", "actorBorder": "#ff6600", "actorTextColor": "#cc4400", "noteBkgColor": "#fff0e6", "noteTextColor": "#cc4400", "noteBorderColor": "#ff6600", "labelBoxBkgColor": "#fff7f0", "labelBoxBorderColor": "#ff6600", "activationBkgColor": "#ffebdb", "activationBorderColor": "#ff6600"}}}%%
classDiagram
    class FoundationServices {
        +TransactionManager
        +PersistenceManager
        +SecurityService
        +EventService
    }

    class CommonBusinessObjects {
        +Party
        +Address
        +Product
        +Order
    }

    class DomainComponents {
        +ERP
        +Retail
        +Financial
    }

    FoundationServices <|-- CommonBusinessObjects
    CommonBusinessObjects <|-- DomainComponents
```

### Order Class Diagram
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "signalColor": "#ff6600", "signalTextColor": "#cc4400", "loopTextColor": "#cc4400", "actorBkg": "#ffe6cc", "actorBorder": "#ff6600", "actorTextColor": "#cc4400", "noteBkgColor": "#fff0e6", "noteTextColor": "#cc4400", "noteBorderColor": "#ff6600", "labelBoxBkgColor": "#fff7f0", "labelBoxBorderColor": "#ff6600", "activationBkgColor": "#ffebdb", "activationBorderColor": "#ff6600"}}}%%
classDiagram
    class Order {
        +orderId: String
        +date: Date
        +status: OrderStatus
        +addLineItem(Product, int)
        +calculateTotal(): Money
        +commit()
    }
    class OrderLine {
        +product: Product
        +quantity: int
        +price: Money
    }
    class Product {
        +productId: String
        +description: String
        +price: Money
    }
    Order "1" --> "*" OrderLine
    OrderLine "*" --> "1" Product
```

### Order Processing Sequence
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "signalColor": "#ff6600", "signalTextColor": "#cc4400", "loopTextColor": "#cc4400", "actorBkg": "#ffe6cc", "actorBorder": "#ff6600", "actorTextColor": "#cc4400", "noteBkgColor": "#fff0e6", "noteTextColor": "#cc4400", "noteBorderColor": "#ff6600", "labelBoxBkgColor": "#fff7f0", "labelBoxBorderColor": "#ff6600", "activationBkgColor": "#ffebdb", "activationBorderColor": "#ff6600"}}}%%
sequenceDiagram
    participant UI as User Interface
    participant Order as Order Business Object
    participant Tx as TransactionManager
    participant PM as PersistenceManager
    participant DB as Database

    UI->>Order: addLineItem(product, qty)
    UI->>Order: calculateTotal()
    UI->>Order: commit()
    Order->>Tx: begin()
    Order->>PM: save(Order)
    PM->>DB: INSERT Order + OrderLines
    DB-->>PM: success
    PM-->>Order: persisted
    Order->>Tx: commit()
    Tx-->>Order: transaction complete
    Order-->>UI: success
```

### Three-Tier Architecture
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "signalColor": "#ff6600", "signalTextColor": "#cc4400", "loopTextColor": "#cc4400", "actorBkg": "#ffe6cc", "actorBorder": "#ff6600", "actorTextColor": "#cc4400", "noteBkgColor": "#fff0e6", "noteTextColor": "#cc4400", "noteBorderColor": "#ff6600", "labelBoxBkgColor": "#fff7f0", "labelBoxBorderColor": "#ff6600", "activationBkgColor": "#ffebdb", "activationBorderColor": "#ff6600"}}}%%
flowchart TB
    subgraph ClientNode[Client Workstation]
        UIClient[UI Layer - Swing/HTML]
    end

    subgraph AppServer[Application Server]
        BusinessLogic[SanFrancisco Business Logic Layer]
        Foundation[Foundation Services Layer]
        JVM[Java Virtual Machine]
    end

    subgraph DataServer[Database Server]
        DB[(Relational Database)]
    end

    UIClient <--> BusinessLogic
    BusinessLogic <--> Foundation
    Foundation <--> DB
```

### Order State Machine
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "signalColor": "#ff6600", "signalTextColor": "#cc4400", "loopTextColor": "#cc4400", "actorBkg": "#ffe6cc", "actorBorder": "#ff6600", "actorTextColor": "#cc4400", "noteBkgColor": "#fff0e6", "noteTextColor": "#cc4400", "noteBorderColor": "#ff6600", "labelBoxBkgColor": "#fff7f0", "labelBoxBorderColor": "#ff6600", "activationBkgColor": "#ffebdb", "activationBorderColor": "#ff6600"}}}%%
stateDiagram-v2
    [*] --> New
    New --> PendingApproval: submit()
    PendingApproval --> Approved: approve()
    PendingApproval --> Rejected: reject()
    Approved --> Shipped: ship()
    Shipped --> Completed: deliveryConfirmed()
    Completed --> [*]
    Rejected --> [*]
```

## IBM SanFrancisco -  Sunset Theme (correct variables)


### Architecture Overview
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "lineColor": "#ff6600", "defaultLinkColor": "#ff6600", "nodeBorder": "#ff6600", "clusterBorder": "#ff6600", "classText": "#cc4400", "textColor": "#cc4400", "mainBkg": "#fff4e6", "secondaryColor": "#ffe6cc", "tertiaryColor": "#fff0e6"}}}%%
flowchart TB
    UI[User Interface Layer] --> BL[Business Logic Layer]
    BL --> FS[Foundation Services Layer]
    FS --> JVM[Java Virtual Machine]
    JVM --> OS[Operating System]

    subgraph IBM SanFrancisco
        BL
        FS
    end
```

### Foundation Services Class Diagram
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "lineColor": "#ff6600", "defaultLinkColor": "#ff6600", "nodeBorder": "#ff6600", "clusterBorder": "#ff6600", "classText": "#cc4400", "textColor": "#cc4400", "mainBkg": "#fff4e6", "secondaryColor": "#ffe6cc", "tertiaryColor": "#fff0e6"}}}%%
classDiagram
    class FoundationServices {
        +TransactionManager
        +PersistenceManager
        +SecurityService
        +EventService
    }

    class CommonBusinessObjects {
        +Party
        +Address
        +Product
        +Order
    }

    class DomainComponents {
        +ERP
        +Retail
        +Financial
    }

    FoundationServices <|-- CommonBusinessObjects
    CommonBusinessObjects <|-- DomainComponents
```

### Order Class Diagram
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "lineColor": "#ff6600", "defaultLinkColor": "#ff6600", "nodeBorder": "#ff6600", "clusterBorder": "#ff6600", "classText": "#cc4400", "textColor": "#cc4400", "mainBkg": "#fff4e6", "secondaryColor": "#ffe6cc", "tertiaryColor": "#fff0e6"}}}%%
classDiagram
    class Order {
        +orderId: String
        +date: Date
        +status: OrderStatus
        +addLineItem(Product, int)
        +calculateTotal(): Money
        +commit()
    }
    class OrderLine {
        +product: Product
        +quantity: int
        +price: Money
    }
    class Product {
        +productId: String
        +description: String
        +price: Money
    }
    Order "1" --> "*" OrderLine
    OrderLine "*" --> "1" Product
```

### Order Processing Sequence
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "signalColor": "#ff6600", "signalTextColor": "#cc4400", "loopTextColor": "#cc4400", "actorBkg": "#ffe6cc", "actorBorder": "#ff6600", "actorTextColor": "#cc4400", "noteBkgColor": "#fff0e6", "noteTextColor": "#cc4400", "noteBorderColor": "#ff6600", "labelBoxBkgColor": "#fff7f0", "labelBoxBorderColor": "#ff6600", "activationBkgColor": "#ffebdb", "activationBorderColor": "#ff6600"}}}%%
sequenceDiagram
    participant UI as User Interface
    participant Order as Order Business Object
    participant Tx as TransactionManager
    participant PM as PersistenceManager
    participant DB as Database

    UI->>Order: addLineItem(product, qty)
    UI->>Order: calculateTotal()
    UI->>Order: commit()
    Order->>Tx: begin()
    Order->>PM: save(Order)
    PM->>DB: INSERT Order + OrderLines
    DB-->>PM: success
    PM-->>Order: persisted
    Order->>Tx: commit()
    Tx-->>Order: transaction complete
    Order-->>UI: success
```

### Three-Tier Architecture
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "signalColor": "#ff6600", "signalTextColor": "#cc4400", "loopTextColor": "#cc4400", "actorBkg": "#ffe6cc", "actorBorder": "#ff6600", "actorTextColor": "#cc4400", "noteBkgColor": "#fff0e6", "noteTextColor": "#cc4400", "noteBorderColor": "#ff6600", "labelBoxBkgColor": "#fff7f0", "labelBoxBorderColor": "#ff6600", "activationBkgColor": "#ffebdb", "activationBorderColor": "#ff6600"}}}%%
flowchart TB
    subgraph ClientNode[Client Workstation]
        UIClient[UI Layer - Swing/HTML]
    end

    subgraph AppServer[Application Server]
        BusinessLogic[SanFrancisco Business Logic Layer]
        Foundation[Foundation Services Layer]
        JVM[Java Virtual Machine]
    end

    subgraph DataServer[Database Server]
        DB[(Relational Database)]
    end

    UIClient <--> BusinessLogic
    BusinessLogic <--> Foundation
    Foundation <--> DB
```

### Order State Machine
```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fff4e6", "primaryTextColor": "#cc4400", "primaryBorderColor": "#ff6600", "signalColor": "#ff6600", "signalTextColor": "#cc4400", "loopTextColor": "#cc4400", "actorBkg": "#ffe6cc", "actorBorder": "#ff6600", "actorTextColor": "#cc4400", "noteBkgColor": "#fff0e6", "noteTextColor": "#cc4400", "noteBorderColor": "#ff6600", "labelBoxBkgColor": "#fff7f0", "labelBoxBorderColor": "#ff6600", "activationBkgColor": "#ffebdb", "activationBorderColor": "#ff6600"}}}%%
stateDiagram-v2
    [*] --> New
    New --> PendingApproval: submit()
    PendingApproval --> Approved: approve()
    PendingApproval --> Rejected: reject()
    Approved --> Shipped: ship()
    Shipped --> Completed: deliveryConfirmed()
    Completed --> [*]
    Rejected --> [*]
```

## A pie chart

```mermaid
pie title Which animals do you prefer as pets?
    "Dogs" : 386
    "Cats" : 85
    "Rabbits" : 53
    "Hamsters" : 101
```