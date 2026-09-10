module.exports = {
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: {
    // Unit tests ما خصهاش تعتمد على @prisma/client الحقيقية (ولا Postgres شغال)
    // انظر src/__mocks__/prisma-client-mock.ts للتفاصيل
    '^@prisma/client$': '<rootDir>/__mocks__/prisma-client-mock.ts',
  },
  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', decorators: true },
          target: 'es2022',
          transform: { legacyDecorator: true, decoratorMetadata: true },
        },
      },
    ],
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
};
