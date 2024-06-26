import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";

describe("Meals Routes", () => {
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

  it("should be able to create meal", async () => {
    await request(app.server)
      .post("/auth/sign-up")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(201);

    const signInResponse = await request(app.server)
      .post("/auth/sign-in")
      .send({
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(200);

    const cookies = signInResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies!)
      .send({
        name: "Burger",
        description: "Delicious Burger",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);
  });

  it("should be able to list meals", async () => {
    await request(app.server)
      .post("/auth/sign-up")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(201);

    const signInResponse = await request(app.server)
      .post("/auth/sign-in")
      .send({
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(200);

    const cookies = signInResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies!)
      .send({
        name: "Burger",
        description: "Delicious Burger",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies!)
      .send({
        name: "Pizza",
        description: "Delicious Pizza",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies!)
      .expect(200);

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: "Burger",
        description: "Delicious Burger",
        is_on_diet: 0,
      }),
      expect.objectContaining({
        name: "Pizza",
        description: "Delicious Pizza",
        is_on_diet: 0,
      }),
    ]);
  });

  it("should be able to update meal", async () => {
    await request(app.server)
      .post("/auth/sign-up")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(201);

    const signInResponse = await request(app.server)
      .post("/auth/sign-in")
      .send({
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(200);

    const cookies = signInResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies!)
      .send({
        name: "Burger",
        description: "Delicious Burger",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies!)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set("Cookie", cookies!)
      .send({
        name: "Salad",
        description: "Delicious Salad",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(204);
  });

  it("should be able to delete a meal", async () => {
    await request(app.server)
      .post("/auth/sign-up")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(201);

    const signInResponse = await request(app.server)
      .post("/auth/sign-in")
      .send({
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(200);

    const cookies = signInResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies!)
      .send({
        name: "Burger",
        description: "Delicious Burger",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies!)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies!)
      .expect(204);
  });

  it("should be able to view a meal", async () => {
    await request(app.server)
      .post("/auth/sign-up")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(201);

    const signInResponse = await request(app.server)
      .post("/auth/sign-in")
      .send({
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(200);

    const cookies = signInResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies!)
      .send({
        name: "Burger",
        description: "Delicious Burger",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies!)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    const viewMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies!)
      .expect(200);

    expect(viewMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: "Burger",
        description: "Delicious Burger",
        is_on_diet: 0,
      })
    );
  });

  it("should be able to view a summary of meals", async () => {
    await request(app.server)
      .post("/auth/sign-up")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(201);

    const signInResponse = await request(app.server)
      .post("/auth/sign-in")
      .send({
        email: "johndoe@example.com",
        password: "12345678",
      })
      .expect(200);

    const cookies = signInResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies!)
      .send({
        name: "Burger",
        description: "Delicious Burger",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies!)
      .send({
        name: "Pizza",
        description: "Delicious Pizza",
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201);

    const summaryMealsResponse = await request(app.server)
      .get("/meals/summary")
      .set("Cookie", cookies!)
      .expect(200);

    expect(summaryMealsResponse.body.summary).toEqual({
      totalMeals: 2,
      totalMealsOnDiet: 0,
      totalMealsNotOnDiet: 2,
      onDietMealsStreak: 0,
    });
  });
});
