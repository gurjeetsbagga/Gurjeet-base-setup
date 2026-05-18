/**
 * Vendor-neutral observability port — future OpenTelemetry / Datadog / CloudWatch adapters
 * implement this interface without coupling domain code to a specific SDK.
 */
export interface TelemetrySpan {
  setAttribute(key: string, value: string | number | boolean): void;
  end(): void;
}

export interface TelemetryPort {
  readonly name: string;

  startSpan(name: string, attributes?: Record<string, string | number | boolean>): TelemetrySpan;

  recordEvent(name: string, attributes?: Record<string, string | number | boolean>): void;

  recordMetric(
    name: string,
    value: number,
    attributes?: Record<string, string | number | boolean>,
  ): void;
}

export const TELEMETRY_PORT = Symbol("TELEMETRY_PORT");
