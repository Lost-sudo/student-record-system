import { env } from "./env";

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