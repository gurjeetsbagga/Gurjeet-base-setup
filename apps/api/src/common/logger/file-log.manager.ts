import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import fs from "node:fs";
import path from "node:path";
import type { Writable } from "node:stream";
import * as rfs from "rotating-file-stream";
import { loggingConfig } from "../../config/configs/logging.config";
import type { AiAuditFileCategory } from "./ai-audit-categories";
import { AUDIT_FILE_NAMES } from "./ai-audit-categories";

export type ApiLogChannel = "combined" | "error" | "ai" | "http";

const API_LOG_FILES: Record<ApiLogChannel, string> = {
  combined: "combined.log",
  error: "error.log",
  ai: "ai.log",
  http: "http.log",
};

@Injectable()
export class FileLogManager implements OnModuleInit, OnModuleDestroy {
  private readonly streams = new Map<string, Writable>();

  constructor(
    @Inject(loggingConfig.KEY)
    private readonly config: ConfigType<typeof loggingConfig>,
  ) {}

  get isEnabled(): boolean {
    return this.config.logFileEnabled;
  }

  onModuleInit(): void {
    if (!this.config.logFileEnabled) return;
    this.ensureDirectories();
    this.pruneExpiredFiles();
  }

  onModuleDestroy(): void {
    for (const stream of this.streams.values()) {
      stream.end();
    }
    this.streams.clear();
  }

  getApiStream(channel: ApiLogChannel): Writable | null {
    if (!this.config.logFileEnabled) return null;
    return this.getStream(path.join("api", API_LOG_FILES[channel]));
  }

  getAuditStream(category: AiAuditFileCategory): Writable | null {
    if (!this.config.logFileEnabled) return null;
    return this.getStream(path.join("audit", AUDIT_FILE_NAMES[category]));
  }

  writeAudit(category: AiAuditFileCategory, payload: Record<string, unknown>): void {
    if (!this.config.logFileEnabled) return;
    const relativePath = path.join("audit", AUDIT_FILE_NAMES[category]);
    const absolutePath = path.join(this.config.logDirectory, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.appendFileSync(absolutePath, `${JSON.stringify(payload)}\n`, "utf8");
  }

  private getStream(relativePath: string): Writable {
    const existing = this.streams.get(relativePath);
    if (existing) return existing;

    const absolutePath = path.join(this.config.logDirectory, relativePath);
    const stream = this.createRotatingStream(absolutePath);
    this.streams.set(relativePath, stream);
    return stream;
  }

  private createRotatingStream(filePath: string): Writable {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });

    if (!this.config.logRotationEnabled) {
      return fs.createWriteStream(filePath, { flags: "a" });
    }

    return rfs.createStream(path.basename(filePath), {
      path: dir,
      size: this.config.logMaxFileSize,
      maxFiles: this.config.logMaxFiles,
      compress: "gzip",
    });
  }

  private ensureDirectories(): void {
    fs.mkdirSync(path.join(this.config.logDirectory, "api"), { recursive: true });
    fs.mkdirSync(path.join(this.config.logDirectory, "audit"), { recursive: true });
  }

  pruneExpiredFiles(): void {
    if (!this.config.logFileEnabled) return;
    const cutoff = Date.now() - this.config.logRetentionDays * 24 * 60 * 60 * 1000;

    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.name.endsWith(".log") && !entry.name.endsWith(".gz")) continue;
        if (fs.statSync(full).mtimeMs < cutoff) {
          fs.unlinkSync(full);
        }
      }
    };

    walk(this.config.logDirectory);
  }
}
