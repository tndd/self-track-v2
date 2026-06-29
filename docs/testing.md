# Testing Policy & Guidelines

This document outlines the testing strategy, mocking rules, and test structure for Self-Track v2.

---

## 🧪 Unit Testing for Mathematical Logic

All analytical functions located in `src/lib/analysis/` must remain pure functions.
- **No Database Mocking**: Test them directly in unit tests (`__tests__/`) using plain JavaScript objects. Do not introduce database mocks, ORM wrappers, or complex setup code inside these tests. Keep the mathematical logic isolated and directly verifiable.

## 🌐 API Route Testing

API route tests under `src/app/api/__tests__/` must isolate API-level validation and handler logic from real database execution.
- **Database Mocking**: Use the mocked database client (`vi.mock("@/db")`) to bypass actual database connections. Do not spin up real databases or Docker containers for regular API integration tests.
