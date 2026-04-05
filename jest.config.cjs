module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'database/**/*.ts',
    '!src/docs/**',
    '!src/types/**',
  ],
  clearMocks: true,
  coverageDirectory: 'coverage',
};
