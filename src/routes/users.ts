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

  app.post("/sign-in", async (request, reply) => {
    let { sessionId } = request.cookies;

    if (sessionId) {
      return reply.status(409).send({
        error: "User already authenticated",
      });
    }

    const signInBodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { email, password } = signInBodySchema.parse(request.body);

    const user = await knex("users").where({ email }).first();

    if (!user) {
      return reply.status(404).send({
        error: "User not found",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return reply.status(401).send({
        error: "Invalid password",
      });
    }

    sessionId = randomUUID();
    await knex("users").where({ email }).update({ session_id: sessionId });

    reply.setCookie("sessionId", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return reply.status(200).send();
  });
}
