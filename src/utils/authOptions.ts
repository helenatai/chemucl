import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const makeTokenRequest = async (context: any) => {
  const response = await fetch(
    `${context.provider.token.url}?code=${context.params.code}&client_id=${context.client.client_id}&client_secret=${context.client.client_secret}`
  ).then((res) => res.json());

  return {
    tokens: {
      access_token: response.access_token || "",
      token_type: "Bearer",
      id_token: undefined,
      refresh_token: undefined,
      expires_at: undefined,
      session_state: undefined
    }
  };
};

const makeUserInfoRequest = async (context: any) => {
  const response = await fetch(
    `${context.provider.userinfo.url}?client_secret=${context.client.client_secret}&token=${context.tokens.access_token}`
  );
  return response.json();
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter both email and password');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            throw new Error('Invalid email or password');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          if (!user.activeStatus) {
            throw new Error('Your account is currently inactive. Please contact an administrator.');
          }

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            permission: user.permission
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
      }
    }),
    {
      id: 'uclapi',
      name: 'UCL API',
      type: 'oauth',
      authorization: 'https://uclapi.com/oauth/authorise',
      token: {
        url: 'https://uclapi.com/oauth/token',
        async request(context) {
          const filteredTokens = await makeTokenRequest(context);
          return filteredTokens; 
        }
      },
      userinfo: {
        url: 'https://uclapi.com/oauth/user/data',
        async request(context) {
          return await makeUserInfoRequest(context);
        }
      },
      profile(profile) {
        return {
          id: profile.cn,
          name: profile.full_name,
          email: profile.email,
          permission: 'USER'
        };
      },
      clientId: process.env.UCL_API_CLIENT_ID,
      clientSecret: process.env.UCL_API_CLIENT_SECRET
    }
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'uclapi' && profile?.email) {
        try {
          const uclEmail = profile.email;
          
          const existingUser = await prisma.user.findUnique({
            where: { email: uclEmail }
          });

          if (!existingUser) {
            return false; 
          }

          if (!existingUser.activeStatus) {
            return false;
          }

          const accountData = {
            userId: existingUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            token_type: account.token_type
          };

          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            update: accountData,
            create: accountData,
          });

          user.id = existingUser.id;
          user.name = existingUser.name;
          user.email = existingUser.email;
          user.permission = existingUser.permission;
          
          return true;
        } catch (error) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (trigger === 'signIn' && user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.permission = user.permission;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.permission = token.permission as string;
        (session as any).provider = token.provider;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl + '/inventory-page';
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.REACT_APP_JWT_TIMEOUT)
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false
};