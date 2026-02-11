// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  generateAccessToken,
  verifyToken,
  decodeToken,
} from "./jwtService.js";

describe("jwtService", () => {
  it("generates and verifies an access token", async () => {
    const token = await generateAccessToken({
      user_id: "test-user",
      user_name: "Test User",
      login_type: "normal",
    });

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const result = await verifyToken(token);
    expect(result.valid).toBe(true);
    expect(result.payload.user_id).toBe("test-user");
    expect(result.payload.user_name).toBe("Test User");
    expect(result.payload.login_type).toBe("normal");
    expect(typeof result.payload.issued_at_micro).toBe("number");
    expect(result.payload.issued_at_micro).toBeGreaterThan(0);

    const decoded = decodeToken(token);
    expect(decoded.user_id).toBe("test-user");
  });
});
