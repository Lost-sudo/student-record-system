import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { logger } from "../config/logger.js";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
    adapter,
    log: [
        {emit: "event", level: "query"},
        {emit: "event", level: "error"},
        {emit: "event", level: "warn"},
        {emit: "event", level: "info"},
    ],
});

prisma.$on("query", (event) => {
    logger.debug(
        {
            query: event.query,
            params: event.params,
            duration: event.duration,
        },
        "Prisma query",
    );
});

prisma.$on("error", (event) => {
  logger.error(event, "Prisma error");
});

prisma.$on("warn", (event) => {
  logger.warn(event, "Prisma warning");
});

prisma.$on("info", (event) => {
  logger.info(event, "Prisma info");
});
