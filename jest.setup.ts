import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn()
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  }
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        permission: 'ADMIN'
      }
    },
    status: 'authenticated'
  })),
  getSession: jest.fn(() => null),
  signIn: jest.fn(),
  signOut: jest.fn()
}));
