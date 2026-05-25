# Lab 10 — Monitoring & Observability — Prometheus, Grafana, Loki

**ID:** `K8S-LAB-10` · **Category:** Enterprise · **Level:** Enterprise · **Duration:** 75 min

**Focus:** Prometheus, Grafana, Loki, metrics-server, alerting

## Objective
Install the kube-prometheus-stack, visualize cluster metrics in Grafana, ship logs to Loki, and write a basic PromQL alert.

## Concepts Covered
- Pull-based metrics vs push
- Service discovery via ServiceMonitor
- Log labels vs full-text indexing

## Prerequisites
- A cluster from Lab 1
- Helm 3 installed

## Architecture
Prometheus scrapes; Loki indexes labels not log lines (cheaper); Grafana stitches both into a single dashboard.

```
Pods --(/metrics)--> Prometheus  ---->  Grafana
            (kubelet/cadvisor)
Pods --(stdout)--->  Promtail  ---->  Loki  ---->  Grafana
```

## Lab Steps

### 01. Install kube-prometheus-stack
One chart ships Prometheus, Grafana, Alertmanager, node-exporter and a pile of dashboards.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

**Expected output:** All pods Running 1/1 in `monitoring` within ~2 min.

**What happens internally:** ServiceMonitor CRDs are how Prometheus discovers what to scrape inside the cluster.

### 02. Open Grafana
Default admin password is `prom-operator` for the chart.

```bash
kubectl -n monitoring port-forward svc/monitoring-grafana 3000:80
# in browser: http://localhost:3000 (admin / prom-operator)
```

**Expected output:** Grafana UI loads with prebuilt 'Kubernetes / Compute Resources' dashboards.

**What happens internally:** Port-forward tunnels via the API server; no LoadBalancer needed for the lab.

### 03. Install Loki and Promtail
Promtail (DaemonSet) ships /var/log/containers/* to Loki; Grafana already discovers Loki via the same release.

```bash
helm install loki prometheus-community/loki-stack -n monitoring
```

**Expected output:** loki-* pods Running.

**What happens internally:** Promtail tails container log files and adds Pod labels as Loki labels.

### 04. Write a PromQL alert
Fires when any pod restarts more than 6×/hour for 5 minutes.

```bash
cat <<EOF | kubectl -n monitoring apply -f -
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata: {name: pod-restarts, labels: {release: monitoring}}
spec:
  groups:
  - name: pods
    rules:
    - alert: PodRestartingTooMuch
      expr: rate(kube_pod_container_status_restarts_total[5m]) > 0.1
      for: 5m
      labels: {severity: warning}
      annotations: {summary: "Pod {{ \$labels.pod }} restarting"}
EOF
```

**Expected output:** prometheusrule.monitoring.coreos.com/pod-restarts created.

**What happens internally:** The Prometheus Operator reloads Prometheus when PrometheusRule CRs change.

## Common Errors
- **No data in Grafana** — _Cause:_ ServiceMonitors filtered by `release` label mismatch  _Fix:_ Add `labels: {release: monitoring}` to your ServiceMonitor
- **Loki disk fills fast** — _Cause:_ Default retention too long for log volume  _Fix:_ Tune `limits_config.retention_period`

## Troubleshooting
- `kubectl -n monitoring get servicemonitor`
- Prometheus → Status → Targets to see who's being scraped

## Enterprise Relevance
You cannot run Kubernetes blind. The stack above is the lingua franca; nearly every SRE job description assumes it.

## Validation
- You can see CPU/memory per Pod in Grafana
- You can query logs by Pod label in Loki
- You wrote one alert

## Related Incidents
K8S-INC-3001, K8S-INC-3004

## Related Guide Sections
- Observability stack

## Questions

### Beginner
- **Q.** Why pull instead of push for metrics?
  **A.** Easier service discovery and built-in liveness signal.

### Intermediate
- **Q.** What's a ServiceMonitor?
  **A.** A CRD the Prometheus Operator turns into a scrape config.

### Advanced
- **Q.** Why does Loki index labels not log content?
  **A.** Drastically lower storage and cost; you grep within the time-bounded label stream.

### Scenario
- **Q.** Prometheus disk fills every weekend. What do you tune?
  **A.** Retention, scrape interval, drop noisy series with relabel rules.

### Viva
- **Q.** Difference between recording and alerting rules?
  **A.** Recording precomputes a series; alerting fires when an expr stays true for `for`.