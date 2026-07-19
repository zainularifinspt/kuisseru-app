import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { admin } from "better-auth/plugins";
import nodemailer from "nodemailer";

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
        enabled: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: parseInt(process.env.SMTP_PORT || "587"),
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                }
            });

            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: user.email,
                subject: "Reset Password AsthaQuizz",
                html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #0052FF;">Reset Password AsthaQuizz</h2>
                <p>Halo,</p>
                <p>Anda telah meminta untuk mereset password akun AsthaQuizz Anda. Klik tombol di bawah ini untuk mereset password Anda:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" style="background-color: #0052FF; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p style="color: #666; font-size: 14px;">Jika tombol tidak berfungsi, Anda juga bisa menyalin dan menempelkan URL berikut ke browser Anda:</p>
                <p style="word-break: break-all; color: #666; font-size: 14px;">${url}</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px; text-align: center;">Jika Anda tidak meminta ini, abaikan email ini.</p>
                </div>`
            });
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
    plugins: [
        admin()
    ],
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google"],
            requireLocalEmailVerified: false
        }
    },
    secret: process.env.BETTER_AUTH_SECRET || "fallback_secret_for_development_only_12345",
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.URL || "http://localhost:3000",
    trustedOrigins: [
        "http://localhost:3000",
        "https://asthaquizz.netlify.app",
        "https://*.netlify.app",
        "*"
    ]
});
