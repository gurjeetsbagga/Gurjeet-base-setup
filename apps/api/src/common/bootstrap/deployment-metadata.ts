import type { Logger } from "nestjs-pino";

export interface DeploymentMetadata {
  environment: string;
  gitSha: string;
  railwayService?: string;
  railwayDeploymentId?: string;
  nodeEnv: string;
  nodeVersion: string;
  appVersion: string;
  deploymentStartedAt: string;
}

/** Collect deployment metadata from Railway / CI environment variables. */
export function collectDeploymentMetadata(): DeploymentMetadata {
  return {
    environment:
      process.env.RAILWAY_ENVIRONMENT_NAME ??
      process.env.RAILWAY_ENVIRONMENT ??
      process.env.NODE_ENV ??
      "unknown",
    gitSha:
      process.env.RAILWAY_GIT_COMMIT_SHA ??
      process.env.GIT_COMMIT_SHA ??
      process.env.COMMIT_SHA ??
      "unknown",
    railwayService: process.env.RAILWAY_SERVICE_NAME,
    railwayDeploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    nodeVersion: process.version,
    appVersion: process.env.npm_package_version ?? "0.0.0",
    deploymentStartedAt: new Date().toISOString(),
  };
}

/** Log deployment metadata at API boot (production debugging). */
export function logDeploymentMetadata(logger: Logger): void {
  const meta = collectDeploymentMetadata();

  logger.log(`[api] Environment: ${meta.environment}`, "Deployment");
  logger.log(`[api] Git SHA: ${meta.gitSha}`, "Deployment");
  logger.log(`[api] Deployment started: ${meta.deploymentStartedAt}`, "Deployment");
  logger.log(`[api] NODE_ENV: ${meta.nodeEnv}`, "Deployment");
  logger.log(`[api] Node version: ${meta.nodeVersion}`, "Deployment");
  logger.log(`[api] Application version: ${meta.appVersion}`, "Deployment");

  if (meta.railwayService) {
    logger.log(`[api] Railway service: ${meta.railwayService}`, "Deployment");
  }
  if (meta.railwayDeploymentId) {
    logger.log(`[api] Railway deployment: ${meta.railwayDeploymentId}`, "Deployment");
  }
}
