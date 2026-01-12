import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_EMAILS = [
    "aaron.mcgrean@gmail.com",
    "andrew.mcgrean@gmail.com"
];

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;
            const isAllowed = ALLOWED_EMAILS.includes(user.email.toLowerCase());
            return isAllowed;
        },
        async session({ session }) {
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    secret: process.env.AUTH_SECRET,
    trustHost: true,
});
