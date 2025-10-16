# FHIR Resource Bundles

Bundles are collections of resources used for search results, batch operations, and transactions.

## FHIR Bundle Types and Structure

### Diagram (version1)

```mermaid
graph TD
    Bundle[Bundle Resource]
  
    Bundle --> Type[type]
    Bundle --> Total[total]
    Bundle --> Link[link array]
    Bundle --> Entry[entry array]
  
    Type --> TypeSearch[searchset]
    Type --> TypeBatch[batch]
    Type --> TypeTransaction[transaction]
    Type --> TypeHistory[history]
    Type --> TypeCollection[collection]
    Type --> TypeDocument[document]
  
    Link --> LinkSelf[self]
    Link --> LinkNext[next]
    Link --> LinkPrev[previous]
    Link --> LinkFirst[first]
    Link --> LinkLast[last]
  
    Entry --> FullUrl[fullUrl]
    Entry --> Resource[resource]
    Entry --> Search[search]
    Entry --> Request[request]
    Entry --> Response[response]
  
    Search --> SearchMode[mode: match/include]
    Search --> SearchScore[score]
  
    Request --> ReqMethod[method: GET/POST/PUT/DELETE]
    Request --> ReqUrl[url]
    Request --> ReqIfMatch[ifMatch]
    Request --> ReqIfNoneExist[ifNoneExist]
  
    Response --> RespStatus[status]
    Response --> RespLocation[location]
    Response --> RespEtag[etag]
    Response --> RespLastMod[lastModified]
```

### Diagram (version 2)

```puml
@startuml FHIR_Bundle_Resource
' Diagram: FHIR Bundle Resource Structure

hide circle
skinparam linetype ortho
skinparam entity {
  BackgroundColor White
  BorderColor Black
  FontSize 12
}

entity "Bundle" as Bundle {
  * type : code <<REQUIRED>>
  * total : integer [0..1]
  * link[] : Bundle.Link [0..*]
  * entry[] : Bundle.Entry [0..*]
}

entity "Bundle.Type" as Type {
  + searchset
  + batch
  + transaction
  + history
  + collection
  + document
}

entity "Bundle.Link" as Link {
  * relation : string <<REQUIRED>>
  * url : uri <<REQUIRED>>
}

entity "Link.Relation" as LinkRel {
  + self
  + next
  + previous
  + first
  + last
}

entity "Bundle.Entry" as Entry {
  * fullUrl : uri [0..1]
  * resource : Resource [0..1]
  * search : Bundle.Search [0..1]
  * request : Bundle.Request [0..1]
  * response : Bundle.Response [0..1]
}

entity "Bundle.Search" as Search {
  * mode : code [0..1] <<match/include>>
  * score : decimal [0..1]
}

entity "Bundle.Request" as Request {
  * method : code <<GET/POST/PUT/DELETE>>
  * url : uri <<REQUIRED>>
  * ifMatch : string [0..1]
  * ifNoneExist : string [0..1]
}

entity "Bundle.Response" as Response {
  * status : string <<REQUIRED>>
  * location : uri [0..1]
  * etag : string [0..1]
  * lastModified : instant [0..1]
}

' Relationships
Bundle --> Type : "type"
Bundle --> Link : "link[]"
Bundle --> Entry : "entry[]"
Link --> LinkRel : "relation"
Entry --> Search : "search"
Entry --> Request : "request"
Entry --> Response : "response"

@enduml
```
