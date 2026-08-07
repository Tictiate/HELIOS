# Dataset Analysis

This document contains a basic statistical analysis of the simulated 6G network datasets.

## edge_servers.csv

- **Rows**: 1000
- **Columns**: 7

### Schema & Nulls

| Column | Type | Non-Null Count | Null % |
|--------|------|----------------|--------|
| `timestamp` | object | 1000 | 0.00% |
| `edge_id` | object | 1000 | 0.00% |
| `cpu_pct` | float64 | 1000 | 0.00% |
| `gpu_pct` | float64 | 1000 | 0.00% |
| `memory_pct` | float64 | 1000 | 0.00% |
| `requests_per_min` | int64 | 1000 | 0.00% |
| `latency_ms` | float64 | 1000 | 0.00% |

### Summary Statistics

| Metric | cpu_pct | gpu_pct | memory_pct | requests_per_min | latency_ms |
|--------|---|---|---|---|---|
| **count** | 1000.0 | 1000.0 | 1000.0 | 1000.0 | 1000.0 |
| **mean** | 55.22 | 51.42 | 53.82 | 4037.94 | 8.7 |
| **std** | 25.02 | 27.63 | 25.91 | 2276.14 | 1.99 |
| **min** | 10.04 | 5.01 | 10.16 | 100.0 | 3.92 |
| **25%** | 34.55 | 27.64 | 31.88 | 2043.5 | 7.42 |
| **50%** | 56.39 | 50.66 | 52.65 | 4174.5 | 8.76 |
| **75%** | 76.07 | 75.06 | 76.05 | 5929.25 | 10.12 |
| **max** | 99.82 | 99.98 | 99.9 | 7994.0 | 13.58 |


---

## network_health.csv

- **Rows**: 1000
- **Columns**: 6

### Schema & Nulls

| Column | Type | Non-Null Count | Null % |
|--------|------|----------------|--------|
| `latency_ms` | float64 | 1000 | 0.00% |
| `packet_loss_pct` | float64 | 1000 | 0.00% |
| `availability_pct` | float64 | 1000 | 0.00% |
| `energy_usage_pct` | float64 | 1000 | 0.00% |
| `resource_utilization_pct` | float64 | 1000 | 0.00% |
| `network_health_score` | float64 | 1000 | 0.00% |

### Summary Statistics

| Metric | latency_ms | packet_loss_pct | availability_pct | energy_usage_pct | resource_utilization_pct | network_health_score |
|--------|---|---|---|---|---|---|
| **count** | 1000.0 | 1000.0 | 1000.0 | 1000.0 | 1000.0 | 1000.0 |
| **mean** | 32.93 | 2.5 | 95.05 | 58.4 | 58.78 | 49.06 |
| **std** | 15.8 | 1.47 | 2.86 | 21.71 | 23.67 | 13.6 |
| **min** | 5.04 | 0.0 | 90.02 | 20.21 | 20.11 | 14.44 |
| **25%** | 19.13 | 1.21 | 92.65 | 39.08 | 38.1 | 39.47 |
| **50%** | 33.34 | 2.5 | 95.0 | 59.34 | 58.1 | 48.76 |
| **75%** | 45.88 | 3.79 | 97.53 | 77.56 | 79.71 | 59.02 |
| **max** | 59.86 | 5.0 | 99.97 | 94.97 | 99.88 | 84.72 |


---

## network_nodes.csv

- **Rows**: 16
- **Columns**: 2

### Schema & Nulls

| Column | Type | Non-Null Count | Null % |
|--------|------|----------------|--------|
| `node_id` | object | 16 | 0.00% |
| `node_type` | object | 16 | 0.00% |

---

## tower_failures.csv

- **Rows**: 1000
- **Columns**: 7

### Schema & Nulls

| Column | Type | Non-Null Count | Null % |
|--------|------|----------------|--------|
| `tower_id` | object | 1000 | 0.00% |
| `temperature_c` | float64 | 1000 | 0.00% |
| `power_usage_pct` | float64 | 1000 | 0.00% |
| `traffic_load` | int64 | 1000 | 0.00% |
| `weather` | object | 1000 | 0.00% |
| `cpu_usage_pct` | float64 | 1000 | 0.00% |
| `failed` | int64 | 1000 | 0.00% |

