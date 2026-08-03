import { AdminService } from "./admin.service";
import { User } from "../user/user.model";
import { AdminRole } from "./admin.interface";

// Mock the Mongoose models
jest.mock("../user/user.model");
jest.mock("./admin.model");
jest.mock("../transaction/transaction.model");

describe("AdminService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should return a list of non-deleted users", async () => {
      const mockUsers = [{ _id: "1", user_name: "Test User" }];
      
      const leanMock = jest.fn().mockResolvedValue(mockUsers);
      const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
      
      (User.find as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      const result = await AdminService.getUsers(50);
      expect(result).toEqual(mockUsers);
      expect(User.find).toHaveBeenCalledWith({ is_deleted: false });
      expect(selectMock).toHaveBeenCalledWith("-user_password");
      expect(limitMock).toHaveBeenCalledWith(50);
    });
  });

  describe("deleteUser", () => {
    it("should forbid deletion if role is not super_admin", async () => {
      await expect(AdminService.deleteUser("1", AdminRole.ADMIN)).rejects.toThrow("Only super_admin can delete users");
    });

    it("should successfully soft delete a user", async () => {
      const mockDeletedUser = { _id: "1", is_deleted: true };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockDeletedUser);

      const result = await AdminService.deleteUser("1", AdminRole.SUPER_ADMIN);
      expect(result).toBe(true);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        { is_deleted: true, user_status: "deleted" },
        { new: true }
      );
    });
  });
});
