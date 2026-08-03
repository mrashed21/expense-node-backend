import { UserService } from "./user.service";
import { User } from "./user.model";
import { Device } from "./device.model";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { UserStatus } from "./user.interface";

jest.mock("./user.model");
jest.mock("./device.model");
jest.mock("bcrypt");

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return user profile if found", async () => {
      const mockUser = { _id: "1", user_email: "test@test.com", is_deleted: false };
      
      const mockSelect = jest.fn().mockReturnThis();
      const mockLean = jest.fn().mockResolvedValue(mockUser);
      
      (User.findById as jest.Mock).mockReturnValue({
        select: mockSelect,
        lean: mockLean,
      });

      const result = await UserService.getProfile("1");
      
      expect(result).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith("1");
      expect(mockSelect).toHaveBeenCalledWith("-user_password");
    });

    it("should throw error if user not found", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockLean = jest.fn().mockResolvedValue(null);
      
      (User.findById as jest.Mock).mockReturnValue({
        select: mockSelect,
        lean: mockLean,
      });

      await expect(UserService.getProfile("1")).rejects.toThrow("User profile not found.");
    });
  });

  describe("changePassword", () => {
    it("should change password if current password matches", async () => {
      const mockUser = {
        _id: "1",
        user_password: "oldHash",
        token_version: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHash");

      const result = await UserService.changePassword("1", "oldPass", "newPass");

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith("oldPass", "oldHash");
      expect(bcrypt.hash).toHaveBeenCalledWith("newPass", 12);
      expect(mockUser.user_password).toBe("newHash");
      expect(mockUser.token_version).toBe(1);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should throw error if current password is wrong", async () => {
      const mockUser = {
        _id: "1",
        user_password: "oldHash",
      };

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(UserService.changePassword("1", "wrongPass", "newPass"))
        .rejects.toThrow("Current password is incorrect.");
    });
  });

  describe("revokeDevice", () => {
    it("should delete device and return true", async () => {
      (Device.findOneAndDelete as jest.Mock).mockResolvedValue({ _id: "device1" });

      const result = await UserService.revokeDevice("user1", "device1");
      expect(result).toBe(true);
      expect(Device.findOneAndDelete).toHaveBeenCalledWith({ user_id: "user1", _id: "device1" });
    });

    it("should throw error if device not found", async () => {
      (Device.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(UserService.revokeDevice("user1", "device1"))
        .rejects.toThrow("Device not found");
    });
  });
});
