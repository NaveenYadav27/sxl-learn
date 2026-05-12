import type { Slo } from "./types";

export const SLOS: Slo[] = [
  { id: "slo-checkout-avail", name: "checkout-api availability", service_id: "svc-checkout", kind: "availability", objective: 99.9, unit: "%", window_days: 30, current: 99.84, error_budget_pct: 18, burn_rate_1h: 6.2, burn_rate_6h: 3.4, status: "burning", description: "% of 2xx/3xx responses over 30 days" },
  { id: "slo-checkout-latency", name: "checkout-api p95 latency", service_id: "svc-checkout", kind: "latency", objective: 350, unit: "ms", window_days: 28, current: 410, error_budget_pct: 0, burn_rate_1h: 8.9, burn_rate_6h: 5.1, status: "breached", description: "p95 server-side latency under 350ms" },
  { id: "slo-payments-avail", name: "payments-svc availability", service_id: "svc-payments", kind: "availability", objective: 99.95, unit: "%", window_days: 30, current: 99.97, error_budget_pct: 64, burn_rate_1h: 0.4, burn_rate_6h: 0.6, status: "healthy" },
  { id: "slo-identity-avail", name: "identity-api availability", service_id: "svc-identity", kind: "availability", objective: 99.99, unit: "%", window_days: 30, current: 99.99, error_budget_pct: 92, burn_rate_1h: 0.1, burn_rate_6h: 0.1, status: "healthy" },
  { id: "slo-cart-avail", name: "cart-svc availability", service_id: "svc-cart", kind: "availability", objective: 99.9, unit: "%", window_days: 30, current: 99.92, error_budget_pct: 71, burn_rate_1h: 0.8, burn_rate_6h: 1.0, status: "healthy" },
  { id: "slo-catalog-latency", name: "catalog-api p95 latency", service_id: "svc-catalog", kind: "latency", objective: 100, unit: "ms", window_days: 7, current: 60, error_budget_pct: 88, burn_rate_1h: 0.0, burn_rate_6h: 0.2, status: "healthy" },
  { id: "slo-notify-throughput", name: "notify-worker throughput", service_id: "svc-notify", kind: "throughput", objective: 95, unit: "%", window_days: 7, current: 71.4, error_budget_pct: 0, burn_rate_1h: 11.2, burn_rate_6h: 9.0, status: "breached", description: "% of jobs processed within 60s" },
  { id: "slo-search-latency", name: "search-api p95 latency", service_id: "svc-search", kind: "latency", objective: 250, unit: "ms", window_days: 28, current: 320, error_budget_pct: 12, burn_rate_1h: 4.1, burn_rate_6h: 3.2, status: "at_risk" },
];

export function findSlo(id: string) {
  return SLOS.find((s) => s.id === id);
}
