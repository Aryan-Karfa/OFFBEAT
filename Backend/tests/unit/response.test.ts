import { describe, it, expect, vi } from "vitest";
import { sendSuccess, sendError } from "../../src/lib/http/response.js";
import type { Response } from "express";

function createMockResponse(): Response {
  const res: Partial<Response> = {
    req: { requestId: "test_req_123" } as unknown as Response["req"],
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response;
}

describe("Response Envelopes", () => {
  it("sendSuccess should format standard success envelope", () => {
    const res = createMockResponse();
    const data = { message: "Hello world" };

    sendSuccess(res, data, 200, { customMeta: "present" });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { message: "Hello world" },
      meta: expect.objectContaining({
        requestId: "test_req_123",
        customMeta: "present",
        timestamp: expect.any(String),
      }),
    });
  });

  it("sendError should format standard error envelope", () => {
    const res = createMockResponse();
    const error = {
      code: "NOT_FOUND",
      message: "Item not found",
      details: [{ field: "id", message: "Not found" }],
    };

    sendError(res, error, 404);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Item not found",
        details: [{ field: "id", message: "Not found" }],
      },
      meta: expect.objectContaining({
        requestId: "test_req_123",
        timestamp: expect.any(String),
      }),
    });
  });
});
