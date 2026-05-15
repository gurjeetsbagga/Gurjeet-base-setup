import { apiRequest, apiStreamRequest } from "./client";
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
  content: string,
  stream = false,
): Promise<Message> {
  const res = await apiRequest<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, stream }),
  });
  return res.data;
}

/** Prepared for SSE streaming when backend supports it */
export function sendMessageStream(conversationId: string, content: string): Promise<Response> {
  return apiStreamRequest(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, stream: true }),
  });
}
