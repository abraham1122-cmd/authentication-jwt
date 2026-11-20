



import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";

import { UsersService } from "../users/users.service.js";
import { RegisterDto } from "./dto/register.dto.js";

interface TokenPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // REGISTER
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const hashedPassword = await argon2.hash(password);

    const user = this.usersService.create(email, hashedPassword);

    return {
      message: "Registration successful",
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  // LOGIN
  async login(email: string, password: string) {
    const user = this.usersService.findByEmail(email);

    if (!user || !(await argon2.verify(user.password, password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.generateTokens(user.id, user.email);
  }

  // GENERATE ACCESS AND REFRESH TOKENS
  private async generateTokens(userId: number, email: string) {
    const payload: TokenPayload = {
      sub: userId,
      email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        process.env.JWT_SECRET || "development-access-secret-change-me",
      expiresIn: "15m",
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        process.env.JWT_REFRESH_SECRET ||
        "development-refresh-secret-change-me",
      expiresIn: "7d",
    });

    // Hash the refresh token before storing it
    const hashedRefreshToken = await argon2.hash(refreshToken);

    this.usersService.updateRefreshTokenHash(
      userId,
      hashedRefreshToken,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  
  async refreshTokens(refreshToken: string) {
    let payload: TokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(
        refreshToken,
        {
          secret:
            process.env.JWT_REFRESH_SECRET ||
            "development-refresh-secret-change-me",
        },
      );
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const user = this.usersService.findById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const isValid = await argon2.verify(
      user.refreshTokenHash,
      refreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Issue new tokens and invalidate the previous refresh token
    return this.generateTokens(user.id, user.email);
  }

  // LOGOUT
  async logout(refreshToken: string) {
    let payload: TokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(
        refreshToken,
        {
          secret:
            process.env.JWT_REFRESH_SECRET ||
            "development-refresh-secret-change-me",
        },
      );
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const user = this.usersService.findById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const isValid = await argon2.verify(
      user.refreshTokenHash,
      refreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Invalidate the stored refresh token
    this.usersService.updateRefreshTokenHash(user.id, null);

    return {
      message: "Logout successful",
    };
  }
}
