import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string, fallback?: string) {
    const value = process.env[name] ?? fallback;

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

export const env = {
    nodeEnv: requireEnv("NODE_ENV", "development"),
    host: requireEnv("HOST", "0.0.0.0"),
    port: Number(requireEnv("PORT", "4000")),
    logLevel: requireEnv("LOG_LEVEL", "info"),
    
    jwt: {
        accessSecret: requireEnv("JWT_ACCESS_SECRET"),
        refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
        accessExpiresIn: requireEnv("JWT_ACCESS_EXPIRES_IN", '15m'),
        refreshExpiresIn: requireEnv("JWT_REFRESH_EXPIRES_IN", '7d'),
    },
};