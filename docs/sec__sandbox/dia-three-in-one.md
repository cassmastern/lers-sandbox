# Three Diagrams in One Markdown

## Mermaid

```mermaid
graph TD
    accTitle: Mmmmmmmermaid diagram title.
    accDescr: Mmmmmmmmermaid flowchart diagram description injected by accessibility-injector.py; courtesy of Ler/GenAI swarm. 
    A[Start] --> B{Is it working?};
    B -- Yes --> C[End];
    B -- No --> D[Fix it];
    D --> B;
```


## PlantUML

<!-- diagram-a11y: title="puml (PlantUML) diagram title" desc="puml (PlantUML) diagram description inected by accessibility-injector.py; courtesy of Ler/GenAI swarm." -->
```puml
    @startuml
    Bob -> Alice : hello
    @enduml
```

## Graphviz

<!-- diagram-a11y: title="Digraph Title" desc="Digraph description injected by accessibility-injector.py; courtesy of Ler/GenAI swarm." -->
```dot
digraph G {
    rankdir=LR
    Earth [peripheries=2]
    Mars
    Earth -> Mars
}
```