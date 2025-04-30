import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      permission: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    permission: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    permission: string;
  }
}
