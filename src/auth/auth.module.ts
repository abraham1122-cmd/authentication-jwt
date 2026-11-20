import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { UsersModule } from "../users/users.module.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: false,
      secret: process.env.JWT_SECRET || "development-secret-change-me",
      signOptions: {
        expiresIn: "15m",
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}