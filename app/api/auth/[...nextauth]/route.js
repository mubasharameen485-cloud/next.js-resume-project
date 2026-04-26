
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const authOptions = {
  providers:[
    CredentialsProvider({
      name: "Credentials",
      
      credentials: {
        email: { label: "Email", type: "text" },
        rollNumber: { label: "Roll Number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials) {
       
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) throw new Error("Email nahi mili.");

        
        if (user.rollNumber !== credentials.rollNumber) {
          throw new Error("Roll Number galat hai.");
        }

        
        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordMatch) throw new Error("Password galat hai.");

        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          rollNumber: user.rollNumber
        };
      }
    })
  ],
  callbacks: {
    
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.rollNumber = user.rollNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.rollNumber = token.rollNumber;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET, 
  pages: { signIn: "/login" } 
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };