import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export const REQUEST_ID_HEADER = "x-request-id";
export const CORRELATION_ID_HEADER = "x-correlation-id";

/** End-to-end trace identifiers propagated across Auryn layers. */
export interface CorrelationContext {
  requestId: string;
  correlationId: string;
  userId?: string;
  conversationId?: string;
  orchestrationId?: string;
  streamId?: string;
}

const storage = new AsyncLocalStorage<CorrelationContext>();

export function getCorrelationContext(): CorrelationContext | undefined {
  return storage.getStore();
}

export function runWithCorrelationContext<T>(context: CorrelationContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function patchCorrelationContext(patch: Partial<CorrelationContext>): CorrelationContext {
  const current = storage.getStore();
  const next: CorrelationContext = {
    requestId: patch.requestId ?? current?.requestId ?? randomUUID(),
    correlationId: patch.correlationId ?? current?.correlationId ?? randomUUID(),
    userId: patch.userId ?? current?.userId,
    conversationId: patch.conversationId ?? current?.conversationId,
    orchestrationId: patch.orchestrationId ?? current?.orchestrationId,
    streamId: patch.streamId ?? current?.streamId,
  };
  if (current) {
    Object.assign(current, next);
    return current;
  }
  return next;
}

/** Merge active correlation IDs into log/audit payloads. */
export function withCorrelationFields(
  fields: Record<string, unknown> = {},
): Record<string, unknown> {
  const ctx = getCorrelationContext();
  if (!ctx) return fields;
  return {
    requestId: ctx.requestId,
    correlationId: ctx.correlationId,
    ...(ctx.userId ? { userId: ctx.userId } : {}),
    ...(ctx.conversationId ? { conversationId: ctx.conversationId } : {}),
    ...(ctx.orchestrationId ? { orchestrationId: ctx.orchestrationId } : {}),
    ...(ctx.streamId ? { streamId: ctx.streamId } : {}),
    ...fields,
  };
}

export function createRequestCorrelation(
  requestId: string,
  correlationId?: string,
): CorrelationContext {
  return {
    requestId,
    correlationId: correlationId ?? requestId,
  };
}
