import request from "supertest";
import app from "./app";

describe("Express Application Integration Tests", () => {
  describe("GET /health", () => {
    it("should return 200 OK and health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "healthy");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("404 Not Found Handler", () => {
    it("should return 404 for an unknown API route", async () => {
      const response = await request(app).get("/api/v1/unknown-route");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Not Found");
    });
  });
});
