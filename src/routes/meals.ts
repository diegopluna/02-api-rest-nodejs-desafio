import { FastifyInstance } from "fastify";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    "/",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const user = request.user;

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      });

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body
      );

      await knex("meals").insert({
        id: randomUUID(),
        user_id: user?.id,
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime(),
      });

      return reply.status(201).send();
    }
  );
  app.get(
    "/",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const user = request.user;

      const meals = await knex("meals").where("user_id", user?.id).select("*");

      return reply.status(200).send({ meals });
    }
  );
  app.put(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const mealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = mealParamsSchema.parse(request.params);
      const user = request.user;

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      });

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body
      );

      const meal = await knex("meals").where("id", id).first();

      if (!meal) {
        throw reply.status(404).send({ error: "Meal not found" });
      }

      await knex("meals").where({ id: id, user_id: user?.id }).update({
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime(),
      });

      return reply.status(204).send();
    }
  );

  app.delete(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const mealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = mealParamsSchema.parse(request.params);
      const user = request.user;

      const meal = await knex("meals")
        .where({ id: id, user_id: user?.id })
        .first();

      if (!meal) {
        throw reply.status(404).send({ error: "Meal not found" });
      }

      await knex("meals").where({ id: id, user_id: user?.id }).delete();

      return reply.status(204).send();
    }
  );

  app.get(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const mealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = mealParamsSchema.parse(request.params);
      const user = request.user;

      const meal = await knex("meals")
        .where({ id: id, user_id: user?.id })
        .first();

      if (!meal) {
        throw reply.status(404).send({ error: "Meal not found" });
      }

      return reply.status(200).send({ meal });
    }
  );

  app.get(
    "/summary",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const user = request.user;

      const meals = await knex("meals").where("user_id", user?.id).select("*");

      const totalMeals = meals.length;
      const totalMealsOnDiet = meals.filter((meal) => meal.is_on_diet).length;
      const totalMealsNotOnDiet = meals.filter(
        (meal) => !meal.is_on_diet
      ).length;
      const onDietMealsStreak = meals.reduce(
        (acc, meal) => {
          if (meal.is_on_diet) {
            acc.current += 1;
            acc.longest = Math.max(acc.current, acc.longest);
          } else {
            acc.current = 0;
          }

          return acc;
        },
        { current: 0, longest: 0 }
      );

      const summary = {
        totalMeals,
        totalMealsOnDiet,
        totalMealsNotOnDiet,
        onDietMealsStreak: onDietMealsStreak.longest,
      };

      return reply.status(200).send({ summary });
    }
  );
}
