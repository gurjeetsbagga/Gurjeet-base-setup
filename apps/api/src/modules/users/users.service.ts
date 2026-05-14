import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { normalizePagination, paginatedResponse } from "../../shared/pagination";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import type { QueryUsersDto } from "./dto/query-users.dto";
import type { UserProfile, UserPreferences } from "./interfaces";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new application user linked to a Supabase Auth user.
   * Called internally by the auth flow after Supabase signup succeeds.
   */
  async create(dto: CreateUserDto): Promise<UserProfile> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ authId: dto.authId }, { email: dto.email }] },
    });

    if (existing) {
      throw new ConflictException("User with this email or auth ID already exists");
    }

    const user = await this.prisma.user.create({
      data: {
        authId: dto.authId,
        email: dto.email,
        role: dto.role,
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
      },
    });

    this.logger.log(`User created: ${user.id}`);
    return this.toProfile(user);
  }

  /**
   * Find a user by their internal UUID.
   */
  async findById(id: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return this.toProfile(user);
  }

  /**
   * Find a user by their Supabase Auth ID.
   * Primary lookup method after JWT validation.
   */
  async findByAuthId(authId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({ where: { authId } });
    if (!user) throw new NotFoundException("User not found");
    return this.toProfile(user);
  }

  /**
   * Find a user by email.
   */
  async findByEmail(email: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toProfile(user) : null;
  }

  /**
   * Paginated, filterable user listing (admin use).
   */
  async findMany(query: QueryUsersDto) {
    const { skip, take, page, pageSize } = normalizePagination(query);

    const where: Prisma.UserWhereInput = {
      isActive: true,
      ...(query.role && { role: query.role }),
      ...(query.onboardingStatus && { onboardingStatus: query.onboardingStatus }),
      ...(query.search && {
        OR: [
          { email: { contains: query.search, mode: "insensitive" as const } },
          { displayName: { contains: query.search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginatedResponse(
      users.map((u) => this.toProfile(u)),
      total,
      page,
      pageSize,
    );
  }

  /**
   * Update a user's mutable profile fields.
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserProfile> {
    await this.ensureExists(id);

    const data: Prisma.UserUpdateInput = {};
    if (dto.displayName !== undefined) data.displayName = dto.displayName;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (dto.onboardingStatus !== undefined) data.onboardingStatus = dto.onboardingStatus;
    if (dto.preferences !== undefined) data.preferences = dto.preferences as Prisma.InputJsonValue;

    const user = await this.prisma.user.update({ where: { id }, data });

    this.logger.log(`User updated: ${id}`);
    return this.toProfile(user);
  }

  /**
   * Soft-delete a user by marking them inactive.
   */
  async deactivate(id: string): Promise<void> {
    await this.ensureExists(id);

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`User deactivated: ${id}`);
  }

  // ── helpers ──────────────────────────────────────────────

  private async ensureExists(id: string) {
    const count = await this.prisma.user.count({ where: { id } });
    if (count === 0) throw new NotFoundException("User not found");
  }

  /**
   * Map a Prisma User row to the application-layer UserProfile.
   * Single place to control what gets exposed.
   */
  private toProfile(user: {
    id: string;
    email: string;
    role: string;
    displayName: string | null;
    avatarUrl: string | null;
    onboardingStatus: string;
    preferences: unknown;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserProfile {
    return {
      id: user.id,
      email: user.email,
      role: user.role as UserProfile["role"],
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      onboardingStatus: user.onboardingStatus as UserProfile["onboardingStatus"],
      preferences: (user.preferences ?? {}) as UserPreferences,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
