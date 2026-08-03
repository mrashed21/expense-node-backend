import { AuthService } from "./auth.service";
import { User } from "../user/user.model";
import { Admin } from "../admin/admin.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("../user/user.model");
jest.mock("../admin/admin.model");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should throw an error if the user is not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (Admin.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.login({ email: "test@example.com", password: "password", role: "user" })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw an error if the password does not match", async () => {
      const mockUser = {
        _id: "1",
        user_email: "test@example.com",
        user_password: "hashedPassword",
        is_deleted: false,
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.login({ email: "test@example.com", password: "wrongpassword", role: "user" })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("verifyOtp", () => {
    it("should throw error if user not found for OTP validation", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.verifyOtp({ email: "notfound@example.com", otp: "123456" })
      ).rejects.toThrow("User not found");
    });
  });
});
