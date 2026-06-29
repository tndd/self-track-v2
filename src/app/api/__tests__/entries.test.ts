import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module before importing the route handler
const mockFindMany = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockReturning = vi.fn();
const mockValues = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/db", () => ({
  db: {
    query: {
      entries: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
    insert: () => ({
      values: (...args: unknown[]) => {
        mockValues(...args);
        return { returning: () => mockReturning() };
      },
    }),
    transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
      // Create a mock transaction object
      const tx = {
        insert: () => ({
          values: (...args: unknown[]) => {
            mockValues(...args);
            return { returning: () => mockReturning() };
          },
        }),
        query: {
          entries: {
            findFirst: (...args: unknown[]) => mockFindFirst(...args),
          },
        },
      };
      return fn(tx);
    },
  },
}));

describe("POST /api/entries - Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    mockReturning.mockResolvedValue([{ id: "test-uuid", timestamp: new Date(), condition: 3, memo: null }]);
    mockFindFirst.mockResolvedValue({
      id: "test-uuid",
      timestamp: new Date(),
      condition: 3,
      memo: null,
      entryActions: [],
      entrySymptoms: [],
    });
  });

  it("rejects empty entry (no condition, no memo, no actions, no symptoms)", async () => {
    // Dynamic import after mocks are set up
    const { POST } = await import("@/app/api/entries/route");

    const request = new Request("http://localhost/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid data");
  });

  it("rejects condition out of range", async () => {
    const { POST } = await import("@/app/api/entries/route");

    const request = new Request("http://localhost/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condition: 6 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejects condition of 0", async () => {
    const { POST } = await import("@/app/api/entries/route");

    const request = new Request("http://localhost/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condition: 0 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("accepts valid condition-only entry", async () => {
    const { POST } = await import("@/app/api/entries/route");

    const request = new Request("http://localhost/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condition: 3 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("accepts valid memo-only entry", async () => {
    const { POST } = await import("@/app/api/entries/route");

    const request = new Request("http://localhost/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memo: "Feeling good today" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("accepts actions with 'id' field (frontend format)", async () => {
    const { POST } = await import("@/app/api/entries/route");

    const request = new Request("http://localhost/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actions: [
          { id: "550e8400-e29b-41d4-a716-446655440000", intensity: 2 },
        ],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("accepts actions with 'actionId' field (canonical format)", async () => {
    const { POST } = await import("@/app/api/entries/route");

    const request = new Request("http://localhost/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actions: [
          { actionId: "550e8400-e29b-41d4-a716-446655440000", intensity: 1 },
        ],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("accepts symptoms as string array (frontend format)", async () => {
    const { POST } = await import("@/app/api/entries/route");

    const request = new Request("http://localhost/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symptoms: ["550e8400-e29b-41d4-a716-446655440000"],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("accepts symptoms as object array (canonical format)", async () => {
    const { POST } = await import("@/app/api/entries/route");

    const request = new Request("http://localhost/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symptoms: [{ symptomId: "550e8400-e29b-41d4-a716-446655440000" }],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("rejects action without id or actionId", async () => {
    const { POST } = await import("@/app/api/entries/route");

    const request = new Request("http://localhost/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actions: [{ intensity: 2 }], // Missing id/actionId
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
