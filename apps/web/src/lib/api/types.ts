/** API response envelope from NestJS backend */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ApiErrorBody {
  success: false;
  error: {
    statusCode: number;
    message: string | string[];
    code?: string;
  };
}

export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";
export type MessageStatus = "PENDING" | "STREAMING" | "COMPLETED" | "FAILED";
export type ConversationStatus = "ACTIVE" | "ARCHIVED" | "DELETED";

export interface Conversation {
  id: string;
  title: string | null;
  status: ConversationStatus;
  model: string | null;
  summary: string | null;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  status: MessageStatus;
  content: string;
  tokenCount: number | null;
  metadata: Record<string, unknown>;
  feedbackRating: string | null;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string | null;
  roles?: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
}

export interface UserProfile {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  wellnessGoal?: string | null;
  recoveryCategory?: string | null;
  activeProtocol?: string | null;
  restrictionsAllergies?: string | null;
  productPreferences?: string | null;
  importantNotes?: string | null;
  conversationSummary?: string | null;
}
