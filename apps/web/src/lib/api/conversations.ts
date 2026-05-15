import { apiRequest, apiStreamRequest } from "./client";
import { parseSseStream } from "./parse-sse-stream";
import type { StreamMessageEvent } from "./stream-events";
import type { ApiResponse, Conversation, Message, PaginatedResponse } from "./types";

export async function listConversations(page = 1, pageSize = 20): Promise<Conversation[]> {
  const res = await apiRequest<PaginatedResponse<Conversation>>(
    `/conversations?page=${page}&pageSize=${pageSize}`,
  );
  return res.data;
}

export async function getConversation(id: string): Promise<Conversation> {
  const res = await apiRequest<ApiResponse<Conversation>>(`/conversations/${id}`);
  return res.data;
}

export async function createConversation(title?: string): Promise<Conversation> {
  const res = await apiRequest<ApiResponse<Conversation>>("/conversations", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  return res.data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const res = await apiRequest<ApiResponse<Message[]>>(`/conversations/${conversationId}/messages`);
  return res.data;
}

export async function sendMessage(
  conversationId: string,
  message: string,
  stream = false,
): Promise<Message> {
  const res = await apiRequest<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message, stream }),
  });
  return res.data;
}

export function sendMessageStream(conversationId: string, message: string): Promise<Response> {
  return apiStreamRequest(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message, stream: true }),
  });
}

/** Consume SSE stream from POST messages with stream=true */
export async function* streamMessage(
  conversationId: string,
  message: string,
): AsyncGenerator<StreamMessageEvent> {
  const response = await sendMessageStream(conversationId, message);
  yield* parseSseStream<StreamMessageEvent>(response);
}
