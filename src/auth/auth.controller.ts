import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";

import { AuthService } from "./auth.service.js";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guards.js";
import { RefreshTokenDto } from "./dto/refresh-token.dto.js";

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(
      loginDto.email,
      loginDto.password,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }


  @Post("logout")
logout(@Body() refreshTokenDto: RefreshTokenDto) {
  return this.authService.logout(
    refreshTokenDto.refreshToken,
  );
}
}