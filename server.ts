import app from "./app";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import fastify from "fastify";

dotenv.config({
    path: ".env",
});

app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
})

app.listen({
    port: 3000,
}).then(() => {
    console.log("Server is running on http://localhost:3000");
}).catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
});