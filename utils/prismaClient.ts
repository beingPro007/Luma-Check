// prismaClient.ts (production-safe)
import { PrismaClient } from '@prisma/client';
import { hashPasswordMiddleware } from "../middleware/hashPassword.middlewares";

const prisma = new PrismaClient();
prisma.$use(hashPasswordMiddleware);

export default prisma;