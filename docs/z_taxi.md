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
