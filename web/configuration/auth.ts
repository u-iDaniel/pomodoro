import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import prisma from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Uncomment below line to have debug logs
  // debug: process.env.NODE_ENV === "development",
  providers: [Google],
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
      async signIn({ user }) {
        // console.log("Signing in user");
        // console.log(user);
        if (!user?.email) return false;

        let dbUser = await prisma.users.findUnique({
          where: { googleemail: user.email },
        });

        // Set isNewUser property on user object
        user.isNewUser = !dbUser;
        
        if (!dbUser) {
          dbUser = await prisma.users.create({
            data: {
              googleemail: user.email,
              name: user.name || "",
              imageicon: user.image || "",
            },
          });
        }
        
        user.isMember = dbUser?.ismember;
        user.id = dbUser?.userid;

        return true;
      },
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.isNewUser = user.isNewUser;
          token.isMember = user.isMember;
          token.image = user.image;
        }

        const dbUser = await prisma.users.findUnique({
          where: { userid: token.id as string },
        });
        token.isMember = dbUser?.ismember ?? false;
        return token;
      },
      async session({ session, token }) {
        // console.log("Session callback");
        if (session.user) {
          session.user.id = token.id as string;
          session.user.name = token.name as string;
          session.user.image = token.image as string;
          session.user.isNewUser = token.isNewUser as boolean;
          session.user.isMember = token.isMember as boolean;
        }
        // console.log("Session:", session);
        return session;
      },
  },
})