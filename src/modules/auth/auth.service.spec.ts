import { AuthService } from "./auth.service";
import { User } from "../user/user.model";
import { Otp } from "./auth.model";
import bcrypt from "bcrypt";
import httpStatus from "http-status";

jest.mock("../user/user.model");
jest.mock("../admin/admin.model");
jest.mock("./auth.model");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("@/utils/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    const clientInfo = {
      ip: "127.0.0.1",
      userAgent: "jest",
    };

    it("should throw an error if the user is not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.login(
          { user_email: "test@example.com", user_password: "password" },
          clientInfo,
        ),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw an error if the password does not match", async () => {
      const mockUser = {
        _id: "1",
        user_email: "test@example.com",
        user_password: "hashedPassword",
        is_deleted: false,
        user_status: "active",
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.login(
          { user_email: "test@example.com", user_password: "wrongpassword" },
          clientInfo,
        ),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("verifyOtp", () => {
    it("should throw error if OTP is invalid", async () => {
      (Otp.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      await expect(
        AuthService.verifyOtp("notfound@example.com", "123456"),
      ).rejects.toThrow("Invalid or expired OTP code.");
    });
  });
});
