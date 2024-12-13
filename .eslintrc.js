module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    // prettier must be the last in extends
    'prettier',
  ],
  ignorePatterns: ['.eslintrc.js', 'seed/mongo-init.js'],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'prettier/prettier': ['error'],
    semi: 'error',
    '@typescript-eslint/no-unused-vars': ['error'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.test.ts', '**/*.spec.ts', '**/*e2e-spec.ts'],
      },
    ],
    'class-methods-use-this': 'off',
    'import/prefer-default-export': 'off', // Отключаем правило
    'no-useless-constructor': 'off',
    'no-underscore-dangle': 'off',
    'no-console': ['warn', { allow: ['info'] }],
    'no-shadow': 'off',
    'consistent-return': 'warn',
  },
};
