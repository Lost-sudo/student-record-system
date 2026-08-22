import { env } from "./env.js";

export const jwtConfig = {
    access: {
        secret: env.jwt.accessSecret,
        expiresIn: env.jwt.accessExpiresIn,
    },
    refresh: {
        secret: env.jwt.refreshSecret,
        expiresIn: env.jwt.refreshExpiresIn,
    },
    issuer: "SRS-Server",
    audience: "SRS-Client"
}