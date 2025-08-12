# Glossary of Networking Terms

This glossary covers computer networking terminology, from IP addressing and routing to transport protocols and topologies. Several terms here underpin OSS functionality, especially in service delivery and infrastructure monitoring.

| **Term** | **Explanation** |
|---------|------------------|
| ACL (Access Control List) | A set of rules used to control network traffic and restrict access to network resources. Example: Configuring an ACL on a router to block traffic from a specific IP. |
| API Gateway | A server that acts as an entry point for client requests to backend services, often handling authentication, routing, and rate limiting. |
| Anycast | A network addressing and routing method where the same IP address is assigned to multiple nodes, and traffic is routed to the nearest node. |
| ARP (Address Resolution Protocol) | Protocol used to map an IP address to a MAC address in a local network. Example: `arp -a` shows the ARP cache on many systems. |
| ASN (Autonomous System Number) | A unique identifier for a network or group of networks under a single administrative domain. |
| Autoscaling | Automatically adjusting the number of compute resources in response to load. |
| Bare Metal Server | A physical server dedicated to a single tenant, often used for high-performance or compliance-sensitive workloads. |
| Bandwidth | The maximum rate of data transfer across a network path, usually measured in bits per second (bps). |
| BGP (Border Gateway Protocol) | The protocol used to exchange routing information between autonomous systems on the internet. |
| Bridge Networking (VMs) | A VM networking mode where the VM shares the host’s physical network, appearing as a separate device on the LAN. |
| CIDR (Classless Inter-Domain Routing) | Notation for IP addresses with a prefix length (e.g., `192.168.1.1/24`). |
| Cloud Interconnect | A dedicated, high-bandwidth connection between on-premises infrastructure and a cloud provider's network. |
| Cloud Load Balancer | A managed service that distributes incoming traffic across multiple virtual machines or containers in the cloud. |
| CNAME (Canonical Name Record) | A type of DNS record that aliases one domain name to another. |
| Container Networking | The set of technologies and configurations that allow containers to communicate with each other and external networks. |
| Control Plane | The part of a network that carries signaling traffic and manages the network, as opposed to the data plane. |
| CSMA/CD (Carrier Sense Multiple Access with Collision Detection) | A network protocol used in Ethernet to control access to the network. |
| Data Plane | The part of a network responsible for forwarding user data. |
| DHCP (Dynamic Host Configuration Protocol) | Protocol for automatically assigning IP addresses to devices. |
| Direct Connect / ExpressRoute | Private, dedicated network connections to cloud platforms such as AWS Direct Connect or Azure ExpressRoute. |
| DNS (Domain Name System) | System that translates human-readable domain names into IP addresses. Example: `example.com` → `93.184.216.34`. |
| DoS/DDoS (Denial of Service / Distributed Denial of Service) | Attacks aimed at making a network resource unavailable. |
| East-West Traffic | Network traffic between servers within the same data centre or cloud region. |
| Elastic IP | A static, public IPv4 address provided by cloud providers that can be remapped to different instances. |
| Encapsulation | The process of wrapping data with protocol information before transmission. |
| Ethernet | A widely used LAN technology defined by IEEE 802.3 standards. |
| Fabric Network | A network topology designed for high-speed, scalable data centre communication. |
| Firewall | A network security device that monitors and filters incoming and outgoing traffic. |
| Floating IP | An IP address that can be dynamically moved between devices or VMs for failover or load balancing. |
| FTP (File Transfer Protocol) | An application protocol for transferring files between computers over a network. |
| Gateway | A network node that connects two different networks, often with translation between protocols. |
| Gigabit Ethernet | Ethernet standard with speeds up to 1 Gbps. |
| Hub | A basic network device that broadcasts data to all ports. |
| HTTP/HTTPS (HyperText Transfer Protocol / Secure) | Protocols for transmitting hypertext over the web, HTTPS being encrypted via TLS. |
| Hypervisor Networking | The networking layer within virtualization platforms (e.g., VMware vSphere, KVM) that manages VM-to-VM and VM-to-host connectivity. |
| ICMP (Internet Control Message Protocol) | Used by network devices to send error messages and operational information. Example: `ping` uses ICMP Echo Request/Reply. |
| Ingress Controller | A Kubernetes resource that manages external access to services in a cluster. |
| Inter-VLAN Routing | Routing between VLANs, usually handled by a Layer 3 switch or router. |
| IP (Internet Protocol) | A set of rules for addressing and routing packets of data so they can travel across networks. |
| ISP (Internet Service Provider) | A company that provides internet connectivity. |
| Jitter | The variation in packet arrival times in a network. |
| Kerberos | A network authentication protocol using tickets for secure authentication. |
| Kubernetes Networking | The set of rules and services that define how pods and services communicate within a Kubernetes cluster. |
| LAN (Local Area Network) | A network covering a small geographic area, like a home or office. |
| Latency | The time it takes for a packet to travel from source to destination. |
| Latency-Based Routing | Routing decisions made based on the measured network latency between client and server. |
| Load Balancer | A device or software that distributes network traffic across multiple servers. |
| Load Balancing Algorithm | The method used to distribute network requests, such as round-robin, least connections, or IP hash. |
| MAC Address (Media Access Control Address) | A hardware identifier for a network interface card. |
| MPLS (Multiprotocol Label Switching) | A routing technique for high-performance telecommunications networks. |
| Multi-Cloud Networking | The practice of connecting and managing resources across multiple cloud providers. |
| NAT (Network Address Translation) | Translates private IP addresses into a public IP address. Example: Home routers perform NAT. |
| Network Function Virtualization (NFV) | A network architecture concept that uses virtualization to manage and deploy network services. |
| Network Overlay | A virtual network built on top of another network, often used in SDN and cloud environments. |
| Network Peering | Directly connecting two networks to exchange traffic without going through the public internet. |
| Network Security Group (NSG) | A set of security rules controlling inbound and outbound traffic to Azure resources. |
| NIC (Network Interface Card) | Hardware that connects a device to a network. |
| North-South Traffic | Network traffic between a data centre and external networks. |
| OSI Model (Open Systems Interconnection) | A conceptual model describing how data moves through a network in 7 layers. |
| Overlay Network (Containers) | A network that connects containers running on different hosts, typically implemented with VXLAN or GRE. |
| Overhead | Extra data and processing time required by networking protocols. |
| Packet | A formatted unit of data carried by a network. |
| Peering Connection (Cloud) | A private network link between two virtual networks in the cloud. |
| PoE (Power over Ethernet) | Technology that delivers power and data over the same Ethernet cable. |
| Port | A logical endpoint for network communications, identified by a number. |
| Private Endpoint | A network interface that privately connects a service to a virtual network. |
| QoE (Quality of Experience) | A measure of user satisfaction with network services. |
| QoS (Quality of Service) | Techniques to manage network resources and prioritize certain types of traffic. |
| Routing | The process of selecting network paths for traffic. |
| RTP (Real-Time Transport Protocol) | A protocol for delivering audio and video over IP networks. |
| SDN (Software-Defined Networking) | An approach to networking that uses software-based controllers to direct traffic on the network. |
| SD-WAN (Software-Defined Wide Area Network) | A virtual WAN architecture that uses software to control the connectivity, management, and services between data centres, branches, and cloud. |
| Security Group | A virtual firewall that controls inbound and outbound traffic for resources in cloud environments. |
| Segment Routing (SR) | A method of source routing where the sender defines the path a packet should take. |
| Service Mesh | A dedicated infrastructure layer for controlling service-to-service communication in microservices architectures. |
| Site-to-Site VPN | A VPN that connects two or more networks in different physical locations. |
| SMTP (Simple Mail Transfer Protocol) | Protocol for sending emails. |
| SNMP (Simple Network Management Protocol) | Used to manage and monitor network devices. |
| Spine-Leaf Architecture | A two-tier data centre network topology for predictable latency and high bandwidth. |
| SSH (Secure Shell) | Protocol for secure remote login and command execution. |
| Subnet | A segmented portion of a network with a specific IP range. |
| TCP (Transmission Control Protocol) | Reliable, connection-oriented transport layer protocol. |
| Transit Gateway | A service that enables connecting multiple VPCs/VNets and on-premises networks via a central hub. |
| TTL (Time To Live) | A field in IP packets that limits the packet's lifespan. |
| Tunneling | Encapsulating one protocol inside another for secure transport. |
| UDP (User Datagram Protocol) | Connectionless, faster but less reliable than TCP. |
| Underlay Network | The physical network infrastructure that supports an overlay network. |
| URL (Uniform Resource Locator) | An address for accessing resources on the web. |
| VLAN (Virtual LAN) | A logical subdivision of a physical network that groups devices together, improving security and traffic management. |
| VM (Virtual Machine) | A software emulation of a physical computer that runs an operating system and applications independently. |
| VNet (Virtual Network) | A logically isolated network in cloud environments like Azure, used to securely connect resources. |
| VPN (Virtual Private Network) | A secure tunnel over the internet that encrypts traffic between endpoints, often used for remote access. |
| VRRP (Virtual Router Redundancy Protocol) | A protocol that increases availability by assigning a virtual IP to a group of routers. |
| VXLAN (Virtual Extensible LAN) | A network virtualization technology that enables scalable segmentation across data centres using overlay networks. |
| WAN (Wide Area Network) | A network that spans a large geographic area, connecting multiple LANs. |
| WebSocket | A protocol providing full-duplex communication channels over a single TCP connection, often used for real-time apps. |
| Wi-Fi | A wireless networking technology that allows devices to connect to a LAN using radio waves. |
| WireGuard | A modern, lightweight VPN protocol known for simplicity and high performance. |
| Zero Trust | A security model that assumes no implicit trust and requires continuous verification of identity and access. |
| ZTP (Zero Touch Provisioning) | A method for automatically configuring devices when they are first connected to the network. |

