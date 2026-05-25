# Lab 15 — Windows Pod Networking Deep-Dive — HNS & Calico for Windows

**ID:** `K8S-LAB-15` · **Category:** Windows · **Level:** Engineer · **Duration:** 90 min

**Focus:** HNS, Calico-Windows, VFP, Windows kube-proxy, PodCIDR, DNS

## Objective
Inspect HNS networks/endpoints, install Calico for Windows, validate Pod-to-Pod and Pod-to-Service traffic across Linux and Windows nodes.

## Concepts Covered
- HNS networks (l2bridge, overlay) and HNS endpoints
- VFP (Virtual Filtering Platform) — Windows equivalent of iptables/eBPF
- How kube-proxy on Windows programs VFP rules
- PodCIDR allocation differences

## Prerequisites
- Lab 11 (Windows worker joined)
- Cluster CIDR known

## Architecture
```
Linux node              Windows node
+-----------+           +-------------+
| cni0      |           | HNS overlay |
| veth/Pods | <-------> | endpoints   |
+-----------+   VXLAN   +-------------+
        \                  /
         +-- kube-proxy --+
```

## Lab Steps

### 01. Install Calico for Windows
```bash
.\install-calico-windows.ps1 -KubeVersion 1.30.0 -ServiceCidr 10.96.0.0/12 -DNSServerIPs 10.96.0.10
```
**Expected:** Services CalicoNode, CalicoFelix, kube-proxy Running.


### 02. Inspect HNS objects
```bash
Get-HnsNetwork | Select Name,Type,AddressPrefix
Get-HnsEndpoint | Select Name,IPAddress
Get-HnsPolicyList
```
**Expected:** Overlay network present; one endpoint per Pod.


### 03. Validate Pod-to-Pod across OS
```bash
kubectl run linbox --image=nicolaka/netshoot -- sleep 3600
kubectl run winbox --image=mcr.microsoft.com/windows/nanoserver:ltsc2022 --overrides='{"spec":{"nodeSelector":{"kubernetes.io/os":"windows"}}}' -- cmd /c ping -t 127.0.0.1
kubectl exec -it linbox -- ping <winbox-pod-ip>
```
**Expected:** Replies in both directions.


### 04. Validate Service DNS from Windows
```bash
kubectl expose pod linbox --port=80 --name=linbox-svc
kubectl exec -it winbox -- cmd /c "nslookup linbox-svc.default.svc.cluster.local 10.96.0.10"
```
**Expected:** Resolves to ClusterIP.

## Common Errors
- **Windows Pods get IPs but can't reach Linux Pods** — _Cause:_ VXLAN UDP/4789 blocked by Windows firewall _Fix:_ New-NetFirewallRule -Protocol UDP -LocalPort 4789 -Action Allow
- **Pod stuck ContainerCreating with HNS error** — _Cause:_ Stale HNS endpoint _Fix:_ Remove-HnsEndpoint and recreate Pod
- **DNS lookups fail only from Windows** — _Cause:_ kube-proxy.exe not running or wrong DNS IP _Fix:_ Re-run installer with correct -DNSServerIPs

## Troubleshooting
- Get-HnsNetwork | ConvertTo-Json -Depth 10
- vfpctrl.exe /list-vmswitch-port
- crictl ... logs <pod>

## Enterprise Relevance
HNS/VFP knowledge is the difference between a Windows node that 'mostly works' and one that survives upgrades and reboots.

## Validation
- Linux Pod <-> Windows Pod ping works both ways
- Windows Pod resolves Linux Service via cluster DNS
- Calico services healthy after node reboot

## Questions

### Beginner
- **Q.** Linux equivalent of an HNS endpoint?
  **A.** A veth pair plugged into the CNI bridge.

### Intermediate
- **Q.** What does VFP do?
  **A.** Programs L3/L4 filtering, NAT, LB rules inside the Hyper-V virtual switch.

### Advanced
- **Q.** Why is Restart-Service hns dangerous?
  **A.** Tears down every Pod's networking on the host.

### Scenario
- **Q.** After reboot, all Pods stay ContainerCreating. First check?
  **A.** Get-HnsNetwork — overlay missing means Calico service didn't reattach.

### Viva
- **Q.** How does kube-proxy work on Windows?
  **A.** kube-proxy.exe programs VFP DNAT/LB rules instead of iptables.