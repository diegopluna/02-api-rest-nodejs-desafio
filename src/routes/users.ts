import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/sign-up", async (request, reply) => {
    const { sessionId } = request.cookies;

    if (sessionId) {
      return reply.status(409).send({
        error: "User already authenticated",
      });
    }

    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = createUserBodySchema.parse(request.body);

    const passwordHash = await bcrypt.hash(password, 10);
    try {
      await knex("users").insert({
        id: randomUUID(),
        session_id: randomUUID(),
        name,
        email,
        password: passwordHash,
      });
    } catch (error) {
      return reply.status(409).send({
        error: "User already exists",
      });
    }

    return reply.status(201).send();
  });
}
