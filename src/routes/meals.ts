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

      console.log("pass");

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body
      );

      console.log("pass");

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
}
