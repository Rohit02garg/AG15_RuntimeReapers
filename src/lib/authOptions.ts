import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();

                try {
                    const identifier = credentials.identifier;
                    let user;

                    if (identifier === 'admin') {
                        // Admin strictly uses username
                        user = await User.findOne({ username: 'admin', role: 'MANUFACTURER' });
                    } else if (identifier.includes('@')) {
                        // Everyone else uses email
                        user = await User.findOne({ email: identifier });
                    }

                    if (!user) {
                        throw new Error("Invalid credentials or user not found");
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (isPasswordCorrect) {
                        return user;
                    } else {
                        throw new Error("Incorrect Password");
                    }
                } catch (err: any) {
                    throw new Error(err.message);
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.role = (user as any).role;
                token.username = (user as any).username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.role = token.role;
                session.user.username = token.username;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
