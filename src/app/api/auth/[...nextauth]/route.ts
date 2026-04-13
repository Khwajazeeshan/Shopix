import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import connectDB from "@/src/config/dbConfig";
import User from "@/src/models/user";
import { sendWelcomeEmail, sendLoginEmail } from "@/src/services/welcome";

export const authOptions: any = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      
    ],
    callbacks: {
        async signIn({ user, account }: any) {
            if (account?.provider === "google" || account?.provider === "github") {
                try {
                    await connectDB();
                    const { name, email } = user;
                    let dbUser = await User.findOne({ email });

                    if (!dbUser) {
                        dbUser = await User.create({
                            name,
                            email,
                            password: "",
                            isVerified: true,
                            role: "customer"
                        });

                        // New user: Send welcome email
                        await sendWelcomeEmail({
                            email: email!,
                            username: name!
                        });
                    } else {
                        // Existing user: Send login notification email
                        const loginTime = new Date().toLocaleString("en-US", { 
                            dateStyle: "full", 
                            timeStyle: "long" 
                        });
                        
                        await sendLoginEmail({
                            email: email!,
                            username: name!,
                            loginTime,
                            deviceInfo: `Google Login (${account?.provider || "OAuth"})`
                        });
                    }
                    user.id = dbUser._id.toString();
                    return true;
                } catch (error) {
                    console.error("Error in signIn callback:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/login",
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }