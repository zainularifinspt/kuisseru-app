import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification
        }
    }),
    emailAndPassword: {
        enabled: true
    },
    plugins: [
        admin()
    ],
    secret: process.env.BETTER_AUTH_SECRET || "fallback_secret_for_development_only_12345",
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.URL || "http://localhost:3000",
    trustedOrigins: [
        "http://localhost:3000",
        "https://kuisseru-app.netlify.app",
        "https://*.netlify.app",
        "*"
    ]
});
