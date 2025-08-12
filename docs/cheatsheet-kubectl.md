# Kubectl Command Cheat Sheet
This page lists common `kubectl` commands.

## Basic Commands

### Cluster Information

`kubectl cluster-info`                   Display cluster info  
`kubectl version`                        Show client and server versions  
`kubectl get nodes`                      List all nodes  
`kubectl describe nodes`                 Show detailed node information  
`kubectl top nodes`                      Show resource usage (CPU/Memory) of nodes  
`kubectl api-resources`                  List all API resources  

### Context and Configuration  
`kubectl config view`                    Show merged kubeconfig settings  
`kubectl config current-context`         Display current context  
`kubectl config use-context <context>`   Switch to another context  
`kubectl config get-contexts`            List all contexts  
`kubectl config set-context --current --namespace=<ns>`   Set namespace for current context  

## Resource Operations  
### Common Verbs  
`kubectl get` <resource>                 List resources  
`kubectl describe` <resource> <name>     Detailed resource info  
`kubectl create` -f <file.yaml>          Create from file  
`kubectl apply` -f <file.yaml>           Apply configuration  
`kubectl delete` -f <file.yaml>          Delete from file  
`kubectl edit` <resource> <name>         Edit resource  
`kubectl patch` <resource> <name> --patch '{"spec": {...}}'   Partial update  
`kubectl replace` -f <file.yaml>         Force replace  
`kubectl scale` --replicas=3 <resource>  Scale replicas  

### Pod Operations  
`kubectl get pods` [-o wide]            # List pods (with node info)  
`kubectl describe pod <pod-name>`       # Pod details  
`kubectl logs <pod-name> [-c container]`  # Show pod logs  
`kubectl exec -it <pod-name> -- bash`   # Interactive shell  
`kubectl port-forward <pod-name>` 8080:80  # Port forwarding  
`kubectl top pod <pod-name>`            # Pod resource usage  
`kubectl cp <pod-name>:<path> <local-path>`  # Copy from pod  

### Deployment Operations  
`kubectl get deployments`                List deployments  
`kubectl rollout status deployment/<name>`   Check rollout status  
`kubectl rollout history deployment/<name>`   View rollout history  
`kubectl rollout undo deployment/<name>`   Rollback deployment  
`kubectl set image deployment/<name> <container>=<new-image>`   Update image  

### Service Operations  
`kubectl get services`                   List services  
`kubectl expose deployment <name> --port=80 --target-port=8080`   Create service  

### Namespace Operations  
`kubectl get namespaces`                 List namespaces  
`kubectl create namespace <name>`        Create namespace  
`kubectl delete namespace <name>`        Delete namespace  

## Advanced Operations  
### Debugging  
`kubectl get events --sort-by=.metadata.creationTimestamp`   Show events  
`kubectl get events -w`                   Watch events  
`kubectl logs -f <pod-name>`              Stream logs  
`kubectl attach -it <pod-name>`           Attach to running container  
`kubectl debug -it <pod-name> --image=busybox --target=<container>`   Debug pod  

### YAML/JSON Manipulation  
`kubectl get <resource> -o yaml`         Get resource as YAML  
`kubectl get <resource> -o json`         Get resource as JSON  
`kubectl explain <resource>`             Show resource documentation  
`kubectl diff -f <file.yaml>`            Show differences  

### Resource Management  

`kubectl label <resource> <name> key=value`  # Add label  
`kubectl annotate <resource> <name> key=value`  # Add annotation  
`kubectl taint nodes <node-name> key=value:NoSchedule`  # Taint node  
`kubectl cordon <node-name>`              # Mark node as unschedulable  
`kubectl drain <node-name> --ignore-daemonsets`  # Drain node  
`kubectl uncordon <node-name>`            # Mark node as schedulable  

### RBAC Operations  
`kubectl get roles,rolebindings`          List RBAC resources  
`kubectl get clusterroles,clusterrolebindings`   Verify roles and bindings  
`kubectl auth can-i <verb> <resource>`    Check permissions  

### Output Formats  
`kubectl get pods -o wide`               Additional details  
`kubectl get pods -o name`               Resource names only  
`kubectl get pods -o jsonpath='{.items[*].metadata.name}'`   Custom output  
`kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase`   Custom columns  
`kubectl get pods --show-labels`          Show labels  
`kubectl get pods --watch`                Watch changes  

## Troubleshooting  
`kubectl get pods --field-selector status.phase=Running`   Filter pods  
`kubectl get pods --all-namespaces`       Across all namespaces  
kubectl api-versions                   List available API versions  
`kubectl get --raw /metrics`              View raw metrics  
`kubectl get --raw /healthz`              Check cluster health  

## Shortcuts and Aliases  
`kubectl get po`                         Short for pods  
`kubectl get svc`                        Short for services  
`kubectl get deploy`                     Short for deployments  
`kubectl get rs`                         Short for replicasets  
`kubectl get ns`                         Short for namespaces  
`kubectl get no`                         Short for nodes  

## Plugins and Extensions  
`kubectl krew`                           Plugin manager  
`kubectl neat`                           Clean up manifests (plugin)  
`kubectl tree`                           Show object hierarchy (plugin)  