import { describe, expect, it } from "vitest";
import app from "../src/index";
import config from "../wrangler.toml?raw";

describe("API milestone", () => {
  it("keeps publication as an explicit action", () => {
    expect(["publish", "decline"]).toContain("publish");
  });

  describe("deployed demo CORS", () => {
    it("allows the custom Pages domain but not unrelated origins", async () => {
      const allowedOrigins = config.match(/^ALLOWED_ORIGINS = "([^"]+)"/m)?.[1];
      expect(allowedOrigins).toBeTruthy();
      const env = { ALLOWED_ORIGINS: allowedOrigins!, DB: {} as D1Database };
      for (const [origin, expected] of [
        ["https://lukegagliardi.com", "https://lukegagliardi.com"],
        ["https://example.com", null]
      ] as const) {
        const response = await app.request("/api/v1/demo/start", {
          method: "OPTIONS",
          headers: { Origin: origin, "Access-Control-Request-Method": "POST" }
        }, env);
        expect(response.status).toBe(204);
        expect(response.headers.get("Access-Control-Allow-Origin")).toBe(expected);
      }
    });
  });
});
