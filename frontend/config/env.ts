function requireEnv(value: string | undefined, name: string) {
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

export const env = {
    appName: requireEnv(
        process.env.NEXT_PUBLIC_APP_NAME,
        "NEXT_PUBLIC_APP_NAME",
    ),
    apiUrl: requireEnv(
        process.env.NEXT_PUBLIC_API_URL,
        "NEXT_PUBLIC_API_URL"
    ),
};