### Summary Statistics

| Metric | temperature_c | power_usage_pct | traffic_load | cpu_usage_pct | failed |
|--------|---|---|---|---|---|
| **count** | 1000.0 | 1000.0 | 1000.0 | 1000.0 | 1000.0 |
| **mean** | 46.67 | 59.18 | 920.24 | 55.6 | 0.15 |
| **std** | 15.96 | 23.64 | 505.82 | 26.3 | 0.36 |
| **min** | 20.06 | 20.08 | 100.0 | 10.02 | 0.0 |
| **25%** | 31.98 | 38.8 | 456.25 | 32.68 | 0.0 |
| **50%** | 46.46 | 58.22 | 912.0 | 56.16 | 0.0 |
| **75%** | 60.32 | 79.74 | 1348.75 | 78.75 | 0.0 |
| **max** | 74.87 | 99.99 | 1799.0 | 99.99 | 1.0 |


---

## tower_utilization.csv

- **Rows**: 1000
- **Columns**: 8

### Schema & Nulls

| Column | Type | Non-Null Count | Null % |
|--------|------|----------------|--------|
| `timestamp` | object | 1000 | 0.00% |
| `tower_id` | object | 1000 | 0.00% |
| `users` | int64 | 1000 | 0.00% |
| `available_bandwidth_mbps` | float64 | 1000 | 0.00% |
| `latency_ms` | float64 | 1000 | 0.00% |
| `packet_loss_pct` | float64 | 1000 | 0.00% |
| `power_usage_pct` | float64 | 1000 | 0.00% |
| `temperature_c` | float64 | 1000 | 0.00% |

### Summary Statistics

| Metric | users | available_bandwidth_mbps | latency_ms | packet_loss_pct | power_usage_pct | temperature_c |
|--------|---|---|---|---|---|---|
| **count** | 1000.0 | 1000.0 | 1000.0 | 1000.0 | 1000.0 | 1000.0 |
| **mean** | 775.31 | 61.2 | 22.78 | 2.17 | 57.17 | 42.62 |
| **std** | 418.7 | 21.57 | 5.93 | 0.95 | 21.64 | 12.93 |
| **min** | 51.0 | 15.75 | 8.75 | 0.07 | 20.02 | 20.04 |
| **25%** | 394.75 | 43.68 | 18.25 | 1.42 | 38.02 | 31.7 |
| **50%** | 778.5 | 60.83 | 22.78 | 2.19 | 57.12 | 42.78 |
| **75%** | 1136.0 | 80.06 | 27.35 | 2.91 | 75.55 | 53.43 |
| **max** | 1500.0 | 107.31 | 35.97 | 4.17 | 94.96 | 64.99 |


---

## traffic_profile.csv

- **Rows**: 1000
- **Columns**: 7

### Schema & Nulls

| Column | Type | Non-Null Count | Null % |
|--------|------|----------------|--------|
| `timestamp` | object | 1000 | 0.00% |
| `tower_id` | object | 1000 | 0.00% |
| `video_users` | int64 | 1000 | 0.00% |
| `voice_users` | int64 | 1000 | 0.00% |
| `iot_devices` | int64 | 1000 | 0.00% |
| `gaming_users` | int64 | 1000 | 0.00% |
| `emergency_users` | int64 | 1000 | 0.00% |

### Summary Statistics

| Metric | video_users | voice_users | iot_devices | gaming_users | emergency_users |
|--------|---|---|---|---|---|
| **count** | 1000.0 | 1000.0 | 1000.0 | 1000.0 | 1000.0 |
| **mean** | 373.31 | 155.01 | 626.66 | 125.1 | 10.2 |
| **std** | 199.65 | 83.75 | 335.46 | 71.53 | 6.07 |
| **min** | 20.0 | 10.0 | 51.0 | 5.0 | 0.0 |
| **25%** | 194.0 | 83.75 | 337.5 | 62.0 | 5.0 |
| **50%** | 381.0 | 155.5 | 621.5 | 126.0 | 10.0 |
| **75%** | 549.25 | 228.0 | 929.25 | 185.0 | 16.0 |
| **max** | 700.0 | 300.0 | 1200.0 | 250.0 | 20.0 |


---

