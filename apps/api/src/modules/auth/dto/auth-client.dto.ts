import type { AuthResponseDto } from "./auth-response.dto";

/** Flat auth payload expected by web/mobile clients inside `data`. */
export interface AuthClientDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthResponseDto["user"];
}

export function toAuthClientDto(response: AuthResponseDto): AuthClientDto {
  return {
    accessToken: response.tokens.accessToken,
    refreshToken: response.tokens.refreshToken,
    expiresIn: response.tokens.expiresIn,
    user: response.user,
  };
}
