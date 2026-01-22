import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
                totp: { label: "2FA Code", type: "text" },
                passkeyAssertion: { label: "Passkey Assertion", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.username) {
                    return null;
                }

                const passkeyAssertion = credentials.passkeyAssertion && credentials.passkeyAssertion !== "undefined"
                    ? JSON.parse(String(credentials.passkeyAssertion))
                    : null;
                const isPasskeyLogin = !!passkeyAssertion;

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username },
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        password: true,
                        role: true,
                        totpEnabled: true,
                        totpSecret: true,
                        passkeyChallenge: true,
                        passkeyChallengeExpires: true,
                        passkeys: true,
                    },
                });

                if (!user) {
                    return null;
                }

                if (isPasskeyLogin) {
                    if (!user.passkeys.length || !user.passkeyChallenge) {
                        return null;
                    }
                    const now = new Date();
                    if (user.passkeyChallengeExpires && user.passkeyChallengeExpires < now) {
                        return null;
                    }

                    const { verifyPasskeyAuthentication } = await import("@/lib/passkeys");
                    try {
                        const { verification } = await verifyPasskeyAuthentication(credentials.username, passkeyAssertion);
                        if (!verification.verified) {
                            return null;
                        }
                    } catch {
                        return null;
                    }
                } else {
                    if (!credentials.password) return null;

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) {
                        return null;
                    }

                    if (user.totpEnabled) {
                        const token = credentials.totp;
                        if (!token || !user.totpSecret) {
                            return null;
                        }

                        const { verifyTotpToken } = await import("@/lib/totp");
                        const isValidToken = verifyTotpToken(token, user.totpSecret);
                        if (!isValidToken) {
                            return null;
                        }
                    }
                }

                return {
                    id: user.id,
                    name: user.displayName || user.username,
                    username: user.username,
                    role: user.role,
                    totpEnabled: user.totpEnabled,
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.totpEnabled = token.totpEnabled as boolean;
                if (token.name) session.user.name = token.name as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.totpEnabled = (user as any).totpEnabled;
                token.name = (user as any).name;
            }
            return token;
        },
    },
};
