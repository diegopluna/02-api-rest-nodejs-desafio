import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";

describe("Auth Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create user", async () => {
    await request(app.server)
      .post("/auth/sign-up")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(201);
  });

  it.todo("should be able to authenticate user");
});
