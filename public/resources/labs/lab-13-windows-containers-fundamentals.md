# Lab 13 — Windows Containers Fundamentals (Docker Desktop & Windows Server)

**ID:** `K8S-LAB-13` · **Category:** Windows · **Level:** Beginner · **Duration:** 60 min

**Focus:** Windows containers, Docker Desktop, process isolation, Hyper-V isolation, ltsc2022

## Objective
Run your first Windows container on Windows Server 2022 / Docker Desktop, understand process vs Hyper-V isolation, and inspect the Windows container runtime.

## Concepts Covered
- Process isolation vs Hyper-V isolation
- Why Windows host build must match container base image (ltsc2019 vs ltsc2022)
- nanoserver vs servercore base images
- Docker Desktop Windows-containers mode vs Linux-containers mode

## Prerequisites
- Windows 10/11 Pro or Windows Server 2022
- Docker Desktop installed
- Virtualization enabled in BIOS

## Architecture
```
Windows Host (Server 2022 / Win11)
  |
  +-- Docker Engine (Windows mode)
        |
        +-- Process-isolated container  (shares host kernel)
        |
        +-- Hyper-V isolated container  (tiny utility VM)
```

## Lab Steps

### 01. Switch Docker Desktop to Windows containers
```bash
& 'C:\Program Files\Docker\Docker\DockerCli.exe' -SwitchDaemon
docker version
```
**Expected:** Server: OS/Arch: windows/amd64 in docker version output.


### 02. Pull and run nanoserver
```bash
docker pull mcr.microsoft.com/windows/nanoserver:ltsc2022
docker run --rm mcr.microsoft.com/windows/nanoserver:ltsc2022 cmd /c "ver && hostname"
```
**Expected:** Microsoft Windows version + container hostname.


### 03. Run with Hyper-V isolation
```bash
docker run --rm --isolation=hyperv mcr.microsoft.com/windows/nanoserver:ltsc2022 cmd /c "ver"
```
**Expected:** Same output, ~3-5s slower to start.


### 04. Inspect the running engine
```bash
docker info | findstr /i "isolation osversion"
Get-Service docker
```
**Expected:** Default Isolation: process, OSVersion: 10.0.20348.x

## Common Errors
- **hcsshim CreateComputeSystem: OS does not match** — _Cause:_ Image base build differs from host build _Fix:_ Use --isolation=hyperv OR pull matching ltsc tag
- **Docker Desktop hangs on switch** — _Cause:_ Hyper-V/Containers feature missing _Fix:_ Enable-WindowsOptionalFeature -Online -FeatureName Containers,Microsoft-Hyper-V -All

## Troubleshooting
- docker events
- Get-WinEvent -LogName Microsoft-Windows-Hyper-V-Compute-Admin
- docker system info

## Enterprise Relevance
Windows containers underpin all .NET Framework modernization. Knowing isolation modes lets you decide between density (process) and tenant isolation (hyperv).

## Validation
- docker version shows windows/amd64 server
- Both process and hyperv containers run on the same host

## Questions

### Beginner
- **Q.** Can a Windows container run a Linux binary?
  **A.** No — the kernel ABI is different.

### Intermediate
- **Q.** When do you choose Hyper-V isolation?
  **A.** Multi-tenant hosts, untrusted images, mismatched builds.

### Advanced
- **Q.** Why prefer nanoserver over servercore?
  **A.** Smaller attack surface, ~10x smaller image, faster pulls.

### Scenario
- **Q.** docker run fails with 'OS does not match'. Fix?
  **A.** Add --isolation=hyperv or pull the matching ltsc tag.

### Viva
- **Q.** Docker Desktop Linux vs Windows mode?
  **A.** Linux uses WSL2 VM; Windows talks to native dockerd.exe.