import '@testing-library/jest-dom';

declare module '@jest/expect' {
  interface Matchers<R = void> {
    toBeInTheDocument(): R;
  }
} 