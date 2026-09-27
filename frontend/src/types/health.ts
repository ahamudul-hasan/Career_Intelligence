export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface HealthState {
  data: HealthResponse | null;
  loading: boolean;
  error: string | null;
  latency: number | null;
  lastChecked: string | null;
}
