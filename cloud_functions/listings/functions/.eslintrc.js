module.exports = {
  root: true,
  env: {
    es2017: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'google',
  ],
  rules: {
    'quotes': ['error', 'single'],
    'max-len': 1,
    'no-unused-vars': 1,
    'object-curly-spacing': ['error', 'always'],
  },
};
