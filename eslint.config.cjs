const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'eslint.config.cjs',
      'src/**/*.js',
      'src/**/*.d.ts',
      'src/**/*.map',
    ],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
);
