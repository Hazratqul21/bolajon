import { getServerSession as nextAuthGetServerSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        name: { label: 'Name', type: 'text' },
        age: { label: 'Age', type: 'number' },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.age) {
          return null;
        }

        // For demo purposes, create or find user
        const user = await prisma.user.upsert({
          where: {
            email: `${credentials.name.toLowerCase().replace(/\s+/g, '')}@demo.com`,
          },
          update: {},
          create: {
            name: credentials.name,
            age: parseInt(credentials.age as string),
            email: `${credentials.name.toLowerCase().replace(/\s+/g, '')}@demo.com`,
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export async function getServerSession() {
  return await nextAuthGetServerSession(authOptions);
}
