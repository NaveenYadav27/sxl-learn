# Lab 16 — Deploy a .NET Framework App on Windows Pods with gMSA + IIS

**ID:** `K8S-LAB-16` · **Category:** Windows · **Level:** Enterprise · **Duration:** 120 min

**Focus:** IIS, .NET Framework, gMSA, Active Directory, Windows secrets

## Objective
Containerize a legacy .NET Framework app on IIS, run it on a Windows node, and authenticate to SQL Server using a Group Managed Service Account.

## Concepts Covered
- Group Managed Service Accounts and the GMSACredentialSpec CRD
- IIS as a container entrypoint (ServiceMonitor.exe)
- Why .NET Framework must use Windows containers
- RBAC binding the ServiceAccount to a credspec

## Prerequisites
- Hybrid cluster from Lab 11
- AD domain reachable from Windows nodes
- AD admin to create gMSA + KDS root key

## Architecture
```
Active Directory <--Kerberos--+
                              |
Windows worker (domain-joined)
   kubelet -> containerd-windows
        |
        +-- IIS Pod (gMSA: webapp$)
                |
                v
       SQL Server (Windows Auth, no password)
```

## Lab Steps

### 01. Create the gMSA in AD
```bash
Add-KdsRootKey -EffectiveTime ((Get-Date).AddHours(-10))
New-ADGroup -Name WebAppHosts -GroupScope Global
Add-ADGroupMember WebAppHosts -Members WIN-NODE-1$
New-ADServiceAccount -Name webapp -DNSHostName webapp.corp.local -PrincipalsAllowedToRetrieveManagedPassword WebAppHosts
```
**Expected:** gMSA webapp$ created.


### 02. Install GMSACredentialSpec CRD & webhook
```bash
kubectl apply -f .../gmsa-crd.yml
kubectl apply -f .../gmsa-webhook.yml
```
**Expected:** CRD gmsacredentialspecs.windows.k8s.io established.


### 03. Generate and register the credential spec
```bash
Install-Module CredentialSpec -Force
New-CredentialSpec -AccountName webapp
kubectl apply -f webapp-credspec.yaml
```
**Expected:** gmsacredentialspec/webapp created.


### 04. RBAC: allow ServiceAccount to use credspec
```bash
ClusterRole(use on gmsacredentialspecs/webapp) + RoleBinding to default SA
```
**Expected:** Role + binding created.


### 05. Deploy the IIS app referencing the gMSA
```bash
Deployment spec includes:
  securityContext:
    windowsOptions:
      gmsaCredentialSpecName: webapp
```
**Expected:** Pods Running on Windows node.


### 06. Validate SQL Integrated Auth
```bash
kubectl exec -it deploy/legacy-webapp -- powershell -c "Invoke-Sqlcmd -ServerInstance sql.corp.local -Query 'SELECT SUSER_SNAME()'"
```
**Expected:** CORP\webapp$

## Common Errors
- **failed to create credential spec** — _Cause:_ Node not in AD group allowed to retrieve gMSA password _Fix:_ Add node computer account to WebAppHosts and reboot
- **Pod rejected by webhook** — _Cause:_ ServiceAccount lacks 'use' on credspec _Fix:_ Apply ClusterRole + RoleBinding from step 4
- **SQL auth fails as ANONYMOUS LOGON** — _Cause:_ Missing SPN on SQL service _Fix:_ Register SPN MSSQLSvc/sql.corp.local:1433

## Troubleshooting
- Inside Pod: nltest /sc_verify:corp.local
- Inside Pod: klist
- On node: Get-ADServiceAccount webapp -Properties *

## Enterprise Relevance
gMSA is the only supported way to give containers Windows identities — every Windows-on-Kubernetes adoption hits this lab eventually.

## Validation
- Pod runs on Windows node
- klist inside Pod shows webapp$ TGT
- App queries SQL with Integrated Auth, no secrets in manifests

## Questions

### Beginner
- **Q.** Why can't .NET Framework run in a Linux container?
  **A.** It requires the Windows API; only .NET Core/5+ is cross-platform.

### Intermediate
- **Q.** What does gMSA solve?
  **A.** Automatic password rotation in AD; multiple hosts share one identity.

### Advanced
- **Q.** Where is the gMSA password stored on the node?
  **A.** Nowhere — node fetches on demand from AD using its machine account.

### Scenario
- **Q.** SQL logs 'Login failed for CORP\WIN-NODE-1$'. Cause?
  **A.** gMSA spec not applied; node identity leaked. Re-check gmsaCredentialSpecName.

### Viva
- **Q.** Can the same gMSA be used by Pods on multiple nodes?
  **A.** Yes — add every node's computer account to the AD group.