import { config } from "@/config/config";
import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google'

const { handlers: { GET, POST } } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: config.google.clientId! as string,
      clientSecret: config.google.clientSecret! as string,
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.username = session.user.name
          ?.split(' ')
          .join('')
          .toLowerCase() || '';
        session.user.uuid = token.sub || '';
      }
      return session;
    }
  }
});

export { GET, POST };