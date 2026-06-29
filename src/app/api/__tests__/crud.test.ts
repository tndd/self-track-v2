import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
const mockFindMany = vi.fn();
const mockInsert = vi.fn();
const mockReturning = vi.fn();

vi.mock("@/db", () => ({
  db: {
    query: {
      actions: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
      },
    },
    insert: () => ({
      values: (...args: unknown[]) => {
        mockInsert(...args);
        return { returning: () => mockReturning() };
      },
    }),
  },
}));

describe("POST /api/actions - Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReturning.mockResolvedValue([{
      id: "test-uuid",
      name: "Test Action",
      groupId: null,
      defaultIntensity: 1,
      sortOrder: 0,
      createdAt: new Date(),
    }]);
  });

  it("rejects empty name", async () => {
    const { POST } = await import("@/app/api/actions/route");

    const request = new Request("http://localhost/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejects missing name", async () => {
    const { POST } = await import("@/app/api/actions/route");

    const request = new Request("http://localhost/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("accepts valid action with name only", async () => {
    const { POST } = await import("@/app/api/actions/route");

    const request = new Request("http://localhost/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "ビタミンD" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("accepts valid action with all fields", async () => {
    const { POST } = await import("@/app/api/actions/route");

    const request = new Request("http://localhost/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "ランニング",
        groupId: "550e8400-e29b-41d4-a716-446655440000",
        defaultIntensity: 3,
        sortOrder: 5,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("accepts nullable groupId", async () => {
    const { POST } = await import("@/app/api/actions/route");

    const request = new Request("http://localhost/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", groupId: null }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});

describe("POST /api/action-groups - Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReturning.mockResolvedValue([{
      id: "test-uuid",
      name: "Test Group",
      color: "#ff0000",
      sortOrder: 0,
      createdAt: new Date(),
    }]);
  });

  it("rejects empty name", async () => {
    const { POST } = await import("@/app/api/action-groups/route");

    const request = new Request("http://localhost/api/action-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("accepts valid group", async () => {
    const { POST } = await import("@/app/api/action-groups/route");

    const request = new Request("http://localhost/api/action-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "サプリ", color: "#3b82f6", sortOrder: 1 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});

describe("POST /api/symptoms - Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReturning.mockResolvedValue([{
      id: "test-uuid",
      name: "Test Symptom",
      color: "#ef4444",
      sortOrder: 0,
      createdAt: new Date(),
    }]);
  });

  it("rejects empty name", async () => {
    const { POST } = await import("@/app/api/symptoms/route");

    const request = new Request("http://localhost/api/symptoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("accepts valid symptom", async () => {
    const { POST } = await import("@/app/api/symptoms/route");

    const request = new Request("http://localhost/api/symptoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "頭痛", color: "#ef4444" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
