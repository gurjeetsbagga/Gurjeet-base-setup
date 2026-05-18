import { Injectable } from "@nestjs/common";
import type { TelemetryPort, TelemetrySpan } from "./telemetry.port";

const noopSpan: TelemetrySpan = {
  setAttribute: () => undefined,
  end: () => undefined,
};

@Injectable()
export class NoopTelemetryProvider implements TelemetryPort {
  readonly name = "noop";

  startSpan(): TelemetrySpan {
    return noopSpan;
  }

  recordEvent(): void {
    /* no-op until OTel/Datadog adapter is wired */
  }

  recordMetric(): void {
    /* no-op */
  }
}
