import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { IdParamDto } from "../../common/dto";
import { successResponse } from "../../shared/api-response";
import { paginatedSuccessResponse } from "../../shared/api-response";
import { UserRole } from "../auth/interfaces";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { QueryUsersDto } from "./dto/query-users.dto";

/**
 * User profile endpoints — versioned under /api/v1/users.
 *
 * All routes require authentication (global JwtAuthGuard).
 * Admin-only routes are gated with @Roles(UserRole.ADMIN).
 */
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me — current authenticated user's profile.
   */
  @Get("me")
  async getMyProfile(@CurrentUser("id") userId: string) {
    const profile = await this.usersService.findById(userId);
    return successResponse(profile);
  }

  /**
   * PATCH /users/me — update own profile.
   */
  @Patch("me")
  async updateMyProfile(@CurrentUser("id") userId: string, @Body() dto: UpdateUserDto) {
    const updated = await this.usersService.update(userId, dto);
    return successResponse(updated);
  }

  /**
   * GET /users — admin-only paginated user list.
   */
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: QueryUsersDto) {
    const result = await this.usersService.findMany(query);
    return paginatedSuccessResponse(result.data, result.total, result.page, result.pageSize);
  }

  /**
   * GET /users/:id — admin-only user lookup.
   */
  @Get(":id")
  @Roles(UserRole.ADMIN)
  async findOne(@Param() { id }: IdParamDto) {
    const profile = await this.usersService.findById(id);
    return successResponse(profile);
  }

  /**
   * PATCH /users/:id — admin-only user update.
   */
  @Patch(":id")
  @Roles(UserRole.ADMIN)
  async update(@Param() { id }: IdParamDto, @Body() dto: UpdateUserDto) {
    const updated = await this.usersService.update(id, dto);
    return successResponse(updated);
  }

  /**
   * DELETE /users/:id — admin-only soft-delete.
   */
  @Delete(":id")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@Param() { id }: IdParamDto) {
    await this.usersService.deactivate(id);
  }
}
