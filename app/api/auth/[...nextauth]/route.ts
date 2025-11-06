import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await connectDB();
        // Convert email to lowercase to match database schema
        const email = String(credentials.email).toLowerCase().trim();
        const user = await User.findOne({ email });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(String(credentials.password), user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: String(user._id),
          email: user.email || '',
          name: user.name || '',
          image: user.image || '',
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        const allowedEmail = process.env.ALLOWED_GOOGLE_EMAIL;
        if (user.email !== allowedEmail) {
          return false;
        }
      }

      if (account?.provider === 'facebook') {
        const allowedId = process.env.ALLOWED_FACEBOOK_ID;
        const facebookId = profile?.id || account.providerAccountId;
        if (facebookId !== allowedId && user.email?.includes(allowedId) === false) {
          return false;
        }
      }

      if (account && user) {
        try {
          await connectDB();
          const existingUser = await User.findOne({
            $or: [{ email: user.email }, { providerId: account.providerAccountId }],
          });

          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
            });
          } else {
            await User.findByIdAndUpdate(existingUser._id, {
              image: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
            });
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
        }
      }

      return true;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
};

export const { handlers, auth } = NextAuth(authOptions);

export const { GET, POST } = handlers;
