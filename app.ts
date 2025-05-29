import { default as fastify } from "fastify";

const app = fastify({
    logger: true,
    trustProxy: true,
})

export default app;