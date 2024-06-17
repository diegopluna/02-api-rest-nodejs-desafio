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
}
