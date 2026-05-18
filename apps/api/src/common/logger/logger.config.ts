import pino from "pino";
import type { Level } from "pino";
import type { Params } from "nestjs-pino";
import type { LoggingConfig } from "../../config/configs/logging.config";
import type { FileLogManager } from "./file-log.manager";
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from "./correlation.context";
import { REDACT_PATHS } from "./redact.util";

function toPinoLevel(level: LoggingConfig["level"]): Level {
  if (level === "silent") return "error";
  return level;
}

export function buildLoggerModuleParams(config: LoggingConfig, files?: FileLogManager): Params {
  const usePretty = config.pretty && config.isDev;
  const level = toPinoLevel(config.enabled ? config.level : "error");
  const streams: pino.StreamEntry[] = [];

  if (usePretty) {
    streams.push({
      level,
      stream: pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: false,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }),
    });
  } else {
    streams.push({ level, stream: process.stdout });
  }

  if (config.logFileEnabled && files) {
    const combined = files.getApiStream("combined");
    const error = files.getApiStream("error");
    const ai = files.getApiStream("ai");
    const http = files.getApiStream("http");

    if (combined) streams.push({ level: "info", stream: combined });
    if (error) streams.push({ level: "error", stream: error });
    if (ai) streams.push({ level: "debug", stream: ai });
    if (http) streams.push({ level: "info", stream: http });
  }

  const rootStream =
    streams.length > 1 ? pino.multistream(streams) : (streams[0]?.stream ?? process.stdout);

  return {
    pinoHttp: {
      enabled: config.logHttpRequests,
      level,
      stream: rootStream,
      redact: {
        paths: REDACT_PATHS,
        censor: "[REDACTED]",
      },
      autoLogging: config.logHttpRequests,
      quietReqLogger: !config.isDev,
      genReqId: (req) => {
        const header = req.headers[REQUEST_ID_HEADER];
        if (typeof header === "string" && header.length > 0) return header;
        return req.id;
      },
      customProps: (req) => {
        const request = req as typeof req & {
          requestId?: string;
          user?: { id?: string };
        };
        const requestId = request.requestId ?? request.headers[REQUEST_ID_HEADER];
        return {
          type: "http",
          requestId,
          correlationId: request.headers[CORRELATION_ID_HEADER] ?? requestId,
          userId: request.user?.id,
        };
      },
      customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
      customErrorMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode} failed`,
      serializers: {
        req: (req) => ({
          method: req.method,
          url: req.url,
          requestId: (req as { requestId?: string }).requestId,
        }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    },
  };
}

export function buildAppPinoLevel(config: LoggingConfig): LoggingConfig["level"] {
  return config.enabled ? config.level : "error";
}
