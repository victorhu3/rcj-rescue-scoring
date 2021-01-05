module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  plugins: [
    'prettier'
  ],
  extends: [
    'airbnb-base',
    'prettier/@typescript-eslint', 
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'camelcase': 'off',
    'eqeqeq': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'func-names': 'off'
  },
};
