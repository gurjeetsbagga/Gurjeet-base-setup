import type { UserRole } from "../interfaces";

/**
 * Shape of successful authentication responses.
 * Used as the return type for login/register/refresh endpoints.
 */
export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    displayName?: string;
    roles: UserRole[];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
