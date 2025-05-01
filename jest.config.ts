import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^db/(.*)$': '<rootDir>/src/db/$1',
    '^db$': '<rootDir>/src/db',
    '^actions/(.*)$': '<rootDir>/src/actions/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};

export default config; 