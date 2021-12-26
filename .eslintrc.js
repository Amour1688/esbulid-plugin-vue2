module.exports = {
  root: true,
  parserOptions: {
    project: './tsconfig.json'
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'airbnb-typescript/base',
  ],
  rules: {
    'import/no-extraneous-dependencies': 0
  }
}
